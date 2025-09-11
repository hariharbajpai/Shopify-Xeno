// config/shopify.js
import crypto from 'crypto';

// ---- helpers to read env lazily (avoid crashing at import time) ----
function getEnv(k, { required = true } = {}) {
  const v = process.env[k];
  if (!v && required) throw new Error(`Missing env: ${k}`);
  return v;
}

function apiVersion() {
  return process.env.SHOPIFY_API_VERSION || '2024-10';
}

// ---- 1) OAuth: build install URL for a store ----
export function buildInstallUrl(shop) {
  if (!shop || !/\.myshopify\.com$/.test(shop)) {
    throw new Error('Invalid shop domain');
  }
  const clientId = getEnv('SHOPIFY_API_KEY');
  const scopes = getEnv('SHOPIFY_SCOPES');
  const redirectUri = getEnv('SHOPIFY_REDIRECT_URI');

  const nonce = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state: nonce,
  });

  return {
    url: `https://${shop}/admin/oauth/authorize?${params.toString()}`,
    state: nonce, // persist this per-session to validate later
  };
}

// ---- 2) OAuth: verify HMAC on callback query ----
export function verifyOAuthCallbackHmac(queryObj) {
  // queryObj is req.query (object). Must include hmac
  const hmac = queryObj.hmac;
  if (!hmac) return false;

  // remove hmac & signature, build sorted query string
  const { hmac: _h, signature, ...rest } = queryObj;
  const message = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${Array.isArray(rest[k]) ? rest[k].join(',') : rest[k]}`)
    .join('&');

  const secret = getEnv('SHOPIFY_API_SECRET');
  const digest = crypto
    .createHmac('sha256', secret)
    .update(message, 'utf8')
    .digest('hex');

  // timing-safe compare
  return crypto.timingSafeEqual(Buffer.from(digest, 'utf8'), Buffer.from(hmac, 'utf8'));
}

// ---- 3) OAuth: exchange code for permanent access token ----
export async function exchangeCodeForToken(shop, code) {
  const clientId = getEnv('SHOPIFY_API_KEY');
  const clientSecret = getEnv('SHOPIFY_API_SECRET');

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
  // { access_token, scope }
  return data;
}

// ---- 4) Webhook: verify X-Shopify-Hmac-Sha256 header on raw body ----
export function verifyWebhookHmac(rawBodyBuffer, headerHmac) {
  if (!headerHmac) return false;
  const secret = getEnv('SHOPIFY_API_SECRET');
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

// ---- 5) Per-tenant Shopify REST client ----
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
    // Return data + pagination links if any
    return { data, link: res.headers.get('link') || null };
  }

  // Simple cursor pagination (rel="next" header)
  function parseNextLink(linkHeader) {
    if (!linkHeader) return null;
    // Link: <https://shop.myshopify.com/.../orders.json?page_info=xxxx&limit=250>; rel="next"
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

// ---- 6) Webhook registration helper ----
export async function registerWebhooks({ shop, accessToken, topics = [] }) {
  const client = buildShopifyClient({ shop, accessToken });
  const callbackBase = getEnv('SHOPIFY_WEBHOOK_URI');

  const results = [];
  for (const topic of topics) {
    // Each topic posts to the same endpoint; route by topic in your controller
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

/*
USAGE QUICK NOTES:

// Begin install:
const { url, state } = buildInstallUrl('7qnwxj-p4.myshopify.com'); // save `state` in session, redirect to `url`

// In callback controller:
if (!verifyOAuthCallbackHmac(req.query)) throw new Error('Bad HMAC');
if (req.query.state !== req.session.state) throw new Error('Bad state');
const { access_token } = await exchangeCodeForToken(req.query.shop, req.query.code);
// save access_token against Tenant(shopDomain)

// Build a client for a tenant:
const client = buildShopifyClient({ shop: tenant.shopDomain, accessToken: tenant.accessToken });
const products = await client.get('/products.json', { query: { limit: 50 } });

// Verify webhook in route (raw body needed):
const isValid = verifyWebhookHmac(req.rawBody, req.get('X-Shopify-Hmac-Sha256'));

// Register webhooks after install:
await registerWebhooks({
  shop: tenant.shopDomain,
  accessToken: tenant.accessToken,
  topics: ['orders/create', 'customers/create', 'products/update', 'app/uninstalled'],
});
*/
