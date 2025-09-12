import { env } from '../utils/env.js';

export function errorHandler(err, req, res, next) {
  console.error('❌ Error occurred:');
  console.error('URL:', req.method, req.url);
  console.error('Error:', err.message);
  
  if (env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  
  if (err.code === 'P2002') {
    return res.status(409).json({ 
      message: 'duplicate entry', 
      field: err.meta?.target 
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({ 
      message: 'record not found' 
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'token expired' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'validation error', 
      details: err.message 
    });
  }

  if (err.message.includes('Shopify') && err.message.includes('failed')) {
    return res.status(502).json({
      message: 'External API error',
      details: env.NODE_ENV === 'development' ? err.message : 'Shopify API unavailable'
    });
  }
  
  res.status(err.status || 500).json({ 
    message: env.NODE_ENV === 'development' ? err.message : 'internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
}