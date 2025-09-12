import { Redis } from '@upstash/redis';
import { env } from '../utils/env.js';

let redis = null;

export function initRedis() {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    console.log('⚠️ Redis credentials not found, caching disabled');
    return null;
  }

  try {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    console.log('✅ Redis client initialized successfully');
    return redis;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error.message);
    return null;
  }
}

export function getRedis() {
  if (!redis) {
    redis = initRedis();
  }
  return redis;
}

export const cache = {
  async get(key) {
    const client = getRedis();
    if (!client) return null;
    
    try {
      const value = await client.get(key);
      if (value === null || value === undefined) {
        return null;
      }
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error.message);
      return null;
    }
  },

  async set(key, value, ttl = 300) {
    const client = getRedis();
    if (!client) return false;
    
    try {
      let serializedValue;
      if (typeof value === 'string') {
        serializedValue = value;
      } else {
        serializedValue = JSON.stringify(value);
      }
      
      await client.setex(key, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error.message);
      return false;
    }
  },

  // Delete key from cache
  async del(key) {
    const client = getRedis();
    if (!client) return false;
    
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error.message);
      return false;
    }
  },

  // Get multiple keys
  async mget(keys) {
    const client = getRedis();
    if (!client) return {};
    
    try {
      const values = await client.mget(...keys);
      const result = {};
      keys.forEach((key, index) => {
        result[key] = values[index];
      });
      return result;
    } catch (error) {
      console.error('Cache MGET error:', error.message);
      return {};
    }
  },

  // Check if key exists
  async exists(key) {
    const client = getRedis();
    if (!client) return false;
    
    try {
      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error.message);
      return false;
    }
  },

  // Generate cache key for tenant-specific data
  tenantKey(tenantId, resource, identifier = '') {
    return `tenant:${tenantId}:${resource}${identifier ? ':' + identifier : ''}`;
  },

  // Generate cache key for Shopify API responses
  shopifyKey(shop, endpoint, params = '') {
    return `shopify:${shop}:${endpoint}${params ? ':' + params : ''}`;
  }
};