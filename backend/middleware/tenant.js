// middleware/tenant.js
import { findByShopOrTenantKey } from '../repositories/tenant.repo.js';

export async function resolveTenant(req, res, next) {
  try {
    const headerKey =
      req.header('X-Tenant-Key') ||
      req.header('x-tenant-key') ||
      req.header('X-Shop-Domain') ||
      req.header('x-shop-domain');

    const qsKey = req.query.tenant || req.query.shop;

    const key = (headerKey || qsKey || '').toString().trim();
    if (!key) return res.status(400).json({ error: 'Missing tenant key (X-Tenant-Key or ?tenant=)' });

    const tenant = await findByShopOrTenantKey(key);
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
