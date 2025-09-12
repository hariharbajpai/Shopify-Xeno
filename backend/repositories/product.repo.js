import { prisma } from '../models/db.js';

export async function upsertProducts(tenantId, products) {
  if (!products?.length) return 0;
  let count = 0;
  for (const p of products) {
    await prisma.product.upsert({
      where: { shopId: BigInt(p.id) },
      update: {
        title: p.title,
        status: p.status || undefined,
        priceMin: p.variants?.length ? p.variants.reduce((m, v) => m < parseFloat(v.price) ? m : parseFloat(v.price), parseFloat(p.variants[0].price)) : undefined,
        priceMax: p.variants?.length ? p.variants.reduce((m, v) => m > parseFloat(v.price) ? m : parseFloat(v.price), parseFloat(p.variants[0].price)) : undefined,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        shopId: BigInt(p.id),
        title: p.title,
        status: p.status || null,
        priceMin: p.variants?.length ? parseFloat(p.variants[0].price) : null,
        priceMax: p.variants?.length ? parseFloat(p.variants[0].price) : null,
      },
    });
    count++;
  }
  return count;
}
