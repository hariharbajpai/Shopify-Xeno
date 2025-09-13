import { prisma } from '../models/db.js';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export async function summary(req, res, next) {
  try {
    // Check if tenant context is available
    if (!req.tenant || !req.tenant.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tenant context is missing' 
      });
    }
    
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
  } catch (e) { 
    console.error('Error in summary:', e);
    next(e); 
  }
}

export async function ordersByDate(req, res, next) {
  try {
    // Check if tenant context is available
    if (!req.tenant || !req.tenant.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tenant context is missing' 
      });
    }
    
    const tenantId = req.tenant.id;
    const { from, to } = req.query;

    const start = from ? new Date(from) : subDays(new Date(), 30);
    const end = to ? new Date(to) : new Date();

    // First, let's check if there are any orders for this tenant in the date range
    const orderCount = await prisma.order.count({
      where: { 
        tenantId,
        processedAt: {
          gte: start,
          lte: end
        }
      }
    });

    let data;
    if (orderCount === 0) {
      // If there are no orders, return empty array
      data = [];
    } else {
      // If there are orders, use the original query
      data = await prisma.$queryRaw`
        SELECT DATE_TRUNC('day', "processedAt") AS day,
               COUNT(*) AS orders,
               COALESCE(SUM("totalPrice"), 0) AS revenue
        FROM "Order"
        WHERE "tenantId" = ${tenantId}
          AND "processedAt" BETWEEN ${start} AND ${end}
        GROUP BY 1
        ORDER BY 1;
      `;
    }

    // Convert BigInt values to strings to avoid JSON serialization issues
    const serializedData = data.map(row => {
      const serializedRow = { ...row };
      for (const key in serializedRow) {
        if (typeof serializedRow[key] === 'bigint') {
          serializedRow[key] = serializedRow[key].toString();
        }
      }
      return serializedRow;
    });

    res.json({ success: true, range: { from: start, to: end }, data: serializedData });
  } catch (e) { 
    console.error('Error in ordersByDate:', e);
    next(e); 
  }
}

export async function topCustomers(req, res, next) {
  try {
    // Check if tenant context is available
    if (!req.tenant || !req.tenant.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tenant context is missing' 
      });
    }
    
    const tenantId = req.tenant.id;
    const limit = Number(req.query.limit || 5);

    // Validate limit parameter
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid limit parameter' 
      });
    }

    // First, let's check if there are any orders for this tenant
    const orderCount = await prisma.order.count({
      where: { tenantId }
    });

    let rows;
    if (orderCount === 0) {
      // If there are no orders, just return customers with 0 total spent
      rows = await prisma.$queryRaw`
        SELECT c."shopId"       AS "customerShopId",
               c."email",
               c."firstName",
               c."lastName",
               0 AS "totalSpent"
        FROM "Customer" c
        WHERE c."tenantId" = ${tenantId}
        ORDER BY c."firstName", c."lastName"
        LIMIT ${limit};
      `;
    } else {
      // If there are orders, use the original query
      rows = await prisma.$queryRaw`
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
    }

    // Convert BigInt values to strings to avoid JSON serialization issues
    const serializedRows = rows.map(row => {
      const serializedRow = { ...row };
      for (const key in serializedRow) {
        if (typeof serializedRow[key] === 'bigint') {
          serializedRow[key] = serializedRow[key].toString();
        }
      }
      return serializedRow;
    });

    res.json({ success: true, data: serializedRows });
  } catch (e) { 
    console.error('Error in topCustomers:', e);
    next(e); 
  }
}

export async function topProducts(req, res, next) {
  try {
    // Check if tenant context is available
    if (!req.tenant || !req.tenant.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tenant context is missing' 
      });
    }
    
    const tenantId = req.tenant.id;
    const limit = Number(req.query.limit || 10);

    // Validate limit parameter
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid limit parameter' 
      });
    }

    // First, let's check if there are any line items for this tenant
    const lineItemCount = await prisma.lineItem.count({
      where: { 
        order: {
          tenantId
        }
      }
    });

    let rows;
    if (lineItemCount === 0) {
      // If there are no line items, return empty array
      rows = [];
    } else {
      // If there are line items, use the original query
      rows = await prisma.$queryRaw`
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
    }

    // Convert BigInt values to strings to avoid JSON serialization issues
    const serializedRows = rows.map(row => {
      const serializedRow = { ...row };
      for (const key in serializedRow) {
        if (typeof serializedRow[key] === 'bigint') {
          serializedRow[key] = serializedRow[key].toString();
        }
      }
      return serializedRow;
    });

    res.json({ success: true, data: serializedRows });
  } catch (e) { 
    console.error('Error in topProducts:', e);
    next(e); 
  }
}

export async function recentOrders(req, res, next) {
  try {
    // Check if tenant context is available
    if (!req.tenant || !req.tenant.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tenant context is missing' 
      });
    }
    
    const tenantId = req.tenant.id;
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);

    // Validate parameters
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid limit parameter' 
      });
    }
    
    if (isNaN(offset) || offset < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid offset parameter' 
      });
    }

    // First, let's check if there are any orders for this tenant
    const totalCount = await prisma.order.count({ where: { tenantId } });

    let orders = [];
    if (totalCount > 0) {
      orders = await prisma.order.findMany({
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
    }

    // Convert BigInt values to strings to avoid JSON serialization issues
    const serializedOrders = orders.map(order => ({
      orderId: order.shopId.toString(),
      name: order.name,
      totalPrice: Number(order.totalPrice),
      financialStatus: order.financialStatus,
      createdAt: order.processedAt
    }));

    res.json({ 
      success: true, 
      data: serializedOrders,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (e) { 
    console.error('Error in recentOrders:', e);
    next(e); 
  }
}
