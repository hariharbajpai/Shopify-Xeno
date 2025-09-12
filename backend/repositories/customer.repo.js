import { prisma } from '../models/db.js';

export async function upsertCustomers(tenantId, customers) {
  if (!customers?.length) return 0;
  let count = 0;
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { shopId: BigInt(c.id) },
      update: {
        email: c.email || undefined,
        firstName: c.first_name || undefined,
        lastName: c.last_name || undefined,
        totalSpent: c.total_spent ? parseFloat(c.total_spent) : undefined,
        ordersCount: typeof c.orders_count === 'number' ? c.orders_count : undefined,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        shopId: BigInt(c.id),
        email: c.email,
        firstName: c.first_name,
        lastName: c.last_name,
        totalSpent: c.total_spent ? parseFloat(c.total_spent) : null,
        ordersCount: typeof c.orders_count === 'number' ? c.orders_count : 0,
      },
    });
    count++;
  }
  return count;
}
