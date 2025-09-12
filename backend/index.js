// index.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import helmet from 'helmet';
import path from 'path';
import { env } from './utils/env.js';
import authRoutes from './routes/auth.routes.js';
import shopifyRoutes from './routes/shopify.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import ingestRoutes from './routes/ingest.routes.js';
import { prisma } from './models/db.js';
import passport from './config/passport.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

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

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow specific origins from env
    if (env.CORS_ORIGINS.length && env.CORS_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow localhost and file:// origins
    if (env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin === 'null') {
        return callback(null, true);
      }
    }
    
    // Default: allow all if no specific origins set
    if (!env.CORS_ORIGINS.length) return callback(null, true);
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true 
}));
app.use(apiLimiter);
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
app.use('/', shopifyRoutes);
app.use('/', insightsRoutes);
app.use('/', ingestRoutes);

// Serve test HTML file for OAuth testing
app.get('/test', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'test-oauth.html'));
});

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

// Use centralized error handler
app.use(errorHandler);

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
