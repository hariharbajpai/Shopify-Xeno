import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import helmet from 'helmet';
import path from 'path';
import cron from 'node-cron';
import { env } from './utils/env.js';
import authRoutes from './routes/auth.routes.js';
import shopifyRoutes from './routes/shopify.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import ingestRoutes from './routes/ingest.routes.js';
import { prisma } from './models/db.js';
import passport from './config/passport.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { deltaSync } from './services/ingest.service.js';
import { initRedis } from './config/redis.js';

console.log('Starting server initialization...');

const app = express();

async function testDatabaseConnection() {
  try {
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('Database connected successfully');

    await prisma.$queryRaw`SELECT 1`;
    console.log('Database test query passed');

    initRedis();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  try {
    await prisma.$disconnect();
    console.log('Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down...');
  try {
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});

 
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, be more permissive but still validate
    if (env.NODE_ENV === 'development') {
      // Allow localhost, 127.0.0.1, and null origins
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin === 'null') {
        return callback(null, true);
      }
      // If specific CORS origins are defined, check against them
      if (env.CORS_ORIGINS.length && env.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      // If no specific origins defined in dev, allow all
      if (!env.CORS_ORIGINS.length) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    }
    
    // In production, strictly validate against CORS_ORIGINS
    if (env.CORS_ORIGINS.length && env.CORS_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

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
app.use(apiLimiter);
app.use(express.json());
app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev'));

app.use('/auth', authRoutes);
app.use('/', shopifyRoutes);
app.use('/', insightsRoutes);
app.use('/', ingestRoutes);

 
app.get('/login-test', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'login-test.html'));
});
 
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: '🚀 Shopify Xeno Backend is live!',
    health: '/health',
    docs: '/api/docs',
    loginTest: '/login-test'
  });
});

 
app.get('/health', async (_req, res) => {
  try {
    
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

// Data summary endpoint to check ingested data
app.get('/api/data-summary', async (req, res) => {
  try {
    const [tenants, products, customers, orders, lineItems] = await Promise.all([
      prisma.tenant.count(),
      prisma.product.count(),
      prisma.customer.count(),
      prisma.order.count(),
      prisma.lineItem.count()
    ]);

    // Get sample data from each table
    const [sampleTenant, sampleProduct, sampleCustomer, sampleOrder] = await Promise.all([
      prisma.tenant.findFirst({ select: { shopDomain: true, status: true, createdAt: true } }),
      prisma.product.findFirst({ select: { title: true, status: true, priceMin: true } }),
      prisma.customer.findFirst({ select: { email: true, firstName: true, lastName: true } }),
      prisma.order.findFirst({ select: { name: true, totalPrice: true, financialStatus: true } })
    ]);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        tenants,
        products,
        customers,
        orders,
        lineItems
      },
      samples: {
        tenant: sampleTenant,
        product: sampleProduct,
        customer: sampleCustomer,
        order: sampleOrder
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404
app.use((_req, res) => res.status(404).json({ message: 'not found' }));

 
app.use(errorHandler);

 
async function startServer() {
  try {
    console.log('Starting server with environment:', env.NODE_ENV);
    console.log('Port:', env.PORT);
    
  
    await testDatabaseConnection();

    // Start the server
    const server = app.listen(env.PORT, () => {
      console.log('API server started successfully!');
      console.log(`Server running on: http://localhost:${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${env.PORT}/health`);
      console.log(`Login Test Page: http://localhost:${env.PORT}/login-test`);
      console.log('Ready to accept requests!');

      // Start cron scheduler after server is running
      startCronScheduler();
    });

    
    server.on('error', (error) => {
      console.error('Server error:', error.message);
      console.error('Stack trace:', error.stack);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Cron scheduler for delta sync
function startCronScheduler() {
  const cronInterval = process.env.CRON_SYNC_EVERY_MINUTES || '15';
  const cronPattern = `*/${cronInterval} * * * *`; // Every N minutes

  console.log(`Starting cron scheduler: every ${cronInterval} minutes`);

  cron.schedule(cronPattern, async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled delta sync...`);

    try {
      const activeTenants = await prisma.tenant.findMany({
        where: { status: 'active' },
        select: {
          id: true,
          shopDomain: true,
          accessToken: true,
          tenantId: true
        }
      });

      console.log(`Found ${activeTenants.length} active tenants for delta sync`);

      for (const tenant of activeTenants) {
        try {
          const result = await deltaSync(tenant);
          console.log(`Delta sync completed for ${tenant.shopDomain}:`, result);
        } catch (tenantError) {
          console.error(`Delta sync failed for ${tenant.shopDomain}:`, tenantError.message);
        }
      }

      console.log(`Scheduled delta sync completed at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Cron scheduler error:', error.message);
    }
  });

  console.log('Cron scheduler started successfully');
}

// Start the application
console.log('Calling startServer()...');
startServer();
console.log('startServer() called');