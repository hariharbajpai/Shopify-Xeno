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
};
