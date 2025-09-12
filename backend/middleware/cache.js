import { cache } from '../config/redis.js';

export function cacheResponse(ttl = 300, keyGenerator = null) {
  return async (req, res, next) => {
    const cacheKey = keyGenerator 
      ? keyGenerator(req) 
      : `api:${req.method}:${req.path}:${JSON.stringify(req.query)}`;

    try {
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        console.log(`🚀 Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`💾 Cache MISS: ${cacheKey}`);
      
      const originalJson = res.json;
      
      res.json = function(body) {
        cache.set(cacheKey, body, ttl).catch(err => 
          console.error('Cache storage error:', err.message)
        );
        
        return originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next();
    }
  };
}

export const cacheKeyGenerators = {
  insights: (req) => {
    const tenantId = req.tenant?.id || 'unknown';
    return cache.tenantKey(tenantId, 'insights', req.path.split('/').pop());
  },
  
  shopify: (req) => {
    const shop = req.tenant?.shopDomain || 'unknown';
    const params = new URLSearchParams(req.query).toString();
    return cache.shopifyKey(shop, req.path, params);
  },
  
  products: (req) => {
    const tenantId = req.tenant?.id || 'unknown';
    const params = new URLSearchParams(req.query).toString();
    return cache.tenantKey(tenantId, 'products', params);
  }
};

export const cacheInvalidation = {
  async invalidateTenant(tenantId, resource = '*') {
    const pattern = cache.tenantKey(tenantId, resource);
    console.log(`🗑️ Cache invalidation requested for: ${pattern}`);
  },
  
  async invalidateKey(key) {
    await cache.del(key);
    console.log(`🗑️ Cache invalidated: ${key}`);
  }
};