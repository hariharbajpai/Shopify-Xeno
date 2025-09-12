import { buildShopifyClient } from '../config/shopify.js';
import { upsertProducts } from '../repositories/product.repo.js';
import { upsertCustomers } from '../repositories/customer.repo.js';
import { upsertOrdersWithItems } from '../repositories/order.repo.js';
import { getTenantCursors, setTenantCursors, findTenantByShopDomain, upsertTenant } from '../repositories/tenant.repo.js';
import { cache } from '../config/redis.js';
import { env } from '../utils/env.js';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function withRateLimit(fn, attempt = 0) {
  try {
    const out = await fn();
    await sleep(500);
    return out;
  } catch (e) {
    const msg = e?.message || '';
    const isRetryable = /429|5\d\d|ETIMEDOUT|ECONNRESET/i.test(msg);
    if (isRetryable && attempt < 5) {
      const backoff = Math.min(16000, 500 * Math.pow(2, attempt));
      await sleep(backoff);
      return withRateLimit(fn, attempt + 1);
    }
    throw e;
  }
}

export async function backfillProducts(tenant) {
  const client = buildShopifyClient({ shop: tenant.shopDomain, accessToken: tenant.accessToken });
  let total = 0;
  for await (const page of client.paginate('/products.json', { query: { fields: 'id,title,status,variants' }, limit: 250 })) {
    total += await withRateLimit(() => upsertProducts(tenant.id, page.products || []));
  }
  
  await cache.del(cache.tenantKey(tenant.id, 'products'));
  await cache.del(cache.tenantKey(tenant.id, 'insights', 'top-products'));
  
  return total;
}

export async function backfillCustomers(tenant) {
  const client = buildShopifyClient({ shop: tenant.shopDomain, accessToken: tenant.accessToken });
  let total = 0;
  for await (const page of client.paginate('/customers.json', { query: { fields: 'id,email,first_name,last_name,total_spent,orders_count' }, limit: 250 })) {
    total += await withRateLimit(() => upsertCustomers(tenant.id, page.customers || []));
  }
  
  // Invalidate customer-related cache
  await cache.del(cache.tenantKey(tenant.id, 'customers'));
  await cache.del(cache.tenantKey(tenant.id, 'insights', 'top-customers'));
  
  return total;
}

export async function backfillOrders(tenant, { since } = {}) {
  const client = buildShopifyClient({ shop: tenant.shopDomain, accessToken: tenant.accessToken });
  let total = 0;
  const query = {
    status: 'any',
    fields: 'id,name,currency,financial_status,fulfillment_status,total_price,subtotal_price,total_tax,total_discounts,processed_at,customer,line_items',
  };
  if (since) query.created_at_min = new Date(since).toISOString();

  for await (const page of client.paginate('/orders.json', { query, limit: 250 })) {
    total += await withRateLimit(() => upsertOrdersWithItems(tenant.id, page.orders || []));
  }
  
  // Invalidate order-related cache
  await cache.del(cache.tenantKey(tenant.id, 'orders'));
  await cache.del(cache.tenantKey(tenant.id, 'insights', 'recent-orders'));
  await cache.del(cache.tenantKey(tenant.id, 'insights', 'orders-by-date'));
  await cache.del(cache.tenantKey(tenant.id, 'insights', 'summary'));
  
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

// --- DELTA SYNC (updated_at_min) ---
export async function deltaSync(tenant) {
  const client = buildShopifyClient({ shop: tenant.shopDomain, accessToken: tenant.accessToken });

  // read cursors (per-tenant)
  const cursors = await getTenantCursors(tenant.id);
  const nowIso = new Date().toISOString();

  const out = { products: 0, customers: 0, orders: 0 };

  // products
  {
    const query = { fields: 'id,title,status,variants' };
    if (cursors.products) query.updated_at_min = cursors.products.toISOString();
    for await (const page of client.paginate('/products.json', { query, limit: 250 })) {
      out.products += await withRateLimit(() => upsertProducts(tenant.id, page.products || []));
    }
  }

  // customers
  {
    const query = { fields: 'id,email,first_name,last_name,total_spent,orders_count' };
    if (cursors.customers) query.updated_at_min = cursors.customers.toISOString();
    for await (const page of client.paginate('/customers.json', { query, limit: 250 })) {
      out.customers += await withRateLimit(() => upsertCustomers(tenant.id, page.customers || []));
    }
  }

  // orders
  {
    const query = {
      status: 'any',
      fields: 'id,name,currency,financial_status,fulfillment_status,total_price,subtotal_price,total_tax,total_discounts,processed_at,customer,line_items',
    };
    if (cursors.orders) query.updated_at_min = cursors.orders.toISOString();
    for await (const page of client.paginate('/orders.json', { query, limit: 250 })) {
      out.orders += await withRateLimit(() => upsertOrdersWithItems(tenant.id, page.orders || []));
    }
  }

  // advance cursors to "now"
  await setTenantCursors(tenant.id, { products: nowIso, customers: nowIso, orders: nowIso });
  return out;
}

// Direct API ingestion for hariharbajpai.myshopify.com
export async function getOrCreateDevTenant() {
  const shopDomain = env.DEV_SHOP_DOMAIN;
  const accessToken = env.DEV_ADMIN_TOKEN;
  
  if (!shopDomain || !accessToken) {
    throw new Error('DEV_SHOP_DOMAIN and DEV_ADMIN_TOKEN must be set in environment');
  }

  let tenant = await findTenantByShopDomain(shopDomain);
  if (!tenant) {
    tenant = await upsertTenant({
      shopDomain,
      accessToken,
      scopes: 'read_products,read_customers,read_orders',
      status: 'active',
    });
  }
  
  return tenant;
}

export async function ingestDirectProducts() {
  const tenant = await getOrCreateDevTenant();
  const client = buildShopifyClient({ 
    shop: tenant.shopDomain, 
    accessToken: tenant.accessToken 
  });
  
  let total = 0;
  try {
    for await (const page of client.paginate('/products.json', { 
      query: { fields: 'id,title,status,variants' }, 
      limit: 250 
    })) {
      total += await withRateLimit(() => upsertProducts(tenant.id, page.products || []));
    }
    
    // Clear cache
    await cache.del(cache.tenantKey(tenant.id, 'products'));
    await cache.del(cache.tenantKey(tenant.id, 'insights', 'top-products'));
    
    return { success: true, products: total, tenant: tenant.shopDomain };
  } catch (error) {
    console.error('Direct products ingestion failed:', error);
    throw error;
  }
}

export async function ingestDirectCustomers() {
  const tenant = await getOrCreateDevTenant();
  const client = buildShopifyClient({ 
    shop: tenant.shopDomain, 
    accessToken: tenant.accessToken 
  });
  
  let total = 0;
  try {
    for await (const page of client.paginate('/customers.json', { 
      query: { fields: 'id,email,first_name,last_name,total_spent,orders_count' }, 
      limit: 250 
    })) {
      total += await withRateLimit(() => upsertCustomers(tenant.id, page.customers || []));
    }
    
    // Clear cache
    await cache.del(cache.tenantKey(tenant.id, 'customers'));
    await cache.del(cache.tenantKey(tenant.id, 'insights', 'top-customers'));
    
    return { success: true, customers: total, tenant: tenant.shopDomain };
  } catch (error) {
    console.error('Direct customers ingestion failed:', error);
    throw error;
  }
}

export async function ingestDirectOrders() {
  const tenant = await getOrCreateDevTenant();
  const client = buildShopifyClient({ 
    shop: tenant.shopDomain, 
    accessToken: tenant.accessToken 
  });
  
  let total = 0;
  try {
    const query = {
      status: 'any',
      fields: 'id,name,currency,financial_status,fulfillment_status,total_price,subtotal_price,total_tax,total_discounts,processed_at,customer,line_items',
    };
    
    for await (const page of client.paginate('/orders.json', { query, limit: 250 })) {
      total += await withRateLimit(() => upsertOrdersWithItems(tenant.id, page.orders || []));
    }
    
    // Clear cache
    await cache.del(cache.tenantKey(tenant.id, 'orders'));
    await cache.del(cache.tenantKey(tenant.id, 'insights', 'recent-orders'));
    await cache.del(cache.tenantKey(tenant.id, 'insights', 'orders-by-date'));
    await cache.del(cache.tenantKey(tenant.id, 'insights', 'summary'));
    
    return { success: true, orders: total, tenant: tenant.shopDomain };
  } catch (error) {
    console.error('Direct orders ingestion failed:', error);
    throw error;
  }
}

export async function ingestDirectAll() {
  const tenant = await getOrCreateDevTenant();
  
  try {
    const [productsResult, customersResult, ordersResult] = await Promise.all([
      ingestDirectProducts(),
      ingestDirectCustomers(),
      ingestDirectOrders(),
    ]);
    
    return {
      success: true,
      tenant: tenant.shopDomain,
      products: productsResult.products,
      customers: customersResult.customers,
      orders: ordersResult.orders,
    };
  } catch (error) {
    console.error('Direct full ingestion failed:', error);
    throw error;
  }
}
