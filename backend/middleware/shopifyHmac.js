import { verifyWebhookHmac } from '../config/shopify.js';
import express from 'express';

export function verifyShopifyWebhook(req, res, next) {
  try {
    const hmac = req.get('X-Shopify-Hmac-Sha256') || '';
    
    const rawBody = req.rawBody || Buffer.from('{}');
    
    try {
      req.body = JSON.parse(rawBody.toString());
    } catch (parseError) {
      req.body = {};
    }
    
    const isValid = verifyWebhookHmac(rawBody, hmac);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook HMAC' });
    }
    
    next();
  } catch (err) {
    next(err);
  }
}

export const webhookRawBodyParser = express.raw({ 
  type: 'application/json',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
});
