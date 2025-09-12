import { Router } from 'express';
import { resolveTenant } from '../middleware/tenant.js';
import { requireSessionUser } from '../middleware/sessionAuth.js';
import { ingestAll, ingestProducts, ingestCustomers, ingestOrders } from '../controllers/ingest.controller.js';

const router = Router();

router.post('/ingest/full', requireSessionUser, resolveTenant, ingestAll);
router.post('/ingest/products', requireSessionUser, resolveTenant, ingestProducts);
router.post('/ingest/customers', requireSessionUser, resolveTenant, ingestCustomers);
router.post('/ingest/orders', requireSessionUser, resolveTenant, ingestOrders);

export default router;
