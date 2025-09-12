import { prisma } from '../models/db.js';

export async function logWebhookEvent(tenantId, topic, shopDomain, payload) {
  return prisma.webhookEvent.create({
    data: {
      tenantId,
      topic,
      shopDomain,
      payload,
      receivedAt: new Date(), // Use the correct field name from schema
    },
  });
}
