import { Router } from 'express';
import { resolveTenant } from '../middleware/tenant.js';
import { requireSessionUser } from '../middleware/sessionAuth.js';
import { requireAdmin } from '../middleware/adminOnly.js';
import { ingestAll, ingestProducts, ingestCustomers, ingestOrders, ingestDelta, directIngestAll, directIngestProducts, directIngestCustomers, directIngestOrders } from '../controllers/ingest.controller.js';

const router = Router();

router.post('/ingest/full', requireSessionUser, requireAdmin, resolveTenant, ingestAll);
router.post('/ingest/products', requireSessionUser, requireAdmin, resolveTenant, ingestProducts);
router.post('/ingest/customers', requireSessionUser, requireAdmin, resolveTenant, ingestCustomers);
router.post('/ingest/orders', requireSessionUser, requireAdmin, resolveTenant, ingestOrders);

router.get('/ingest/delta', requireSessionUser, resolveTenant, ingestDelta);

// Direct ingestion routes for hariharbajpai.myshopify.com (no auth required for testing)
router.post('/ingest/direct/all', directIngestAll);
router.post('/ingest/direct/products', directIngestProducts);
router.post('/ingest/direct/customers', directIngestCustomers);
router.post('/ingest/direct/orders', directIngestOrders);

export default router;
