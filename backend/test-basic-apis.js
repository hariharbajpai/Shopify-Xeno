// test-scripts/test-basic-apis.js
// Basic API testing script for Node.js

const BASE_URL = 'http://localhost:4000';

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing Health Endpoint...');
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed:', data);
    } else {
      console.log('❌ Health check failed:', response.status, data);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Test CORS
  try {
    console.log('2️⃣ Testing CORS...');
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      }
    });
    
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    console.log('✅ CORS header:', corsHeader);
  } catch (error) {
    console.log('❌ CORS test error:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Test 404 Error Handling
  try {
    console.log('3️⃣ Testing 404 Error Handling...');
    const response = await fetch(`${BASE_URL}/non-existent-endpoint`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (response.status === 404) {
      console.log('✅ 404 handling works correctly');
    } else {
      console.log('❌ Unexpected status code');
    }
  } catch (error) {
    console.log('❌ 404 test error:', error.message);
  }

  console.log('\n---\n');

  // Test 4: Test Auth Endpoint (should require authentication)
  try {
    console.log('4️⃣ Testing Protected Auth Endpoint...');
    const response = await fetch(`${BASE_URL}/auth/current`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (response.status === 401) {
      console.log('✅ Auth protection works correctly');
    } else {
      console.log('❌ Auth endpoint should require authentication');
    }
  } catch (error) {
    console.log('❌ Auth test error:', error.message);
  }

  console.log('\n---\n');

  // Test 5: Test Shopify OAuth URL Generation
  try {
    console.log('5️⃣ Testing Shopify OAuth URL...');
    const testShop = 'test-shop.myshopify.com';
    const response = await fetch(`${BASE_URL}/auth/shopify?shop=${testShop}`, {
      redirect: 'manual' // Don't follow redirect
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 302) {
      const location = response.headers.get('location');
      console.log('✅ Redirect to Shopify OAuth:', location);
      
      if (location && location.includes('shopify.com/admin/oauth/authorize')) {
        console.log('✅ Shopify OAuth URL format is correct');
      } else {
        console.log('❌ Invalid Shopify OAuth URL format');
      }
    } else {
      console.log('❌ Expected redirect to Shopify');
    }
  } catch (error) {
    console.log('❌ Shopify OAuth test error:', error.message);
  }

  console.log('\n🏁 API Tests Complete!');
}

// Run tests
testAPI().catch(console.error);