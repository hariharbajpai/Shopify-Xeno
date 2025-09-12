import { Router } from 'express';
import { startShopifyInstall, shopifyCallback } from '../controllers/shopify.controller.js';
import { handleShopifyWebhook } from '../controllers/webhook.controller.js';
import { verifyShopifyWebhook, webhookRawBodyParser } from '../middleware/shopifyHmac.js';
import express from 'express';

const router = Router();

router.get('/auth/shopify', startShopifyInstall);

router.get('/auth/shopify/callback', shopifyCallback);

router.post('/webhooks/shopify', 
  webhookRawBodyParser,
  verifyShopifyWebhook, 
  handleShopifyWebhook
);

export default router;
