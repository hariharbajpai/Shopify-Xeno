import { Router } from 'express';
import { requireSessionUser } from '../middleware/sessionAuth.js';
import { resolveTenant } from '../middleware/tenant.js';
import { cacheResponse, cacheKeyGenerators } from '../middleware/cache.js';
import { 
  summary, 
  ordersByDate, 
  topCustomers, 
  topProducts, 
  recentOrders 
} from '../controllers/insights.controller.js';

const router = Router();

const insightsCache = cacheResponse(300, cacheKeyGenerators.insights);

router.get('/insights/summary', requireSessionUser, resolveTenant, insightsCache, summary);
router.get('/insights/orders-by-date', requireSessionUser, resolveTenant, insightsCache, ordersByDate);
router.get('/insights/top-customers', requireSessionUser, resolveTenant, insightsCache, topCustomers);
router.get('/insights/top-products', requireSessionUser, resolveTenant, insightsCache, topProducts);
router.get('/insights/recent-orders', requireSessionUser, resolveTenant, insightsCache, recentOrders);

export default router;
