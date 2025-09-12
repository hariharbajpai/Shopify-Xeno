// Quick script to set up test data and run ingestion tests
import { prisma } from './models/db.js';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000';

async function checkCurrentData() {
  console.log('📊 Current database state:');
  
  try {
    const response = await fetch(`${BASE_URL}/api/data-summary`);
    const data = await response.json();
    
    console.log('Counts:', data.counts);
    if (data.samples.tenant) {
      console.log('Sample tenant:', data.samples.tenant);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch data summary:', error.message);
    return null;
  }
}

async function createTestTenant() {
  console.log('🏪 Creating test tenant...');
  
  try {
    // Check if we already have a tenant
    const existingTenant = await prisma.tenant.findFirst();
    if (existingTenant) {
      console.log('✅ Found existing tenant:', existingTenant.shopDomain);
      return existingTenant;
    }

    // Create a test tenant - you'll need to replace these with real values
    const testTenant = await prisma.tenant.create({
      data: {
        tenantId: 'test-tenant-001',
        shopDomain: 'mystore.myshopify.com', // Replace with your actual shop domain
        accessToken: 'shpat_xxx', // Replace with your actual access token
        shopName: 'Test Store',\n        email: 'test@example.com',
        status: 'active'
      }
    });

    console.log('✅ Created test tenant:', testTenant.shopDomain);
    return testTenant;
  } catch (error) {
    console.error('❌ Failed to create tenant:', error.message);
    return null;
  }
}

async function testIngestAPI(endpoint, method = 'POST', tenantKey = 'mystore.myshopify.com') {
  console.log(`\n🧪 Testing ${method} ${endpoint}...`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Key': tenantKey
      }
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, data };
  } catch (error) {
    console.error(`❌ API test failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runIngestionTests() {
  console.log('🚀 Starting Shopify Data Ingestion Tests');
  console.log('='.repeat(50));

  // 1. Check current database state
  await checkCurrentData();

  // 2. Create test tenant if needed
  const tenant = await createTestTenant();
  if (!tenant) {
    console.log('❌ Cannot proceed without a valid tenant');
    return;
  }

  // 3. Test delta sync (doesn't require admin auth)
  console.log('\n📈 Testing Delta Sync...');
  await testIngestAPI('/ingest/delta', 'GET', tenant.shopDomain);

  // 4. Test specific ingestion endpoints
  console.log('\n🛍️ Testing Product Ingestion...');
  await testIngestAPI('/ingest/products', 'POST', tenant.shopDomain);

  console.log('\n👥 Testing Customer Ingestion...');
  await testIngestAPI('/ingest/customers', 'POST', tenant.shopDomain);

  console.log('\n📦 Testing Order Ingestion...');
  await testIngestAPI('/ingest/orders', 'POST', tenant.shopDomain);

  // 5. Check final database state
  console.log('\n📊 Final database state:');
  await checkCurrentData();

  console.log('\n✅ Ingestion tests completed!');
}

// Instructions
console.log(`
⚠️  IMPORTANT SETUP REQUIRED:

Before running these tests, you need to:

1. 📝 Update your .env file with valid Shopify credentials:
   - DEV_SHOP_DOMAIN=your-actual-shop.myshopify.com
   - DEV_ADMIN_TOKEN=shpat_your_actual_admin_access_token

2. 🔑 Get a Shopify access token:
   - Go to your Shopify admin panel
   - Navigate to Apps > App and sales channel settings
   - Click "Develop apps" > "Create an app"
   - Configure the app with required scopes: read_products, read_customers, read_orders
   - Install the app and copy the access token

3. 🏃 Run the tests:
   node setup-and-test.js

To check current data without running tests:
node setup-and-test.js --check-only
`);

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--check-only')) {
  checkCurrentData();
} else if (args.includes('--create-tenant')) {
  createTestTenant();
} else {
  runIngestionTests();
}