// API Testing and Debugging Script
// Run this with: node debug-api.js

const API_BASE = 'https://social-backend-y1rg.onrender.com';

async function testAPI() {
  console.log('🚀 Testing Social App API Endpoints...\n');

  // Test 1: Basic showcase endpoint without token
  console.log('1. Testing basic showcase endpoint (no auth)...');
  try {
    const response = await fetch(`${API_BASE}/showcase/get`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Message: ${data.message}`);
    console.log(`   Data: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Test 2: Try alternative showcase endpoint
  console.log('\n2. Testing alternative showcase endpoints...');
  const endpoints = [
    '/showcases',
    '/showcase/all',
    '/showcases/all',
    '/api/showcase/get',
    '/api/showcases'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`   Trying: ${API_BASE}${endpoint}`);
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.status !== 404) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint} - Status: ${response.status}, Success: ${data.success}`);
        if (data.success) {
          console.log(`   Data preview: ${JSON.stringify(data, null, 2).substring(0, 150)}...`);
          break;
        }
      } else {
        console.log(`   ❌ ${endpoint} - 404 Not Found`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint} - Error: ${error.message}`);
    }
  }

  // Test 3: Test upvote endpoints (without authentication)
  console.log('\n3. Testing upvote endpoint structure...');
  const upvoteEndpoints = [
    '/showcase/upvote/test-id',
    '/showcase/test-id/upvote',
    '/showcase/upvote',
    '/showcases/upvote/test-id',
    '/api/showcase/upvote/test-id'
  ];

  for (const endpoint of upvoteEndpoints) {
    try {
      console.log(`   Testing: ${API_BASE}${endpoint}`);
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showcaseId: 'test-id' })
      });
      
      console.log(`   Status: ${response.status}`);
      if (response.status !== 404) {
        try {
          const data = await response.json();
          console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 100)}...`);
        } catch (e) {
          console.log(`   Raw response: ${await response.text()}`);
        }
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n🏁 API Testing Complete');
}

// Run the test
testAPI().catch(console.error);
