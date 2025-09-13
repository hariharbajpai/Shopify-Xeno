import { findByShopOrTenantKey } from '../repositories/tenant.repo.js';
import { prisma } from '../models/db.js';

export async function resolveTenant(req, res, next) {
  try {
    const headerKey =
      req.header('X-Tenant-Key') ||
      req.header('x-tenant-key') ||
      req.header('X-Shop-Domain') ||
      req.header('x-shop-domain');

    const qsKey = req.query.tenant || req.query.shop;

    const key = (headerKey || qsKey || '').toString().trim();
    
    // COMMENTING OUT ORIGINAL CODE THAT RETURNS ERROR:
    // if (!key) return res.status(400).json({ error: 'Missing tenant key (X-Tenant-Key or ?tenant=)' });
    
    // NEW CODE TO AUTOMATICALLY USE DEFAULT TENANT WHEN NO KEY PROVIDED:
    let tenant;
    if (!key) {
      // When no tenant key is provided, use the first available tenant
      console.log('No tenant key provided, using default tenant');
      const tenants = await prisma.tenant.findMany({
        where: { status: 'active' },
        take: 1
      });
      
      if (tenants.length > 0) {
        tenant = tenants[0];
      } else {
        return res.status(400).json({ error: 'No active tenants found and no tenant key provided' });
      }
    } else {
      tenant = await findByShopOrTenantKey(key);
    }
    
    if (!tenant || tenant.status !== 'active') {
      return res.status(403).json({ error: 'Tenant not found or inactive' });
    }

    req.tenant = {
      id: tenant.id,
      tenantId: tenant.tenantId,
      shopDomain: tenant.shopDomain,
      accessToken: tenant.accessToken,
      scopes: tenant.scopes,
    };
    next();
  } catch (e) {
    next(e);
  }
}