import { markTenantSuspended } from '../repositories/tenant.repo.js';
import { handleWebhook } from '../services/webhook.service.js';

export const handleShopifyWebhook = async (req, res, next) => {
  try {
    const topic = req.get('X-Shopify-Topic');
    const shop = req.get('X-Shopify-Shop-Domain');
    const payload = req.body;

    console.log(`Webhook received: ${topic} from ${shop}`);

    await handleWebhook(topic, shop, payload);

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    next(error);
  }
};