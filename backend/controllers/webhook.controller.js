// controllers/webhook.controller.js
import { markTenantSuspended } from '../repositories/tenant.repo.js';

export const handleShopifyWebhook = async (req, res, next) => {
  try {
    const topic = req.get('X-Shopify-Topic');
    const shop = req.get('X-Shopify-Shop-Domain');
    const payload = req.body;

    console.log(`📥 Webhook received: ${topic} from ${shop}`);

    switch (topic) {
      case 'app/uninstalled':
        await handleAppUninstalled(shop, payload);
        break;
      
      case 'orders/create':
      case 'orders/updated':
        await handleOrderEvent(shop, payload, topic);
        break;
      
      case 'customers/create':
      case 'customers/updated':
        await handleCustomerEvent(shop, payload, topic);
        break;
      
      case 'products/create':
      case 'products/updated':
        await handleProductEvent(shop, payload, topic);
        break;
      
      default:
        console.log(`⚠️ Unhandled webhook topic: ${topic}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    next(error);
  }
};

async function handleAppUninstalled(shop, payload) {
  try {
    await markTenantSuspended(shop);
    console.log(`✅ Marked tenant ${shop} as suspended due to app uninstall`);
  } catch (error) {
    console.error(`❌ Failed to suspend tenant ${shop}:`, error.message);
  }
}

async function handleOrderEvent(shop, payload, topic) {
  // TODO: Implement order sync logic
  console.log(`📦 Order event ${topic} for ${shop}:`, payload.id);
}

async function handleCustomerEvent(shop, payload, topic) {
  // TODO: Implement customer sync logic
  console.log(`👤 Customer event ${topic} for ${shop}:`, payload.id);
}

async function handleProductEvent(shop, payload, topic) {
  // TODO: Implement product sync logic
  console.log(`🛍️ Product event ${topic} for ${shop}:`, payload.id);
}