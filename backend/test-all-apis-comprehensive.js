// test-all-apis-comprehensive.js
// Comprehensive testing for ALL APIs in the Shopify backend system

const BASE_URL = 'http://localhost:4000';

// Helper function to make requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return { response, data };
  } catch (error) {
    return { error: error.message };
  }
}

// Test results tracking
const results = { passed: 0, failed: 0, tests: [] };

function logResult(name, passed, details) {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}: ${details}`);
  results.tests.push({ name, passed, details });
  passed ? results.passed++ : results.failed++;
}

async function runComprehensiveTests() {
  console.log('🚀 Starting COMPREHENSIVE API Tests for Shopify Backend...\n');
  console.log('🔍 Testing ALL endpoints: Auth, Shopify, Insights, Ingest, Webhooks\n');

  // =============================================================================
  // 🏥 HEALTH & STATUS ENDPOINTS
  // =============================================================================
  console.log('📊 === HEALTH & STATUS ENDPOINTS ===');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing Health Endpoint...');
  const { response: healthRes, data: healthData, error: healthError } = await makeRequest(`${BASE_URL}/health`);
  
  if (healthError) {
    logResult('Health Check', false, `Connection error: ${healthError}`);
  } else if (healthRes.ok && healthData.ok) {
    logResult('Health Check', true, `Database: ${healthData.database}, Environment: ${healthData.environment}`);
  } else {
    logResult('Health Check', false, `Status: ${healthRes.status}`);
  }

  console.log('\n=============================================================================\n');

  // =============================================================================
  // 🔐 AUTHENTICATION ENDPOINTS
  // =============================================================================
  console.log('🔐 === AUTHENTICATION ENDPOINTS ===');

  // Test 2: Protected Auth Current Endpoint (should require auth)
  console.log('2️⃣ Testing Protected Auth Current Endpoint...');
  const { response: authRes, data: authData } = await makeRequest(`${BASE_URL}/auth/current`);
  
  if (authRes.status === 401) {
    logResult('Auth Protection', true, 'Correctly requires authentication');
  } else {
    logResult('Auth Protection', false, `Expected 401, got ${authRes.status}: ${JSON.stringify(authData)}`);
  }

  // Test 3: Auth User Endpoint (session-based)
  console.log('3️⃣ Testing Auth User Endpoint...');
  const { response: userRes, data: userData } = await makeRequest(`${BASE_URL}/auth/user`);
  
  if (userRes.status === 401 || userRes.status === 302) {
    logResult('Auth User Protection', true, 'Correctly requires session authentication');
  } else {
    logResult('Auth User Protection', false, `Expected 401/302, got ${userRes.status}: ${JSON.stringify(userData)}`);
  }

  // Test 4: Google OAuth Redirect
  console.log('4️⃣ Testing Google OAuth...');
  const { response: googleRes } = await makeRequest(`${BASE_URL}/auth/google`, { redirect: 'manual' });
  
  if (googleRes.status === 302) {
    const location = googleRes.headers.get('location');
    if (location && location.includes('accounts.google.com')) {
      logResult('Google OAuth', true, 'Correctly redirects to Google');
    } else {
      logResult('Google OAuth', false, `Invalid redirect: ${location}`);
    }
  } else {
    logResult('Google OAuth', false, `Expected 302, got ${googleRes.status}`);
  }

  // Test 5: Auth Logout
  console.log('5️⃣ Testing Auth Logout...');
  const { response: logoutRes, data: logoutData } = await makeRequest(`${BASE_URL}/auth/logout`, { method: 'POST' });
  
  if (logoutRes.status === 401 || logoutRes.status === 200) {
    logResult('Auth Logout', true, 'Logout endpoint accessible');
  } else {
    logResult('Auth Logout', false, `Unexpected status ${logoutRes.status}: ${JSON.stringify(logoutData)}`);
  }

  console.log('\n=============================================================================\n');

  // =============================================================================
  // 🛍️ SHOPIFY INTEGRATION ENDPOINTS
  // =============================================================================
  console.log('🛍️ === SHOPIFY INTEGRATION ENDPOINTS ===');

  // Test 6: Shopify OAuth
  console.log('6️⃣ Testing Shopify OAuth...');
  const testShop = 'test-shop.myshopify.com';
  const { response: shopifyRes } = await makeRequest(`${BASE_URL}/auth/shopify?shop=${testShop}`, { redirect: 'manual' });
  
  if (shopifyRes.status === 302) {
    const location = shopifyRes.headers.get('location');
    if (location && location.includes('test-shop.myshopify.com/admin/oauth/authorize')) {
      if (location.includes('localhost%3A4000') || location.includes('localhost:4000')) {
        logResult('Shopify OAuth', true, 'Correctly redirects with proper callback URL');
      } else {
        logResult('Shopify OAuth', false, `Redirect URI issue in: ${location}`);
      }
    } else {
      logResult('Shopify OAuth', false, `Invalid Shopify redirect: ${location}`);
    }
  } else {
    logResult('Shopify OAuth', false, `Expected 302, got ${shopifyRes.status}`);
  }

  // Test 7: Invalid Shop Domain Validation
  console.log('7️⃣ Testing Invalid Shop Validation...');
  const { response: invalidRes, data: invalidData } = await makeRequest(`${BASE_URL}/auth/shopify?shop=invalid-domain`);
  
  if (invalidRes.status === 400) {
    logResult('Shop Validation', true, 'Correctly rejects invalid shop domain');
  } else {
    logResult('Shop Validation', false, `Expected 400, got ${invalidRes.status}: ${JSON.stringify(invalidData)}`);
  }

  // Test 8: Shopify Callback (without proper params)
  console.log('8️⃣ Testing Shopify Callback Protection...');
  const { response: callbackRes, data: callbackData } = await makeRequest(`${BASE_URL}/auth/shopify/callback`);
  
  if (callbackRes.status === 400) {
    logResult('Shopify Callback Protection', true, 'Correctly requires proper OAuth parameters');
  } else {
    logResult('Shopify Callback Protection', false, `Expected 400, got ${callbackRes.status}: ${JSON.stringify(callbackData)}`);
  }

  console.log('\n=============================================================================\n');

  // =============================================================================
  // 📊 INSIGHTS ENDPOINTS 
  // =============================================================================
  console.log('📊 === INSIGHTS ENDPOINTS ===');

  // Test 9: Insights Summary (requires auth + tenant)
  console.log('9️⃣ Testing Insights Summary...');
  const { response: summaryRes, data: summaryData } = await makeRequest(`${BASE_URL}/insights/summary`);
  
  if (summaryRes.status === 401) {
    logResult('Insights Summary Protection', true, 'Correctly requires authentication');
  } else {
    logResult('Insights Summary Protection', false, `Expected 401, got ${summaryRes.status}: ${JSON.stringify(summaryData)}`);
  }

  // Test 10: Orders by Date
  console.log('🔟 Testing Orders by Date...');
  const { response: ordersRes, data: ordersData } = await makeRequest(`${BASE_URL}/insights/orders-by-date`);
  
  if (ordersRes.status === 401) {
    logResult('Orders by Date Protection', true, 'Correctly requires authentication');
  } else {
    logResult('Orders by Date Protection', false, `Expected 401, got ${ordersRes.status}: ${JSON.stringify(ordersData)}`);
  }

  // Test 11: Top Products
  console.log('1️⃣1️⃣ Testing Top Products...');
  const { response: topProductsRes, data: topProductsData } = await makeRequest(`${BASE_URL}/insights/top-products?limit=5`);
  
  if (topProductsRes.status === 401) {
    logResult('Top Products Protection', true, 'Correctly requires authentication');
  } else {
    logResult('Top Products Protection', false, `Expected 401, got ${topProductsRes.status}: ${JSON.stringify(topProductsData)}`);
  }

  // Test 12: Top Customers
  console.log('1️⃣2️⃣ Testing Top Customers...');
  const { response: topCustomersRes, data: topCustomersData } = await makeRequest(`${BASE_URL}/insights/top-customers?limit=5`);
  
  if (topCustomersRes.status === 401) {
    logResult('Top Customers Protection', true, 'Correctly requires authentication');
  } else {
    logResult('Top Customers Protection', false, `Expected 401, got ${topCustomersRes.status}: ${JSON.stringify(topCustomersData)}`);
  }

  // Test 13: Recent Orders
  console.log('1️⃣3️⃣ Testing Recent Orders...');
  const { response: recentOrdersRes, data: recentOrdersData } = await makeRequest(`${BASE_URL}/insights/recent-orders?limit=10`);
  
  if (recentOrdersRes.status === 401) {
    logResult('Recent Orders Protection', true, 'Correctly requires authentication');
  } else {
    logResult('Recent Orders Protection', false, `Expected 401, got ${recentOrdersRes.status}: ${JSON.stringify(recentOrdersData)}`);
  }

  console.log('\n=============================================================================\n');

  // =============================================================================
  // 📥 DATA INGESTION ENDPOINTS
  // =============================================================================
  console.log('📥 === DATA INGESTION ENDPOINTS ===');

  // Test 14: Ingest Products
  console.log('1️⃣4️⃣ Testing Ingest Products...');
  const { response: ingestProductsRes, data: ingestProductsData } = await makeRequest(`${BASE_URL}/ingest/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (ingestProductsRes.status === 401) {
    logResult('Ingest Products Protection', true, 'Correctly requires authentication');
  } else {
    logResult('Ingest Products Protection', false, `Expected 401, got ${ingestProductsRes.status}: ${JSON.stringify(ingestProductsData)}`);
  }

  // Test 15: Ingest Customers
  console.log('1️⃣5️⃣ Testing Ingest Customers...');
  const { response: ingestCustomersRes, data: ingestCustomersData } = await makeRequest(`${BASE_URL}/ingest/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (ingestCustomersRes.status === 401) {
    logResult('Ingest Customers Protection', true, 'Correctly requires authentication');
  } else {
    logResult('Ingest Customers Protection', false, `Expected 401, got ${ingestCustomersRes.status}: ${JSON.stringify(ingestCustomersData)}`);
  }

  // Test 16: Ingest Orders
  console.log('1️⃣6️⃣ Testing Ingest Orders...');
  const { response: ingestOrdersRes, data: ingestOrdersData } = await makeRequest(`${BASE_URL}/ingest/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (ingestOrdersRes.status === 401) {
    logResult('Ingest Orders Protection', true, 'Correctly requires authentication');
  } else {
    logResult('Ingest Orders Protection', false, `Expected 401, got ${ingestOrdersRes.status}: ${JSON.stringify(ingestOrdersData)}`);
  }

  // Test 17: Ingest Full (all data)
  console.log('1️⃣7️⃣ Testing Ingest Full...');
  const { response: ingestFullRes, data: ingestFullData } = await makeRequest(`${BASE_URL}/ingest/full`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (ingestFullRes.status === 401) {
    logResult('Ingest Full Protection', true, 'Correctly requires authentication');
  } else {
    logResult('Ingest Full Protection', false, `Expected 401, got ${ingestFullRes.status}: ${JSON.stringify(ingestFullData)}`);
  }

  console.log('\n=============================================================================\n');

  // =============================================================================
  // 🪝 WEBHOOK ENDPOINTS
  // =============================================================================
  console.log('🪝 === WEBHOOK ENDPOINTS ===');

  // Test 18: Shopify Webhook (without HMAC - should fail)
  console.log('1️⃣8️⃣ Testing Shopify Webhook Protection...');
  const { response: webhookRes, data: webhookData } = await makeRequest(`${BASE_URL}/webhooks/shopify`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Shopify-Topic': 'orders/create',
      'X-Shopify-Shop-Domain': 'test-shop.myshopify.com'
    },
    body: JSON.stringify({
      id: 123456,
      name: '#1001',
      total_price: '99.99'
    })
  });
  
  if (webhookRes.status === 401) {
    logResult('Webhook HMAC Protection', true, 'Correctly requires valid HMAC signature');
  } else {
    logResult('Webhook HMAC Protection', false, `Expected 401, got ${webhookRes.status}: ${JSON.stringify(webhookData)}`);
  }

  console.log('\n=============================================================================\n');

  // =============================================================================
  // 🏢 TENANT ENDPOINTS (if implemented)
  // =============================================================================
  console.log('🏢 === TENANT ENDPOINTS ===');

  // Test 19: Get Current Tenant
  console.log('1️⃣9️⃣ Testing Current Tenant...');
  const { response: tenantRes, data: tenantData } = await makeRequest(`${BASE_URL}/tenants/current`);
  
  if (tenantRes.status === 404) {
    logResult('Tenant Endpoint', true, 'Endpoint not implemented yet (expected)');
  } else if (tenantRes.status === 401) {
    logResult('Tenant Endpoint', true, 'Correctly requires authentication');
  } else {
    logResult('Tenant Endpoint', false, `Unexpected status ${tenantRes.status}: ${JSON.stringify(tenantData)}`);
  }

  console.log('\n=============================================================================\n');

  // =============================================================================
  // 🔧 SYSTEM & ERROR HANDLING TESTS
  // =============================================================================
  console.log('🔧 === SYSTEM & ERROR HANDLING ===');

  // Test 20: Rate Limiting
  console.log('2️⃣0️⃣ Testing Rate Limiting...');
  const requests = [];
  for (let i = 0; i < 5; i++) {
    requests.push(makeRequest(`${BASE_URL}/health`));
  }
  
  const responses = await Promise.all(requests);
  const allSuccessful = responses.every(({ response }) => response && response.ok);
  
  if (allSuccessful) {
    logResult('Rate Limiting', true, 'All requests processed (within limits)');
  } else {
    const rateLimited = responses.some(({ response }) => response && response.status === 429);
    if (rateLimited) {
      logResult('Rate Limiting', true, 'Rate limiting working (some requests blocked)');
    } else {
      logResult('Rate Limiting', false, 'Unexpected response pattern');
    }
  }

  // Test 21: 404 Error Handling
  console.log('2️⃣1️⃣ Testing 404 Error Handling...');
  const { response: notFoundRes, data: notFoundData } = await makeRequest(`${BASE_URL}/non-existent-endpoint`);
  
  if (notFoundRes.status === 404 && notFoundData.message === 'not found') {
    logResult('404 Handling', true, 'Correctly returns 404 for non-existent endpoints');
  } else {
    logResult('404 Handling', false, `Expected 404 with 'not found', got ${notFoundRes.status}: ${JSON.stringify(notFoundData)}`);
  }

  // Test 22: CORS Headers
  console.log('2️⃣2️⃣ Testing CORS Configuration...');
  const { response: corsRes } = await makeRequest(`${BASE_URL}/health`, {
    headers: { 'Origin': 'http://localhost:3000' }
  });
  
  const corsHeader = corsRes.headers.get('Access-Control-Allow-Origin');
  if (corsHeader) {
    logResult('CORS Configuration', true, `CORS header present: ${corsHeader}`);
  } else {
    logResult('CORS Configuration', false, 'No CORS headers found');
  }

  console.log('\n=============================================================================\n');

  // =============================================================================
  // 📈 TEST SUMMARY & RESULTS
  // =============================================================================
  console.log('📈 === COMPREHENSIVE TEST SUMMARY ===');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total Tests: ${results.passed + results.failed}`);
  console.log(`📈 Success Rate: ${(results.passed / (results.passed + results.failed) * 100).toFixed(1)}%`);

  // Group results by category
  const categories = {
    'Health & Status': results.tests.filter(t => t.name.includes('Health')),
    'Authentication': results.tests.filter(t => t.name.includes('Auth') || t.name.includes('Google')),
    'Shopify Integration': results.tests.filter(t => t.name.includes('Shopify') || t.name.includes('Shop')),
    'Insights': results.tests.filter(t => t.name.includes('Insights') || t.name.includes('Orders') || t.name.includes('Products') || t.name.includes('Customers')),
    'Data Ingestion': results.tests.filter(t => t.name.includes('Ingest')),
    'Webhooks': results.tests.filter(t => t.name.includes('Webhook')),
    'System': results.tests.filter(t => t.name.includes('Rate') || t.name.includes('404') || t.name.includes('CORS') || t.name.includes('Tenant'))
  };

  console.log('\n📊 Results by Category:');
  Object.entries(categories).forEach(([category, tests]) => {
    const passed = tests.filter(t => t.passed).length;
    const total = tests.length;
    const rate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
    console.log(`  ${category}: ${passed}/${total} (${rate}%)`);
  });

  if (results.failed > 0) {
    console.log('\n🔧 Failed Tests Details:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   ❌ ${t.name}: ${t.details}`);
    });
  }

  console.log('\n🎯 Next Steps:');
  if (results.failed === 0) {
    console.log('   🎉 All tests passing! Your API is ready for production.');
  } else {
    console.log('   🔧 Fix the failing tests to ensure API reliability.');
    console.log('   📝 Most auth-protected endpoints should return 401 (this is expected).');
    console.log('   🔐 Implement proper authentication flow for full testing.');
  }

  console.log('\n🏁 Comprehensive Testing Complete!');
  return results;
}

// Run all tests
runComprehensiveTests().catch(console.error);