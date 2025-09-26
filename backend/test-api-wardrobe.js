const fetch = require('node-fetch');

async function testWardrobeAPI() {
  try {
    // First, login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'priya@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (loginData.status !== 'success') {
      console.log('❌ Login failed');
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');

    // Get a room ID
    console.log('🏠 Getting rooms...');
    const roomsResponse = await fetch('http://localhost:5000/api/rooms', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const roomsData = await roomsResponse.json();
    console.log('Rooms response:', roomsData);

    if (roomsData.status !== 'success' || !roomsData.data.rooms.length) {
      console.log('❌ No rooms found');
      return;
    }

    const roomId = roomsData.data.rooms[0]._id;
    console.log('✅ Found room:', roomId);

    // Test wardrobe creation
    console.log('👗 Creating wardrobe...');
    const wardrobeData = {
      name: 'Test API Wardrobe',
      emoji: '👗',
      description: 'Test description',
      occasionType: 'General Collection',
      isPrivate: false,
      roomId: roomId,
      members: []
    };

    console.log('📝 Sending data:', wardrobeData);

    const wardrobeResponse = await fetch('http://localhost:5000/api/wardrobes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wardrobeData)
    });

    const wardrobeResult = await wardrobeResponse.json();
    console.log('Wardrobe creation response:', wardrobeResult);

    if (wardrobeResult.status === 'success') {
      console.log('✅ Wardrobe created successfully!');
    } else {
      console.log('❌ Wardrobe creation failed:', wardrobeResult.message);
      if (wardrobeResult.errors) {
        console.log('Validation errors:', wardrobeResult.errors);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWardrobeAPI();

