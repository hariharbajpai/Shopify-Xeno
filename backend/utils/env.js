// utils/env.js
import dotenv from 'dotenv';
dotenv.config();

const required = (k) => {
  if (!process.env[k]) throw new Error(`Missing env: ${k}`);
  return process.env[k];
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  DATABASE_URL: required('DATABASE_URL'),
  GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET'),
  GOOGLE_CALLBACK_URL: required('GOOGLE_CALLBACK_URL'),
  SESSION_SECRET: required('SESSION_SECRET'),
  CORS_ORIGINS: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
  FRONTEND_SUCCESS_URL: process.env.FRONTEND_SUCCESS_URL || 'http://localhost:5173/dashboard',
  FRONTEND_FAILURE_URL: process.env.FRONTEND_FAILURE_URL || 'http://localhost:5173/login',
  // Shopify Configuration
  SHOPIFY_API_KEY: required('SHOPIFY_API_KEY'),
  SHOPIFY_API_SECRET: required('SHOPIFY_API_SECRET'),
  SHOPIFY_SCOPES: process.env.SHOPIFY_SCOPES || 'read_products,read_orders,read_customers',
  SHOPIFY_REDIRECT_URI: process.env.SHOPIFY_REDIRECT_URI || 'http://localhost:4000/auth/shopify/callback',
  SHOPIFY_WEBHOOK_URI: process.env.SHOPIFY_WEBHOOK_URI || 'http://localhost:4000/webhooks/shopify',
  SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,
  SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || '2024-10',
  // Dev Store Configuration
  DEV_SHOP_DOMAIN: process.env.DEV_SHOP_DOMAIN,
  DEV_ADMIN_TOKEN: process.env.DEV_ADMIN_TOKEN,
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || process.env.SESSION_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.SESSION_SECRET + '_refresh',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  // Redis Cache
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
};
