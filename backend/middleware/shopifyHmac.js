// middleware/shopifyHmac.js
import { verifyWebhookHmac } from '../config/shopify.js';

export function verifyShopifyWebhook(req, res, next) {
  try {
    const hmac = req.get('X-Shopify-Hmac-Sha256') || '';
    
    // Get raw body - need to capture this before JSON parsing
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    
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
export function captureRawBody(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.rawBody = Buffer.from(data);
    next();
  });
}
