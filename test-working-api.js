// Test working API endpoints
const API_BASE = 'https://social-backend-y1rg.onrender.com';

async function testWorkingEndpoints() {
  console.log('🔍 Testing known working endpoints...\n');

  // Test endpoints that we know exist from the codebase
  const endpoints = [
    { path: '/post/all/allPosts/?filter=1', method: 'GET', needsAuth: true },
    { path: '/post/like', method: 'POST', needsAuth: true, body: { postId: 'test' } },
    { path: '/user/getUser', method: 'GET', needsAuth: true },
    { path: '/auth/login', method: 'POST', needsAuth: false, body: { email: 'test', password: 'test' } },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.method} ${API_BASE}${endpoint.path}`);
      
      const headers = { 'Content-Type': 'application/json' };
      if (endpoint.needsAuth) {
        headers['token'] = 'dummy-token'; // This will fail but we can see the error type
      }

      const options = {
        method: endpoint.method,
        headers,
      };

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(`${API_BASE}${endpoint.path}`, options);
      const data = await response.json();
      
      console.log(`  Status: ${response.status}`);
      console.log(`  Success: ${data.success}`);
      console.log(`  Message: ${data.message || 'No message'}`);
      
      if (response.status !== 404) {
        console.log('  ✅ Endpoint exists!');
      } else {
        console.log('  ❌ 404 - Endpoint not found');
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    console.log('');
  }

  // Test if there are any showcase endpoints by trying different patterns
  console.log('🔍 Testing possible showcase endpoint patterns...\n');
  
  const showcasePatterns = [
    '/post/like', // Maybe showcase items are treated as posts?
    '/like/showcase',
    '/like/post',
    '/likes/add',
    '/reaction/add',
    '/vote/add',
    '/upvote',
  ];

  for (const pattern of showcasePatterns) {
    try {
      console.log(`Testing: POST ${API_BASE}${pattern}`);
      
      const response = await fetch(`${API_BASE}${pattern}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': 'dummy-token'
        },
        body: JSON.stringify({ postId: 'test-id', showcaseId: 'test-id' })
      });

      console.log(`  Status: ${response.status}`);
      
      if (response.status !== 404) {
        const data = await response.json();
        console.log(`  Response: ${JSON.stringify(data, null, 2).substring(0, 100)}...`);
        console.log('  ✅ Potential working endpoint!');
      } else {
        console.log('  ❌ 404');
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🏁 Testing Complete');
}

testWorkingEndpoints().catch(console.error);
