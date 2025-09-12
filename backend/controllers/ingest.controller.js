import { backfillAll, backfillProducts, backfillCustomers, backfillOrders, deltaSync } from '../services/ingest.service.js';

function assertAdmin(req) {
  const role = req.session?.user?.role || req.user?.role;
  if (role !== 'admin') {
    const err = new Error('admin only');
    err.status = 403;
    throw err;
  }
}

export async function ingestAll(req, res, next) {
  try {
    assertAdmin(req);
    const result = await backfillAll(req.tenant, { since: req.query.since });
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
}

export async function ingestProducts(req, res, next) {
  try {
    assertAdmin(req);
    const count = await backfillProducts(req.tenant);
    res.json({ success: true, products: count });
  } catch (e) { next(e); }
}

export async function ingestCustomers(req, res, next) {
  try {
    assertAdmin(req);
    const count = await backfillCustomers(req.tenant);
    res.json({ success: true, customers: count });
  } catch (e) { next(e); }
}

export async function ingestOrders(req, res, next) {
  try {
    assertAdmin(req);
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
