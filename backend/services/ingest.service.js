import { buildShopifyClient } from '../config/shopify.js';
import { upsertProducts } from '../repositories/product.repo.js';
import { upsertCustomers } from '../repositories/customer.repo.js';
import { upsertOrdersWithItems } from '../repositories/order.repo.js';

export async function backfillProducts(tenant) {
  const client = buildShopifyClient({ shop: tenant.shopDomain, accessToken: tenant.accessToken });
  let total = 0;
  for await (const page of client.paginate('/products.json', { query: { fields: 'id,title,status,variants' }, limit: 250 })) {
    total += await upsertProducts(tenant.id, page.products || []);
  }
  return total;
}

export async function backfillCustomers(tenant) {
  const client = buildShopifyClient({ shop: tenant.shopDomain, accessToken: tenant.accessToken });
  let total = 0;
  for await (const page of client.paginate('/customers.json', { query: { fields: 'id,email,first_name,last_name,total_spent,orders_count' }, limit: 250 })) {
    total += await upsertCustomers(tenant.id, page.customers || []);
  }
  return total;
}

export async function backfillOrders(tenant, { since } = {}) {
  const client = buildShopifyClient({ shop: tenant.shopDomain, accessToken: tenant.accessToken });
  let total = 0;
  const query = { status: 'any', fields: 'id,name,currency,financial_status,fulfillment_status,total_price,subtotal_price,total_tax,total_discounts,processed_at,customer,line_items' };
  if (since) query.created_at_min = new Date(since).toISOString();

  for await (const page of client.paginate('/orders.json', { query, limit: 250 })) {
    total += await upsertOrdersWithItems(tenant.id, page.orders || []);
  }
  return total;
}

export async function backfillAll(tenant, opts = {}) {
  const [p, c, o] = await Promise.all([
    backfillProducts(tenant),
    backfillCustomers(tenant),
    backfillOrders(tenant, opts),
  ]);
  return { products: p, customers: c, orders: o };
}
