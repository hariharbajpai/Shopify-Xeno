import { Router } from 'express';
import { startShopifyInstall, shopifyCallback } from '../controllers/shopify.controller.js';
import { handleShopifyWebhook } from '../controllers/webhook.controller.js';
import { verifyShopifyWebhook, webhookRawBodyParser } from '../middleware/shopifyHmac.js';
import express from 'express';

const router = Router();

// Start OAuth: /auth/shopify?shop={your-shop}.myshopify.com
router.get('/auth/shopify', startShopifyInstall);

// OAuth callback: Shopify redirects here
router.get('/auth/shopify/callback', shopifyCallback);

// Webhook endpoint with proper raw body parsing for HMAC verification
router.post('/webhooks/shopify', 
  webhookRawBodyParser, // Parse as raw buffer and capture for HMAC
  verifyShopifyWebhook, 
  handleShopifyWebhook
);

export default router;
