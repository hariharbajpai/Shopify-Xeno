// services/shopify.service.js
import { buildInstallUrl, exchangeCodeForToken, verifyOAuthCallbackHmac, buildShopifyClient } from '../config/shopify.js';
import { upsertTenant } from '../repositories/tenant.repo.js';
import { env } from '../utils/env.js';

export function getInstallUrl(shop) {
  if (!shop || !shop.endsWith('.myshopify.com')) {
    throw new Error('Invalid shop domain');
  }
  return buildInstallUrl(shop);
}

export async function handleOAuthCallback(query) {
  // Verify query HMAC
  const isValid = verifyOAuthCallbackHmac(query);
  if (!isValid) throw new Error('Invalid HMAC');

  const { code, shop, scope } = query;
  if (!code || !shop) throw new Error('Missing code/shop');

  // Exchange code ➜ token
  const { access_token, scope: grantedScopes } = await exchangeCodeForToken(shop, code);

  // Upsert tenant
  const tenant = await upsertTenant({
    shopDomain: shop,
    accessToken: access_token,
    scopes: grantedScopes || scope || env.SHOPIFY_SCOPES,
    status: 'active',
  });

  return { tenant };
}

export async function getShopInfo(shop, accessToken) {
  try {
    const client = buildShopifyClient({ shop, accessToken });
    const response = await client.get('/shop.json');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch shop info:', error.message);
    return null;
  }
}
