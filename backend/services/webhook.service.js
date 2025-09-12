import { logWebhookEvent } from '../repositories/webhookEvent.repo.js';
import { buildShopifyClient } from '../config/shopify.js';
import { upsertProducts } from '../repositories/product.repo.js';
import { upsertCustomers } from '../repositories/customer.repo.js';
import { upsertOrdersWithItems } from '../repositories/order.repo.js';
import { findByShopOrTenantKey, markTenantSuspended } from '../repositories/tenant.repo.js';
import { cache } from '../config/redis.js';

export async function handleWebhook(topic, shopDomain, payload) {
  const tenant = await findByShopOrTenantKey(shopDomain);
  if (!tenant || tenant.status !== 'active') {
    throw new Error('Tenant not found or inactive for webhook');
  }

  await logWebhookEvent(tenant.id, topic, shopDomain, payload);

  const client = buildShopifyClient({ shop: tenant.shopDomain, accessToken: tenant.accessToken });

  switch (topic) {
    case 'products/create':
    case 'products/update':
    case 'products/delete': {
      // Fetch fresh product (ensure completeness)
      const pid = payload.id;
      const res = await client.get(`/products/${pid}.json`);
      await upsertProducts(tenant.id, [res.data.product ?? payload]);
      
      // Invalidate product-related cache
      await cache.del(cache.tenantKey(tenant.id, 'products'));
      await cache.del(cache.tenantKey(tenant.id, 'insights', 'top-products'));
      await cache.del(cache.tenantKey(tenant.id, 'insights', 'summary'));
      
      break;
    }
    case 'customers/create':
    case 'customers/update': {
      const cid = payload.id;
      const res = await client.get(`/customers/${cid}.json`);
      await upsertCustomers(tenant.id, [res.data.customer ?? payload]);
      
      // Invalidate customer-related cache
      await cache.del(cache.tenantKey(tenant.id, 'customers'));
      await cache.del(cache.tenantKey(tenant.id, 'insights', 'top-customers'));
      await cache.del(cache.tenantKey(tenant.id, 'insights', 'summary'));
      
      break;
    }
    case 'orders/create':
    case 'orders/updated':
    case 'orders/fulfilled':
    case 'orders/cancelled': {
      const oid = payload.id;
      const res = await client.get(`/orders/${oid}.json`, { query: { fields: 'id,name,currency,financial_status,fulfillment_status,total_price,subtotal_price,total_tax,total_discounts,processed_at,customer,line_items' } });
      await upsertOrdersWithItems(tenant.id, [res.data.order ?? payload]);
      
      // Invalidate order-related cache
      await cache.del(cache.tenantKey(tenant.id, 'orders'));
      await cache.del(cache.tenantKey(tenant.id, 'insights', 'recent-orders'));
      await cache.del(cache.tenantKey(tenant.id, 'insights', 'orders-by-date'));
      await cache.del(cache.tenantKey(tenant.id, 'insights', 'summary'));
      
      break;
    }
    case 'app/uninstalled': {
      // Mark tenant as suspended to stop processing
      await markTenantSuspended(shopDomain);
      console.log(`Marked tenant ${shopDomain} as suspended due to app uninstall`);
      break;
    }
    default:
      // ignore others for now
      break;
  }
}
