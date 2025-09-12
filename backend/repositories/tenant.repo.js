import { prisma } from '../models/db.js';
import crypto from 'crypto';

export async function upsertTenant({ 
  shopDomain, 
  accessToken, 
  scopes, 
  shopName, 
  email, 
  currency, 
  timezone, 
  status = 'active' 
}) {
  return prisma.tenant.upsert({
    where: { shopDomain },
    update: { 
      accessToken, 
      scopes, 
      shopName,
      email,
      currency,
      timezone,
      status,
      updatedAt: new Date()
    },
    create: {
      tenantId: cryptoRandomId(),
      shopDomain,
      accessToken,
      scopes,
      shopName,
      email,
      currency,
      timezone,
      status,
    },
  });
}

export async function findByShopOrTenantKey(key) {
  return prisma.tenant.findFirst({
    where: {
      OR: [
        { shopDomain: key },
        { tenantId: key },
        { id: key },
      ],
    },
  });
}

export async function findTenantByShopDomain(shopDomain) {
  return prisma.tenant.findUnique({
    where: { shopDomain }
  });
}

export async function findActiveTenant(shopDomain) {
  return prisma.tenant.findFirst({
    where: {
      shopDomain,
      status: 'active'
    }
  });
}

export async function markTenantSuspended(shopDomain) {
  return prisma.tenant.update({
    where: { shopDomain },
    data: {
      status: 'suspended',
      uninstalledAt: new Date()
    }
  });
}

export async function getTenantCursors(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      productsCursor: true,
      customersCursor: true,
      ordersCursor: true
    }
  });
  
  return {
    products: tenant?.productsCursor ? new Date(tenant.productsCursor) : null,
    customers: tenant?.customersCursor ? new Date(tenant.customersCursor) : null,
    orders: tenant?.ordersCursor ? new Date(tenant.ordersCursor) : null
  };
}

export async function setTenantCursors(tenantId, cursors) {
  const data = {};
  if (cursors.products) data.productsCursor = new Date(cursors.products);
  if (cursors.customers) data.customersCursor = new Date(cursors.customers);
  if (cursors.orders) data.ordersCursor = new Date(cursors.orders);
  
  return prisma.tenant.update({
    where: { id: tenantId },
    data
  });
}

function cryptoRandomId() {
  return 'ten_' + crypto.randomBytes(8).toString('hex');
}
