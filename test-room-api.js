#!/usr/bin/env node

/**
 * Simple test script to verify room API endpoints are working
 * Run this with: node test-room-api.js
 */

const API_BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Room API Integration...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connectivity...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server health check failed');
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('   Make sure to start the backend server with: cd backend && npm start');
    return;
  }

  try {
    // Test 2: Test rooms endpoint (should require auth)
    console.log('\n2️⃣ Testing rooms endpoint...');
    const roomsResponse = await fetch(`${API_BASE_URL}/rooms`);
    console.log(`   Status: ${roomsResponse.status}`);
    
    if (roomsResponse.status === 401) {
      console.log('✅ Authentication required (expected)');
    } else if (roomsResponse.status === 200) {
      console.log('✅ Rooms endpoint accessible');
      const data = await roomsResponse.json();
      console.log(`   Found ${data.data?.rooms?.length || 0} rooms`);
    } else {
      console.log(`❌ Unexpected status: ${roomsResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Error testing rooms endpoint:', error.message);
  }

  try {
    // Test 3: Test room creation (should require auth)
    console.log('\n3️⃣ Testing room creation...');
    const createResponse = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Room',
        emoji: '🧪',
        description: 'Test room for API validation'
      })
    });
    
    console.log(`   Status: ${createResponse.status}`);
    
    if (createResponse.status === 401) {
      console.log('✅ Authentication required for room creation (expected)');
    } else if (createResponse.status === 201) {
      console.log('✅ Room creation endpoint accessible');
      const data = await createResponse.json();
      console.log(`   Created room: ${data.data?.room?.name}`);
    } else {
      console.log(`❌ Unexpected status: ${createResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Error testing room creation:', error.message);
  }

  console.log('\n🎯 Integration Test Summary:');
  console.log('   - Backend server should be running on http://localhost:5000');
  console.log('   - API endpoints are accessible at http://localhost:5000/api');
  console.log('   - Authentication is required for protected endpoints');
  console.log('   - Frontend should now be able to connect to the backend');
  
  console.log('\n📱 Next Steps:');
  console.log('   1. Start the backend: cd backend && npm start');
  console.log('   2. Start the frontend: npm start');
  console.log('   3. Test room creation and management in the app');
  console.log('   4. Check browser/device console for API call logs');
}

// Run the test
testAPI().catch(console.error);
