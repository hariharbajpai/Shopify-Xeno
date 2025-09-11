// index.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import { env } from './utils/env.js';
import authRoutes from './routes/auth.routes.js';
import { prisma } from './models/db.js';
import passport from './config/passport.js';

const app = express();

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL database connected successfully!');
    
    // Test a simple query to ensure database is working
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database query test successful!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your DATABASE_URL in .env file');
    process.exit(1); // Exit if database connection fails
  }
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

app.use(cors({ origin: env.CORS_ORIGINS.length ? env.CORS_ORIGINS : true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev'));

app.use('/auth', authRoutes);

// health endpoint with database status
app.get('/health', async (_req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      ok: true, 
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({ 
      ok: false, 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404
app.use((_req, res) => res.status(404).json({ message: 'not found' }));

// Enhanced error handler
app.use((err, req, res, _next) => {
  console.error('❌ Error occurred:');
  console.error('URL:', req.method, req.url);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Database-specific error handling
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
  
  // JWT-specific error handling
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'token expired' });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'validation error', 
      details: err.message 
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({ 
    message: env.NODE_ENV === 'development' ? err.message : 'internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server with database connection test
async function startServer() {
  try {
    // Test database connection first
    await testDatabaseConnection();
    
    // Start the server
    app.listen(env.PORT, () => {
      console.log(`🚀 API server started successfully!`);
      console.log(`ℹ️  Server running on: http://localhost:${env.PORT}`);
      console.log(`ℹ️  Environment: ${env.NODE_ENV}`);
      console.log(`ℹ️  Health check: http://localhost:${env.PORT}/health`);
      console.log(`✅ Ready to accept requests!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the application
startServer();
