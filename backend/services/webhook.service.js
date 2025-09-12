import { logWebhookEvent } from '../repositories/webhookEvent.repo.js';
import { buildShopifyClient } from '../config/shopify.js';
import { upsertProducts } from '../repositories/product.repo.js';
import { upsertCustomers } from '../repositories/customer.repo.js';
import { upsertOrdersWithItems } from '../repositories/order.repo.js';
import { findByShopOrTenantKey } from '../repositories/tenant.repo.js';

export async function handleWebhook(topic, shopDomain, payload) {
  const tenant = await findByShopOrTenantKey(shopDomain);
  if (!tenant || tenant.status !== 'active') {
    throw new Error('Tenant not found or inactive for webhook');
  }

  await logWebhookEvent(tenant.id, topic, shopDomain, payload);

  const client = buildShopifyClient({ shop: tenant.shopDomain, accessToken: tenant.accessToken });

  switch (topic) {
    case 'products/create':
    case 'products/updated': {
      // Fetch fresh product (ensure completeness)
      const pid = payload.id;
      const res = await client.get(`/products/${pid}.json`);
      await upsertProducts(tenant.id, [res.data.product ?? payload]);
      break;
    }
    case 'customers/create':
    case 'customers/updated': {
      const cid = payload.id;
      const res = await client.get(`/customers/${cid}.json`);
      await upsertCustomers(tenant.id, [res.data.customer ?? payload]);
      break;
    }
    case 'orders/create':
    case 'orders/updated': {
      const oid = payload.id;
      const res = await client.get(`/orders/${oid}.json`, { query: { fields: 'id,name,currency,financial_status,fulfillment_status,total_price,subtotal_price,total_tax,total_discounts,processed_at,customer,line_items' } });
      await upsertOrdersWithItems(tenant.id, [res.data.order ?? payload]);
      break;
    }
    case 'app/uninstalled': {
      // Already handled: mark tenant suspended in your controller
      break;
    }
    default:
      // ignore others for now
      break;
  }
}
