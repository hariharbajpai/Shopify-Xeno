import { Router } from 'express';
import { resolveTenant } from '../middleware/tenant.js';
import { requireSessionUser } from '../middleware/sessionAuth.js';
import { requireAdmin } from '../middleware/adminOnly.js';
import { ingestAll, ingestProducts, ingestCustomers, ingestOrders, ingestDelta } from '../controllers/ingest.controller.js';

const router = Router();

router.post('/ingest/full', requireSessionUser, requireAdmin, resolveTenant, ingestAll);
router.post('/ingest/products', requireSessionUser, requireAdmin, resolveTenant, ingestProducts);
router.post('/ingest/customers', requireSessionUser, requireAdmin, resolveTenant, ingestCustomers);
router.post('/ingest/orders', requireSessionUser, requireAdmin, resolveTenant, ingestOrders);

router.get('/ingest/delta', resolveTenant, ingestDelta);

export default router;
