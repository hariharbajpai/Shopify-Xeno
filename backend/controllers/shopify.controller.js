import * as shopify from '../services/shopify.service.js';
import { verifyOAuthCallbackHmac, exchangeCodeForToken, registerWebhooks } from '../config/shopify.js';
import { upsertTenant } from '../repositories/tenant.repo.js';

export const startShopifyInstall = async (req, res, next) => {
  try {
    const shop = String(req.query.shop || '').trim().toLowerCase();
    if (!shop || !shop.endsWith('.myshopify.com')) {
      return res.status(400).json({ error: 'Invalid or missing shop domain' });
    }
    const { url } = shopify.getInstallUrl(shop);
    return res.redirect(url);
  } catch (err) {
    next(err);
  }
};

export const shopifyCallback = async (req, res, next) => {
  try {
    // 1) Verify HMAC on the callback query
    const isValid = verifyOAuthCallbackHmac(req.query);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid HMAC' });
    }

    const shop = String(req.query.shop || '').trim().toLowerCase();
    const code = String(req.query.code || '');

    if (!shop || !code) {
      return res.status(400).json({ error: 'Missing shop or code' });
    }

    // 2) Exchange code for access token
    const tokenResp = await exchangeCodeForToken(shop, code);
    const accessToken = tokenResp.access_token;
    const scope = tokenResp.scope;

    // 3) Fetch shop info for display & bookkeeping
    const shopInfo = await shopify.getShopInfo(shop, accessToken);

    // 4) Persist or update tenant
    const tenant = await upsertTenant({
      shopDomain: shop,
      accessToken,
      scopes: scope,
      shopName: shopInfo?.shop?.name ?? shop,
      email: shopInfo?.shop?.email ?? null,
      currency: shopInfo?.shop?.currency ?? 'USD',
      timezone: shopInfo?.shop?.iana_timezone ?? null,
      status: 'active'
    });

    // 5) Register webhooks for real-time updates
    try {
      const webhookTopics = [
        'orders/create',
        'orders/updated', 
        'orders/fulfilled',
        'orders/cancelled',
        'customers/create',
        'customers/update',
        'products/create',
        'products/update',
        'products/delete',
        'app/uninstalled'
      ];
      
      const webhookResults = await registerWebhooks({
        shop,
        accessToken,
        topics: webhookTopics
      });
      
      console.log(`Registered ${webhookResults.filter(r => r.ok).length}/${webhookResults.length} webhooks for ${shop}`);
    } catch (webhookError) {
      console.error('Webhook registration failed:', webhookError.message);
      // Continue with install even if webhooks fail
    }

    // 6) Redirect to your frontend to continue onboarding
    const redirectUrl = process.env.FRONTEND_SUCCESS_URL || '/';
    return res.redirect(`${redirectUrl}?installed_shop=${encodeURIComponent(shop)}&tenantId=${tenant.id}`);
  } catch (err) {
    next(err);
  }
};
