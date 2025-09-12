import { prisma } from '../models/db.js';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export async function summary(req, res, next) {
  try {
    const tenantId = req.tenant.id;

    const [customers, ordersAgg, revenueAgg] = await Promise.all([
      prisma.customer.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId } }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { tenantId },
      }),
    ]);

    res.json({
      success: true,
      totals: {
        customers,
        orders: ordersAgg,
        revenue: Number(revenueAgg._sum.totalPrice || 0),
      },
    });
  } catch (e) { next(e); }
}

export async function ordersByDate(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const { from, to } = req.query;

    const start = from ? new Date(from) : subDays(new Date(), 30);
    const end = to ? new Date(to) : new Date();

    // Group by day via raw SQL for performance
    const data = await prisma.$queryRaw`
      SELECT DATE_TRUNC('day', "processedAt") AS day,
             COUNT(*) AS orders,
             COALESCE(SUM("totalPrice"), 0) AS revenue
      FROM "Order"
      WHERE "tenantId" = ${tenantId}
        AND "processedAt" BETWEEN ${start} AND ${end}
      GROUP BY 1
      ORDER BY 1;
    `;

    res.json({ success: true, range: { from: start, to: end }, data });
  } catch (e) { next(e); }
}

export async function topCustomers(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const limit = Number(req.query.limit || 5);

    const rows = await prisma.$queryRaw`
      SELECT c."shopId"       AS "customerShopId",
             c."email",
             c."firstName",
             c."lastName",
             COALESCE(SUM(o."totalPrice"), 0) AS "totalSpent"
      FROM "Customer" c
      LEFT JOIN "Order" o
        ON o."tenantId" = c."tenantId"
       AND o."customerShopId" = c."shopId"
      WHERE c."tenantId" = ${tenantId}
      GROUP BY c."shopId", c."email", c."firstName", c."lastName"
      ORDER BY "totalSpent" DESC
      LIMIT ${limit};
    `;

    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}

export async function topProducts(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const limit = Number(req.query.limit || 10);

    const rows = await prisma.$queryRaw`
      SELECT p."shopId" AS "productId",
             p."title",
             COALESCE(SUM(li."price" * li."quantity"), 0) AS "revenue",
             COALESCE(SUM(li."quantity"), 0) AS "quantity",
             COUNT(DISTINCT o."id") AS "orders"
      FROM "Product" p
      LEFT JOIN "LineItem" li ON li."productShopId" = p."shopId"
      LEFT JOIN "Order" o ON o."id" = li."orderId" AND o."tenantId" = ${tenantId}
      WHERE p."tenantId" = ${tenantId}
      GROUP BY p."shopId", p."title"
      HAVING COALESCE(SUM(li."price" * li."quantity"), 0) > 0
      ORDER BY "revenue" DESC
      LIMIT ${limit};
    `;

    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}

export async function recentOrders(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);

    const orders = await prisma.order.findMany({
      where: { tenantId },
      select: {
        id: true,
        shopId: true,
        name: true,
        totalPrice: true,
        financialStatus: true,
        processedAt: true,
      },
      orderBy: { processedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const totalCount = await prisma.order.count({ where: { tenantId } });

    res.json({ 
      success: true, 
      data: orders.map(order => ({
        orderId: order.shopId.toString(),
        name: order.name,
        totalPrice: Number(order.totalPrice),
        financialStatus: order.financialStatus,
        createdAt: order.processedAt
      })),
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (e) { next(e); }
}
