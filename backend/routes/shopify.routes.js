import { Router } from 'express';
import { startShopifyInstall, shopifyCallback } from '../controllers/shopify.controller.js';
import { handleShopifyWebhook } from '../controllers/webhook.controller.js';
import { verifyShopifyWebhook, captureRawBody } from '../middleware/shopifyHmac.js';

const router = Router();

// Start OAuth: /auth/shopify?shop={your-shop}.myshopify.com
router.get('/auth/shopify', startShopifyInstall);

// OAuth callback: Shopify redirects here
router.get('/auth/shopify/callback', shopifyCallback);

// Webhook endpoint (with raw body capture for HMAC verification)
router.post('/webhooks/shopify', captureRawBody, verifyShopifyWebhook, handleShopifyWebhook);

export default router;
