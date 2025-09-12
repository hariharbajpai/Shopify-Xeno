import crypto from 'crypto';
import { env } from '../utils/env.js';

function getEnv(k, { required = true } = {}) {
  const v = process.env[k];
  if (!v && required) throw new Error(`Missing env: ${k}`);
  return v;
}

function apiVersion() {
  return env.SHOPIFY_API_VERSION || '2024-10';
}

export function buildInstallUrl(shop) {
  if (!shop || !/\.myshopify\.com$/.test(shop)) {
    throw new Error('Invalid shop domain');
  }
  const clientId = env.SHOPIFY_API_KEY;
  const scopes = env.SHOPIFY_SCOPES;
  const redirectUri = env.SHOPIFY_REDIRECT_URI;

  const nonce = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state: nonce,
  });

  return {
    url: `https://${shop}/admin/oauth/authorize?${params.toString()}`,
    state: nonce,
  };
}

export function verifyOAuthCallbackHmac(queryObj) {
  const hmac = queryObj.hmac;
  if (!hmac) return false;

  const { hmac: _h, signature, ...rest } = queryObj;
  const message = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${Array.isArray(rest[k]) ? rest[k].join(',') : rest[k]}`)
    .join('&');

  const secret = env.SHOPIFY_API_SECRET;
  const digest = crypto
    .createHmac('sha256', secret)
    .update(message, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(digest, 'utf8'), Buffer.from(hmac, 'utf8'));
}

export async function exchangeCodeForToken(shop, code) {
  const clientId = env.SHOPIFY_API_KEY;
  const clientSecret = env.SHOPIFY_API_SECRET;

  const url = `https://${shop}/admin/oauth/access_token`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data;
}

export function verifyWebhookHmac(rawBodyBuffer, headerHmac) {
  if (!headerHmac) return false;
  const secret = env.SHOPIFY_API_SECRET;
  const digest = crypto
    .createHmac('sha256', secret)
    .update(rawBodyBuffer)
    .digest('base64');

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(headerHmac));
  } catch {
    return false;
  }
}

export function buildShopifyClient({ shop, accessToken }) {
  if (!shop || !accessToken) throw new Error('shop and accessToken are required');

  const base = `https://${shop}/admin/api/${apiVersion()}`;

  async function request(path, { method = 'GET', query, body, headers } = {}) {
    const url = new URL(`${base}${path}`);
    if (query && typeof query === 'object') {
      Object.entries(query).forEach(([k, v]) => url.searchParams.append(k, v));
    }

    const res = await fetch(url, {
      method,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Shopify ${method} ${path} failed (${res.status}): ${text}`);
    }

    const data = await res.json().catch(() => ({}));
    return { data, link: res.headers.get('link') || null };
  }

  function parseNextLink(linkHeader) {
    if (!linkHeader) return null;
    const parts = linkHeader.split(',');
    for (const p of parts) {
      const [urlPart, relPart] = p.split(';').map((s) => s.trim());
      if (relPart?.includes('rel="next"')) {
        const m = urlPart.match(/<([^>]+)>/);
        if (m) return new URL(m[1]);
      }
    }
    return null;
  }

  async function *paginate(path, { query, limit = 250 } = {}) {
    let next = new URL(`${base}${path}`);
    if (query) Object.entries(query).forEach(([k, v]) => next.searchParams.append(k, v));
    next.searchParams.set('limit', String(limit));

    while (next) {
      const res = await fetch(next, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Shopify GET ${path} failed (${res.status}): ${text}`);
      }
      const json = await res.json();
      yield json;
      next = parseNextLink(res.headers.get('link'));
    }
  }

  return {
    get: (path, opts) => request(path, { method: 'GET', ...(opts || {}) }),
    post: (path, body, opts) => request(path, { method: 'POST', body, ...(opts || {}) }),
    put: (path, body, opts) => request(path, { method: 'PUT', body, ...(opts || {}) }),
    delete: (path, opts) => request(path, { method: 'DELETE', ...(opts || {}) }),
    paginate,
  };
}

export async function registerWebhooks({ shop, accessToken, topics = [] }) {
  const client = buildShopifyClient({ shop, accessToken });
  const callbackBase = env.SHOPIFY_WEBHOOK_URI;

  const results = [];
  for (const topic of topics) {
    const body = {
      webhook: {
        topic,
        address: callbackBase,
        format: 'json',
      },
    };

    try {
      const res = await client.post(`/webhooks.json`, body);
      results.push({ topic, ok: true, id: res.data?.webhook?.id });
    } catch (e) {
      results.push({ topic, ok: false, error: e.message });
    }
  }
  return results;
}

 