// repositories/tenant.repo.js
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
      tenantId: cryptoRandomId(), // stable external id
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
  // key could be shop domain or tenantId
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

function cryptoRandomId() {
  return 'ten_' + crypto.randomBytes(8).toString('hex');
}
