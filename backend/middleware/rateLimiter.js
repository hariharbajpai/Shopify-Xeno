import rateLimit from 'express-rate-limit';
import { env } from '../utils/env.js';

export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many attempts, please try again later.',
  },
});

export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  skip: (req) => {
    return req.get('X-Shopify-Shop-Domain') && req.get('X-Shopify-Topic');
  }
});