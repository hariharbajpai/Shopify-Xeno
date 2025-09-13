import { backfillAll, backfillProducts, backfillCustomers, backfillOrders, deltaSync, ingestDirectAll, ingestDirectProducts, ingestDirectCustomers, ingestDirectOrders } from '../services/ingest.service.js';

// COMMENTING OUT ADMIN CHECK FUNCTION - ORIGINAL CODE:
// function assertAdmin(req) {
//   const role = req.session?.user?.role || req.user?.role;
//   if (role !== 'admin') {
//     const err = new Error('admin only');
//     err.status = 403;
//     throw err;
//   }
// }

function assertAdmin(req) {
  // Authentication removed - all users can access these functions
  console.log('Authentication bypassed for admin check');
  return true;
}

export async function ingestAll(req, res, next) {
  try {
    // COMMENTING OUT ADMIN CHECK - ORIGINAL CODE:
    // assertAdmin(req);
    assertAdmin(req); // Keeping the function call but it's now a no-op
    const result = await backfillAll(req.tenant, { since: req.query.since });
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
}

export async function ingestProducts(req, res, next) {
  try {
    // COMMENTING OUT ADMIN CHECK - ORIGINAL CODE:
    // assertAdmin(req);
    assertAdmin(req); // Keeping the function call but it's now a no-op
    const count = await backfillProducts(req.tenant);
    res.json({ success: true, products: count });
  } catch (e) { next(e); }
}

export async function ingestCustomers(req, res, next) {
  try {
    // COMMENTING OUT ADMIN CHECK - ORIGINAL CODE:
    // assertAdmin(req);
    assertAdmin(req); // Keeping the function call but it's now a no-op
    const count = await backfillCustomers(req.tenant);
    res.json({ success: true, customers: count });
  } catch (e) { next(e); }
}

export async function ingestOrders(req, res, next) {
  try {
    // COMMENTING OUT ADMIN CHECK - ORIGINAL CODE:
    // assertAdmin(req);
    assertAdmin(req); // Keeping the function call but it's now a no-op
    const count = await backfillOrders(req.tenant, { since: req.query.since });
    res.json({ success: true, orders: count });
  } catch (e) { next(e); }
}

export async function ingestDelta(req, res, next) {
  try {
    const out = await deltaSync(req.tenant);
    res.json({ success: true, ...out });
  } catch (e) { next(e); }
}

// Direct ingestion controllers for hariharbajpai.myshopify.com
export async function directIngestAll(req, res, next) {
  // Only allow in development environment for security
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Direct ingestion not allowed in production' });
  }
  
  try {
    const result = await ingestDirectAll();
    res.json(result);
  } catch (e) { next(e); }
}

export async function directIngestProducts(req, res, next) {
  // Only allow in development environment for security
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Direct ingestion not allowed in production' });
  }
  
  try {
    const result = await ingestDirectProducts();
    res.json(result);
  } catch (e) { next(e); }
}

export async function directIngestCustomers(req, res, next) {
  // Only allow in development environment for security
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Direct ingestion not allowed in production' });
  }
  
  try {
    const result = await ingestDirectCustomers();
    res.json(result);
  } catch (e) { next(e); }
}

export async function directIngestOrders(req, res, next) {
  // Only allow in development environment for security
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Direct ingestion not allowed in production' });
  }
  
  try {
    const result = await ingestDirectOrders();
    res.json(result);
  } catch (e) { next(e); }
}