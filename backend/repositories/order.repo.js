import { prisma } from '../models/db.js';

export async function upsertOrdersWithItems(tenantId, orders) {
  if (!orders?.length) return 0;
  let count = 0;

  for (const o of orders) {
    const order = await prisma.order.upsert({
      where: { tenantId: tenantId, shopId: BigInt(o.id) },
      update: {
        customerShopId: o.customer?.id ? BigInt(o.customer.id) : undefined,
        name: o.name || undefined,
        currency: o.currency || undefined,
        financialStatus: o.financial_status || undefined,
        fulfillmentStatus: o.fulfillment_status || undefined,
        totalPrice: parseFloat(o.total_price || '0'),
        subtotalPrice: o.subtotal_price ? parseFloat(o.subtotal_price) : undefined,
        totalTax: o.total_tax ? parseFloat(o.total_tax) : undefined,
        totalDiscount: o.total_discounts ? parseFloat(o.total_discounts) : undefined,
        processedAt: o.processed_at ? new Date(o.processed_at) : undefined,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        shopId: BigInt(o.id),
        customerShopId: o.customer?.id ? BigInt(o.customer.id) : null,
        name: o.name || null,
        currency: o.currency || null,
        financialStatus: o.financial_status || null,
        fulfillmentStatus: o.fulfillment_status || null,
        totalPrice: parseFloat(o.total_price || '0'),
        subtotalPrice: o.subtotal_price ? parseFloat(o.subtotal_price) : null,
        totalTax: o.total_tax ? parseFloat(o.total_tax) : null,
        totalDiscount: o.total_discounts ? parseFloat(o.total_discounts) : null,
        processedAt: o.processed_at ? new Date(o.processed_at) : null,
      },
    });

    if (o.line_items?.length) {
      // Replace existing items for this order for simplicity (idempotent-ish)
      await prisma.lineItem.deleteMany({ where: { orderId: order.id } });
      for (const li of o.line_items) {
        await prisma.lineItem.create({
          data: {
            orderId: order.id,
            shopId: li.id ? BigInt(li.id) : null,
            productShopId: li.product_id ? BigInt(li.product_id) : null,
            title: li.title || null,
            quantity: typeof li.quantity === 'number' ? li.quantity : 0,
            price: li.price ? parseFloat(li.price) : null,
            totalDiscount: li.total_discount ? parseFloat(li.total_discount) : null,
            sku: li.sku || null,
          },
        });
      }
    }
    count++;
  }
  return count;
}
