import { Router } from 'express';
import { requireSessionUser } from '../middleware/sessionAuth.js';
import { resolveTenant } from '../middleware/tenant.js';
import { 
  summary, 
  ordersByDate, 
  topCustomers, 
  topProducts, 
  recentOrders 
} from '../controllers/insights.controller.js';

const router = Router();

router.get('/insights/summary', requireSessionUser, resolveTenant, summary);
router.get('/insights/orders-by-date', requireSessionUser, resolveTenant, ordersByDate);
router.get('/insights/top-customers', requireSessionUser, resolveTenant, topCustomers);
router.get('/insights/top-products', requireSessionUser, resolveTenant, topProducts);
router.get('/insights/recent-orders', requireSessionUser, resolveTenant, recentOrders);

export default router;
