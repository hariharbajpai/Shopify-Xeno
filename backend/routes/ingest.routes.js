import { Router } from 'express';
// Comment out authentication middleware
// import { resolveTenant } from '../middleware/tenant.js';
// import { requireSessionUser } from '../middleware/sessionAuth.js';
// import { requireAdmin } from '../middleware/adminOnly.js';
import { resolveTenant } from '../middleware/tenant.js';
import { requireAdmin } from '../middleware/adminOnly.js';
import { ingestAll, ingestProducts, ingestCustomers, ingestOrders, ingestDelta, directIngestAll, directIngestProducts, directIngestCustomers, directIngestOrders } from '../controllers/ingest.controller.js';

const router = Router();

// Remove authentication middleware from routes but keep tenant resolution
router.post('/ingest/full', resolveTenant, ingestAll);
router.post('/ingest/products', resolveTenant, ingestProducts);
router.post('/ingest/customers', resolveTenant, ingestCustomers);
router.post('/ingest/orders', resolveTenant, ingestOrders);

router.get('/ingest/delta', resolveTenant, ingestDelta);

// Direct ingestion routes for hariharbajpai.myshopify.com (no auth required for testing)
router.post('/ingest/direct/all', directIngestAll);
router.post('/ingest/direct/products', directIngestProducts);
router.post('/ingest/direct/customers', directIngestCustomers);
router.post('/ingest/direct/orders', directIngestOrders);

// New endpoint for manual triggering
router.post('/ingest/shopify-data', directIngestAll);

export default router;