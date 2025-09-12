import { backfillAll, backfillProducts, backfillCustomers, backfillOrders } from '../services/ingest.service.js';

export async function ingestAll(req, res, next) {
  try {
    const result = await backfillAll(req.tenant, { since: req.query.since });
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
}

export async function ingestProducts(req, res, next) {
  try {
    const count = await backfillProducts(req.tenant);
    res.json({ success: true, products: count });
  } catch (e) { next(e); }
}

export async function ingestCustomers(req, res, next) {
  try {
    const count = await backfillCustomers(req.tenant);
    res.json({ success: true, customers: count });
  } catch (e) { next(e); }
}

export async function ingestOrders(req, res, next) {
  try {
    const count = await backfillOrders(req.tenant, { since: req.query.since });
    res.json({ success: true, orders: count });
  } catch (e) { next(e); }
}
