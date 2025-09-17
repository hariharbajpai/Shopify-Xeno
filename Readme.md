# Xenoit - Shopify Analytics Platform

**Multi-tenant Shopify Data Ingestion & Insights Service**

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-orange)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)](https://www.postgresql.org/)

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack & Rationale](#3-tech-stack--rationale)
4. [Folder Structure](#4-folder-structure)
5. [Environment & Configuration](#5-environment--configuration)
6. [Installation & Local Setup](#6-installation--local-setup)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Shopify Integration](#8-shopify-integration)
9. [Data Model & Persistence](#9-data-model--persistence)
10. [Ingestion Jobs](#10-ingestion-jobs-backfill--sync)
11. [API Reference](#11-api-reference)
12. [Frontend Components](#12-frontend-components)
13. [Rate Limiting & Throttling](#13-rate-limiting--throttling)
14. [Observability](#14-observability)
15. [Security](#15-security)
16. [Testing](#16-testing)
17. [Deployment & Environments](#17-deployment--environments)
18. [Performance & Scaling](#18-performance--scaling)
19. [Troubleshooting & FAQs](#19-troubleshooting--faqs)
20. [Limitations & Future Work](#20-limitations--future-work)
21. [Changelog & Versioning](#21-changelog--versioning)
22. [License & Credits](#22-license--credits)
23. [Appendices](#appendices)

---

## 1) Overview

Xenoit is a production-ready, secure, tenant-isolated API service for multi-tenant Shopify data ingestion and business insights. It enables Shopify store owners to connect their stores, automatically sync product, customer, and order data, and access actionable business insights through a dashboard.

### Key Features

- **Multi-tenant Architecture**: Securely isolates data for each connected Shopify store
- **Shopify OAuth Integration**: Simple installation process for store owners
- **Real-time Data Sync**: Webhook-driven updates for immediate data consistency
- **Scheduled Backfill**: Automatic delta synchronization to keep data fresh
- **Business Insights**: Pre-built analytics endpoints for revenue, customers, and products
- **Admin Dashboard Access**: Google OAuth for authorized personnel
- **Caching Layer**: Redis-based caching for improved performance

### Problem Solved

Shopify store owners often struggle to get a holistic view of their business performance across multiple stores. Xenoit provides a centralized platform to:

- Aggregate data from multiple Shopify stores
- Maintain up-to-date information with real-time sync
- Generate actionable insights without manual data exports
- Provide secure access to authorized team members

### Scope

This backend service handles:
- Shopify store connections via OAuth
- Data ingestion from Shopify APIs
- Webhook processing for real-time updates
- Data persistence in a multi-tenant database
- Business insights generation
- Admin dashboard authentication

### Non-Goals

- Frontend UI implementation (handled separately)
- Payment processing
- Inventory management
- Direct store modifications

---

## 2) Architecture

### System Architecture

<image src="https://github.com/hariharbajpai/Shopify-Xeno/blob/main/architecture.png"   alt="Xenoit Architecture"> 


### Components and Responsibilities

1. **API Layer (Express.js)**
   - Routes and controllers for all endpoints
   - Request/response handling
   - Middleware integration

2. **Authentication Service**
   - Google OAuth for admin dashboard access
   - Session management
   - Role-based access control

3. **Shopify Integration Service**
   - OAuth flow handling
   - API client for REST/GraphQL calls
   - Webhook verification and processing

4. **Data Ingestion Service**
   - Full and delta sync mechanisms
   - Pagination and rate limiting
   - Data deduplication and idempotency

5. **Data Persistence Layer (Prisma)**
   - Database ORM
   - Multi-tenant data isolation
   - Query optimization

6. **Caching Layer (Redis)**
   - Response caching for improved performance
   - Cache invalidation strategies

### Data Flow & Isolation Guarantees

1. **Tenant Identification**: Each request is associated with a specific Shopify store through the `X-Tenant-Key` header or `shop` domain
2. **Data Isolation**: All database queries are automatically scoped to the tenant's data
3. **Request Processing**: Middleware ensures tenant context is maintained throughout the request lifecycle
4. **Cache Isolation**: Redis cache keys are tenant-specific to prevent data leakage

---

## 3) Tech Stack & Rationale

### Core Technologies

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **Node.js 18+** | Runtime environment | JavaScript ecosystem, excellent for API development |
| **Express 5** | Web framework | Lightweight, mature, extensive middleware ecosystem |
| **Prisma** | ORM | Type-safe database queries, excellent developer experience |
| **PostgreSQL** | Primary database | Reliable, supports JSONB for flexible data storage |
| **Redis** | Caching | High-performance in-memory cache, supports complex data structures |

### Authentication & Security

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **Passport.js** | Authentication middleware | Flexible, well-tested, supports multiple strategies |
| **Google OAuth 2.0** | Identity provider | Trusted provider, easy for users to adopt |
| **express-session** | Session management | Simple session handling with cookie support |
| **express-rate-limit** | Rate limiting | Protection against abuse and DoS attacks |
| **helmet** | Security headers | Protection against common web vulnerabilities |

### Utilities & Libraries

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **dotenv** | Environment management | Standard way to manage configuration |
| **morgan** | Request logging | HTTP request logger for debugging |
| **jsonwebtoken** | JWT handling | Standard token-based authentication |
| **node-cron** | Scheduled tasks | Simple cron-like job scheduling |
| **@upstash/redis** | Redis client | Serverless Redis compatible client |

### Design Decisions

1. **Node.js + Express**: Chosen for its non-blocking I/O model, which is ideal for handling numerous concurrent Shopify API requests
2. **Prisma**: Selected for its type safety and auto-generated client, reducing database-related bugs
3. **PostgreSQL**: Used for its reliability, JSONB support for storing raw Shopify payloads, and strong consistency guarantees
4. **Redis**: Implemented for caching frequently accessed data to reduce database load and improve response times
5. **Multi-tenant Architecture**: Designed to isolate data between different Shopify stores while maintaining efficiency

---

## 4) Folder Structure

```
backend/
├── config/                 # Configuration files
│   ├── passport.js         # Google OAuth configuration
│   ├── redis.js            # Redis client setup
│   └── shopify.js          # Shopify API client and utilities
├── controllers/            # Request handlers
│   ├── auth.controller.js  # Google OAuth flow handlers
│   ├── ingest.controller.js# Data ingestion endpoints
│   ├── insights.controller.js# Business insights endpoints
│   ├── shopify.controller.js# Shopify OAuth and callback handlers
│   └── webhook.controller.js# Webhook processing
├── middleware/             # Express middleware
│   ├── adminOnly.js        # Admin access restriction
│   ├── auth.js             # JWT token authentication
│   ├── cache.js            # Response caching
│   ├── errorHandler.js     # Centralized error handling
│   ├── rateLimiter.js      # Rate limiting
│   ├── sessionAuth.js      # Session-based authentication
│   ├── shopifyHmac.js      # Shopify webhook verification
│   └── tenant.js           # Tenant resolution
├── models/                 # Database models
│   └── db.js               # Prisma client initialization
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma       # Database schema definition
│   └── migrations/         # Database migration files
├── repositories/           # Data access layer
│   ├── customer.repo.js    # Customer data operations
│   ├── order.repo.js       # Order data operations
│   ├── product.repo.js     # Product data operations
│   ├── tenant.repo.js      # Tenant data operations
│   └── webhookEvent.repo.js# Webhook event logging
├── routes/                 # API route definitions
│   ├── auth.routes.js      # Authentication routes
│   ├── ingest.routes.js    # Data ingestion routes
│   ├── insights.routes.js  # Business insights routes
│   └── shopify.routes.js   # Shopify integration routes
├── services/               # Business logic
│   ├── ingest.service.js   # Data ingestion logic
│   ├── shopify.service.js  # Shopify integration logic
│   └── webhook.service.js  # Webhook processing logic
├── utils/                  # Utility functions
│   ├── crypto.js           # Cryptographic utilities
│   └── env.js              # Environment variable validation
├── index.js                # Application entry point
├── package.json            # Dependencies and scripts
└── .env.example            # Environment variable examples
```

---

## 5) Environment & Configuration

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_prisma_accelerate_key"

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Session Management
SESSION_SECRET=your_session_secret_here

# Shopify App Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=read_products,read_orders,read_customers
SHOPIFY_REDIRECT_URI=http://localhost:4000/auth/shopify/callback
SHOPIFY_WEBHOOK_URI=http://localhost:4000/webhooks/shopify
SHOPIFY_API_VERSION=2024-10

# Dev Store Configuration
DEV_SHOP_DOMAIN=your-store.myshopify.com
DEV_ADMIN_TOKEN=shpat_your_access_token

# Frontend URLs
FRONTEND_SUCCESS_URL=http://localhost:5173/dashboard
FRONTEND_FAILURE_URL=http://localhost:5173/login
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Redis Cache (Optional)
UPSTASH_REDIS_REST_URL=https://your-redis-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Cron Configuration
CRON_SYNC_EVERY_MINUTES=15
```

### Secure Defaults

1. **Session Cookies**: HTTP-only, secure in production, same-site lax
2. **CORS**: Restricted to specified origins only
3. **Rate Limiting**: Default 100 requests per 15 minutes
4. **Helmet.js**: Security headers enabled by default
5. **Environment Validation**: Required variables are validated at startup

### Local vs Production Differences

| Aspect | Local Development | Production |
|--------|------------------|------------|
| **Database** | Prisma Accelerate | Direct PostgreSQL connection |
| **Session Cookies** | HTTP-only | HTTP-only + Secure flag |
| **CORS** | Permissive for localhost | Restricted to specific origins |
| **Logging** | Development-friendly | Structured for monitoring |
| **Rate Limits** | Higher thresholds | Stricter limits |

---

## 6) Installation & Local Setup

### Prerequisites

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL** - Install locally or use a cloud provider
3. **Redis** (Optional) - For caching features
4. **Shopify Partner Account** - For app creation and testing

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd shopify-xenoit/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Health Check**
   Visit `http://localhost:4000/health` to verify the service is running

### Common Pitfalls & Fixes

1. **Database Connection Issues**
   - Ensure `DATABASE_URL` is correctly configured
   - Verify PostgreSQL is running and accessible
   - Check firewall settings if using a remote database

2. **OAuth Configuration Errors**
   - Verify Google OAuth credentials in Google Cloud Console
   - Ensure redirect URIs match configured values
   - Check that the correct scopes are requested

3. **Shopify App Setup**
   - Confirm API credentials match your Shopify Partner account
   - Ensure webhook URLs are publicly accessible (use ngrok for local development)
   - Verify app is installed on test store

---

## 7) Authentication & Authorization

### Google OAuth Flow

### Session Management

The application uses cookie-based sessions for authentication:

1. **Session Storage**: Server-side session storage using express-session
2. **Cookie Security**: HTTP-only, secure (in production), same-site lax
3. **Session Duration**: 24 hours by default
4. **Session Regeneration**: New session ID on login for security

### Role Model

| Role | Permissions |
|------|-------------|
| **user** | View insights, basic dashboard access |
| **admin** | All user permissions + data ingestion controls |

### Protected Route Guards

Routes are protected using middleware:
- `requireSessionUser`: Ensures user is authenticated
- `requireAdmin`: Ensures user has admin role
- `resolveTenant`: Ensures tenant context is available

### Tenant Resolution Strategy

Tenants are resolved using:
1. `X-Tenant-Key` header
2. `X-Shop-Domain` header
3. `tenant` or `shop` query parameter

The resolved tenant context is attached to the request object for use in controllers.

---

## 8) Shopify Integration

### Required Scopes

| Scope | Purpose | Justification |
|-------|---------|---------------|
| `read_products` | Access product data | For inventory and sales analysis |
| `read_orders` | Access order data | For revenue and customer insights |
| `read_customers` | Access customer data | For customer segmentation and analysis |

### OAuth Installation Flow

1. **Install URL**: `/auth/shopify?shop={shop-domain}`
2. **Redirect**: User is redirected to Shopify OAuth consent screen
3. **Callback**: Shopify redirects back to `/auth/shopify/callback`
4. **Token Exchange**: Backend exchanges code for access token
5. **Webhook Registration**: Backend registers required webhooks
6. **Tenant Creation**: Store connection is saved in database

### Webhooks

#### Registered Topics

- `orders/create` - New order notifications
- `orders/updated` - Order updates
- `orders/fulfilled` - Order fulfillment
- `orders/cancelled` - Order cancellations
- `customers/create` - New customer notifications
- `customers/update` - Customer updates
- `products/create` - New product notifications
- `products/update` - Product updates
- `products/delete` - Product deletions
- `app/uninstalled` - App uninstall notifications

#### Webhook Verification

All webhooks are verified using HMAC signatures:
1. Extract `X-Shopify-Hmac-Sha256` header
2. Compute HMAC using request body and app secret
3. Compare computed HMAC with header value
4. Reject if they don't match

#### Retry Strategy & Idempotency

1. **Retry Logic**: Shopify automatically retries failed webhooks
2. **Idempotency**: Webhook events are logged with unique identifiers
3. **Duplicate Handling**: Duplicate events are detected and ignored
4. **Error Handling**: Failed processing is logged for manual review

---

## 9) Data Model & Persistence

### Prisma Schema



### Entity Relationship Diagram

### Tenancy Isolation Pattern

1. **Foreign Key Relationships**: All tenant-specific data references the Tenant model
2. **Unique Constraints**: Composite unique indexes on (tenantId, shopId) ensure data isolation
3. **Query Scoping**: Middleware automatically scopes all queries to the current tenant
4. **Indexing**: TenantId is indexed on all related models for performance

### Pagination & Versioning Strategy

1. **Pagination**: Shopify API pagination using cursor-based navigation
2. **Delta Sync**: Timestamp-based cursors for incremental updates
3. **Versioning**: Database records are updated in-place with updatedAt timestamps
4. **History**: Raw Shopify payloads stored in JSONB for potential reprocessing

---

## 10) Ingestion Jobs (Backfill & Sync)

### Ingestion Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ingest/full` | POST | Full data backfill for a tenant |
| `/ingest/products` | POST | Backfill products only |
| `/ingest/customers` | POST | Backfill customers only |
| `/ingest/orders` | POST | Backfill orders only |
| `/ingest/delta` | GET | Delta sync using stored cursors |

### Cron-based Sync

A scheduled job runs every 15 minutes (configurable) to perform delta synchronization for all active tenants:

1. Retrieves all active tenants from the database
2. For each tenant, performs delta sync for products, customers, and orders
3. Updates sync cursors to current timestamp

### Shopify API Usage

1. **REST API**: Used for most data ingestion operations
2. **GraphQL**: Not currently implemented but available for complex queries
3. **Pagination**: Cursor-based pagination with 250 item limit per page
4. **Rate Limits**: Automatic retry with exponential backoff on 429 responses

### Error Handling & Retries

1. **Retry Logic**: Exponential backoff for rate-limited requests
2. **Error Logging**: Failed requests are logged with full context
3. **Partial Success**: Processing continues even if individual items fail
4. **Manual Recovery**: Failed batches can be reprocessed manually

---

## 11) API Reference

### Authentication Endpoints

#### Google OAuth Login
```http
GET /auth/google
```

Initiates Google OAuth flow for admin dashboard access.

#### Google OAuth Callback
```http
GET /auth/google/callback
```

Handles OAuth callback from Google and establishes user session.

#### Get Current User
```http
GET /auth/user
```

Returns information about the currently authenticated user.

#### Logout
```http
POST /auth/logout
```

Destroys user session and clears authentication cookies.

### Shopify Integration Endpoints

#### Start Shopify Installation
```http
GET /auth/shopify?shop={shop-domain}
```

Initiates OAuth flow to connect a Shopify store.

#### Shopify OAuth Callback
```http
GET /auth/shopify/callback
```

Handles OAuth callback from Shopify and registers webhooks.

#### Receive Webhooks
```http
POST /webhooks/shopify
```

Endpoint for receiving Shopify webhooks.

### Ingestion Endpoints

#### Full Data Backfill
```http
POST /ingest/full
Headers: X-Tenant-Key: {tenant-id}
```

Triggers full data backfill for the specified tenant.

#### Products Backfill
```http
POST /ingest/products
Headers: X-Tenant-Key: {tenant-id}
```

Backfills all products for the specified tenant.

#### Customers Backfill
```http
POST /ingest/customers
Headers: X-Tenant-Key: {tenant-id}
```

Backfills all customers for the specified tenant.

#### Orders Backfill
```http
POST /ingest/orders
Headers: X-Tenant-Key: {tenant-id}
```

Backfills all orders for the specified tenant.

#### Delta Sync
```http
GET /ingest/delta
Headers: X-Tenant-Key: {tenant-id}
```

Performs incremental sync using stored cursors.

### Insights Endpoints

#### Summary Statistics
```http
GET /insights/summary
Headers: X-Tenant-Key: {tenant-id}
```

Returns total customers, orders, and revenue for the tenant.

#### Orders by Date
```http
GET /insights/orders-by-date?from={date}&to={date}
Headers: X-Tenant-Key: {tenant-id}
```

Returns daily order counts and revenue within a date range.

#### Top Customers
```http
GET /insights/top-customers?limit={number}
Headers: X-Tenant-Key: {tenant-id}
```

Returns top spending customers.

#### Top Products
```http
GET /insights/top-products?limit={number}
Headers: X-Tenant-Key: {tenant-id}
```

Returns best-selling products by revenue.

#### Recent Orders
```http
GET /insights/recent-orders?limit={number}&offset={number}
Headers: X-Tenant-Key: {tenant-id}
```

Returns most recent orders with pagination.

---

## 12) Frontend Components

The frontend of Xenoit is built with React and TypeScript, utilizing modern UI components and data visualization libraries. The dashboard provides comprehensive business insights through interactive charts and tables.

### Key Components

1. **Dashboard Overview**: Main analytics dashboard with KPIs and performance metrics
2. **Data Visualization**: Interactive charts for revenue trends, product performance, and customer insights
3. **Recent Orders Table**: Real-time display of the latest orders with status tracking
4. **Navigation System**: Intuitive menu system for accessing different sections of the application
5. **Authentication Flow**: Secure login and session management using Google OAuth

### Data Fetching

All frontend components fetch data directly from the Xenoit backend APIs. The frontend makes HTTP requests to the backend endpoints to retrieve real-time business insights, which are then displayed in an intuitive and visually appealing manner.

### Responsive Design

The frontend is fully responsive and works across all device sizes, from mobile phones to large desktop displays. The UI adapts to different screen sizes while maintaining usability and visual appeal.

---

## 13) Rate Limiting & Throttling

### Application-Level Rate Limiting

The application implements rate limiting to prevent abuse:

1. **General API**: 100 requests per 15 minutes per IP
2. **Strict Endpoints**: 5 requests per 15 minutes (for sensitive operations)
3. **Webhooks**: 1000 requests per minute (with Shopify bypass)

### Shopify API Rate Limiting

1. **Request Throttling**: 500ms delay between Shopify API requests
2. **Retry Logic**: Exponential backoff for 429 responses
3. **Budget Management**: Not currently implemented but planned

### Concurrency Settings

1. **Database Connections**: Prisma connection pooling
2. **HTTP Connections**: Node.js default concurrency
3. **Background Jobs**: Single-threaded cron execution

---

## 14) Observability

### Logging Format

All logs follow a structured format with timestamps, log levels, and contextual information:

```
[2024-01-01T10:00:00.000Z] INFO: Starting server initialization...
[2024-01-01T10:00:01.000Z] DEBUG: Database connected successfully
[2024-01-01T10:00:02.000Z] INFO: Server running on port 4000
```

### Log Levels

1. **ERROR**: Critical issues that require immediate attention
2. **WARN**: Potential problems that should be investigated
3. **INFO**: General operational information
4. **DEBUG**: Detailed information for debugging purposes

### Health Endpoints

#### Basic Health Check
```http
GET /health
```

Returns the status of the application and database connection:
```json
{
  "ok": true,
  "database": "connected",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "environment": "development"
}
```

#### Data Summary
```http
GET /api/data-summary
```

Returns a summary of ingested data:
```json
{
  "success": true,
  "timestamp": "2024-01-01T10:00:00.000Z",
  "counts": {
    "tenants": 5,
    "products": 1250,
    "customers": 3420,
    "orders": 876,
    "lineItems": 2103
  }
}
```

### Metrics & Tracing

Currently, the application uses basic logging for observability. Future enhancements could include:

1. **Prometheus Integration**: For metrics collection and monitoring
2. **OpenTelemetry**: For distributed tracing
3. **Error Tracking**: Integration with services like Sentry

### Alerts to Watch

1. **Database Connection Failures**: Monitor for database connectivity issues
2. **High Error Rates**: Track 5xx responses in the application
3. **Rate Limiting**: Monitor for excessive rate limiting
4. **Webhook Processing Failures**: Track failed webhook deliveries

---

## 15) Security

### HMAC Verification

All Shopify webhooks and OAuth callbacks are verified using HMAC signatures:

1. **Webhook Verification**: Uses `X-Shopify-Hmac-Sha256` header
2. **OAuth Callback Verification**: Verifies query parameters
3. **Raw Body Preservation**: Maintains raw request body for verification

### OAuth Security

1. **State Parameter**: Used to prevent CSRF attacks during OAuth flow
2. **Token Storage**: Access tokens are stored securely in the database
3. **Session Management**: Secure session cookies with proper flags

### Cookie Security

1. **HttpOnly**: Prevents XSS attacks
2. **Secure**: Only sent over HTTPS in production
3. **SameSite**: Set to 'lax' to prevent CSRF
4. **Expiration**: Sessions expire after 24 hours

### CORS Protection

1. **Origin Validation**: Only allows specified origins
2. **Credentials**: Allows credentials only for trusted origins
3. **Methods**: Restricts allowed HTTP methods

### Secrets Management

1. **Environment Variables**: All secrets stored in environment variables
2. **.gitignore**: .env files are excluded from version control
3. **Validation**: Required environment variables are validated at startup

### Data Protection

1. **Input Validation**: All inputs are validated
2. **SQL Injection**: Prevented through Prisma ORM
3. **XSS Prevention**: Output is properly escaped
4. **Tenant Isolation**: Data is isolated between tenants

### Dependency Security

1. **Regular Updates**: Dependencies are regularly updated
2. **Security Audits**: npm audit is run to identify vulnerabilities
3. **Known Vulnerabilities**: Monitor for known security issues

---

## 16) Testing

### Test Types

1. **Unit Tests**: Test individual functions and modules
2. **Integration Tests**: Test interactions between components
3. **End-to-End Tests**: Test complete user workflows

### Running Tests Locally

```
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/auth.test.js
```

### Test Data Strategies

1. **Mocking**: Use mocks for external services like Shopify API
2. **Fixtures**: Use predefined data sets for consistent testing
3. **Test Database**: Use a separate database for testing
4. **Shopify Dev Stores**: Use development stores for integration testing

### CI/CD Testing

1. **Automated Testing**: Tests run automatically on every commit
2. **Coverage Reports**: Code coverage is measured and reported
3. **Performance Tests**: Load testing for critical endpoints
4. **Security Scans**: Automated security scanning

---

## 17) Deployment & Environments

### Target Platforms

The application can be deployed to:

1. **Render** - With one-click deployment
2. **Railway** - With environment variable configuration
3. **Heroku** - With Procfile and environment setup
4. **Vercel** - With serverless function adaptation

### Live Demo

You can access the deployed application at: [https://shopify-xeno.onrender.com](https://shopify-xeno.onrender.com)

### Build & Run Commands

```
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start the application
npm start
```

### Environment Configuration

1. **Environment Variables**: Configure through platform-specific methods
2. **Database Connection**: Set DATABASE_URL for production database
3. **OAuth Credentials**: Configure Google OAuth for production
4. **Shopify App**: Update callback URLs for production

### Deployment Process

1. **Code Push**: Push code to deployment platform
2. **Build**: Platform automatically runs build process
3. **Migrate**: Run database migrations
4. **Deploy**: Start application instances
5. **Verify**: Check health endpoints

### Rollback Strategy

1. **Version Control**: Use Git tags for versioning
2. **Database Migrations**: Use reversible migrations when possible
3. **Blue/Green Deployment**: Deploy to new environment first
4. **Health Checks**: Verify before switching traffic

---

## 18) Performance & Scaling

### Known Bottlenecks

1. **Database Queries**: Complex queries may become slow with large datasets
2. **Shopify API Limits**: Rate limiting can affect data ingestion speed
3. **Memory Usage**: Large data sets may cause memory issues
4. **Network Latency**: Shopify API calls may have variable latency

### Caching Strategy

1. **Redis Cache**: Used for frequently accessed data
2. **Cache Invalidation**: Cache is invalidated when data changes
3. **Cache Keys**: Tenant-specific cache keys prevent data leakage
4. **TTL Management**: Time-to-live settings prevent stale data

### N+1 Mitigation

1. **Batch Queries**: Use Prisma's batch operations
2. **Data Loader**: Implement data loader pattern for related data
3. **Eager Loading**: Load related data in single queries
4. **Query Optimization**: Optimize database queries

### Horizontal Scaling

1. **Stateless Application**: Application can be scaled horizontally
2. **Shared Database**: Database is shared across instances
3. **Shared Cache**: Redis cache is shared across instances
4. **Load Balancing**: Platform handles load balancing

### Cost Considerations

1. **Database**: PostgreSQL costs based on usage
2. **Compute**: Server costs based on instance size
3. **Cache**: Redis costs based on memory usage
4. **API Calls**: Shopify API call limits and costs

---

## 19) Troubleshooting & FAQs

### Common OAuth Issues

**Problem**: "Redirect URI mismatch" error
**Solution**: Ensure Google OAuth redirect URI matches exactly: `http://localhost:4000/auth/google/callback`

**Problem**: "Invalid HMAC" error during Shopify OAuth
**Solution**: Verify Shopify API secret matches environment variable

### Webhook Issues

**Problem**: Webhooks returning 401
**Solution**: Check HMAC verification and ensure proper raw body parsing

**Problem**: Webhooks not being received
**Solution**: Verify webhook URLs are publicly accessible and correctly registered

### Database Issues

**Problem**: Prisma migration conflicts
**Solution**: Reset database and re-run migrations:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

**Problem**: Connection timeouts
**Solution**: Check database URL and network connectivity

### CORS Errors

**Problem**: Frontend requests blocked by CORS
**Solution**: Verify CORS_ORIGINS environment variable includes frontend URL

### Ngrok Tips

For local development with Shopify webhooks:
1. Install ngrok: `npm install -g ngrok`
2. Start tunnel: `ngrok http 4000`
3. Update environment variables with ngrok URL
4. Update Shopify app settings with ngrok URLs

---

## 20) Limitations & Future Work

### Current Constraints

1. **Single Region**: Application runs in a single region
2. **Limited Caching**: Only basic Redis caching implemented
3. **No GraphQL**: Shopify GraphQL API not yet integrated
4. **Basic Rate Limiting**: Simple rate limiting without sophisticated algorithms
5. **Limited Admin Features**: Basic admin functionality only

### Next Steps

1. **Advanced Analytics**: Implement more sophisticated business insights
2. **GraphQL Integration**: Add Shopify GraphQL API support
3. **Enhanced Caching**: Implement more advanced caching strategies
4. **Multi-region Support**: Deploy to multiple regions for better performance
5. **Advanced Admin**: Add comprehensive admin dashboard features
6. **Notification System**: Implement email/SMS notifications
7. **Data Export**: Add data export functionality
8. **Mobile API**: Optimize API for mobile applications

---

## 21) Changelog & Versioning

### Versioning Policy

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backward-compatible functionality additions
- **PATCH** version for backward-compatible bug fixes

### Release Notes Format

```
## [1.2.0] - 2024-01-01
### Added
- New feature X
- New feature Y

### Changed
- Improved performance of endpoint Z

### Fixed
- Bug in authentication flow
- Issue with data synchronization
```

---

## 22) License & Credits

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Acknowledgements

- [Shopify](https://www.shopify.com/) for providing the e-commerce platform and APIs
- [Prisma](https://www.prisma.io/) for the excellent ORM
- [Express.js](https://expressjs.com/) for the web framework
- [Passport.js](http://www.passportjs.org/) for authentication middleware
- All open-source libraries and tools that made this project possible

---

## 23) Appendices

### A) Postman Collection

The Postman collection includes folders for:

1. **Authentication**: Google OAuth and session management
2. **Shopify Integration**: OAuth flow and webhook handling
3. **Data Ingestion**: Backfill and sync endpoints
4. **Business Insights**: Analytics and reporting endpoints

Example variables:
- `baseUrl`: http://localhost:4000
- `tenantId`: Your tenant ID
- `shopDomain`: Your Shopify domain

### B) Env Matrix

| Variable | Purpose | Example | Required | Environments |
|----------|---------|---------|----------|--------------|
| NODE_ENV | Environment | development | Yes | All |
| PORT | Server port | 4000 | Yes | All |
| DATABASE_URL | Database connection | postgresql://... | Yes | All |
| GOOGLE_CLIENT_ID | Google OAuth client ID | abc123 | Yes | All |
| GOOGLE_CLIENT_SECRET | Google OAuth secret | xyz789 | Yes | All |
| SESSION_SECRET | Session encryption | secretkey | Yes | All |
| SHOPIFY_API_KEY | Shopify API key | apikey | Yes | All |
| SHOPIFY_API_SECRET | Shopify API secret | apisecret | Yes | All |

### C) Glossary

| Term | Definition |
|------|------------|
| **Tenant** | A Shopify store connected to the application |
| **HMAC** | Hash-based Message Authentication Code for security |
| **Webhook** | HTTP callback for real-time notifications |
| **Delta Sync** | Incremental data synchronization |
| **Backfill** | Complete data synchronization |
| **Idempotent** | Operation that can be applied multiple times without changing result |
| **Cursor** | Pointer for pagination through data sets |
| **OAuth** | Open standard for access delegation |
| **Prisma** | Next-generation ORM for Node.js and TypeScript |
| **Redis** | In-memory data structure store |
