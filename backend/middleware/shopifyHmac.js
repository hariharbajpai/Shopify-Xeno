// middleware/shopifyHmac.js
import { verifyWebhookHmac } from '../config/shopify.js';
import express from 'express';

export function verifyShopifyWebhook(req, res, next) {
  try {
    const hmac = req.get('X-Shopify-Hmac-Sha256') || '';
    
    // Get raw body from the rawBody property set by express.raw()
    const rawBody = req.rawBody || Buffer.from('{}');
    
    // Parse JSON body manually since we're using raw parser
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

// Middleware to capture raw body for HMAC verification
// This should be used instead of express.json() for webhook routes
export const webhookRawBodyParser = express.raw({ 
  type: 'application/json',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
});
