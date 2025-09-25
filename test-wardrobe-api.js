const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

const testWardrobe = {
  name: 'Test Wedding Wardrobe',
  emoji: '👰',
  description: 'Beautiful wedding collection',
  occasionType: 'Wedding & Celebrations',
  isPrivate: false
};

const testProduct = {
  name: 'Elegant Wedding Dress',
  price: 25000,
  image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
  brand: 'Designer Brand',
  category: 'Dresses',
  description: 'Beautiful wedding dress for special occasions'
};

async function testWardrobeAPI() {
  try {
    console.log('🧪 Testing Wardrobe API...\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Create a product first
    console.log('2. Creating test product...');
    const productResponse = await axios.post(`${API_BASE_URL}/products`, testProduct, { headers });
    const productId = productResponse.data.data.product._id;
    console.log('✅ Product created:', productId, '\n');

    // Step 3: Create wardrobe
    console.log('3. Creating wardrobe...');
    const wardrobeResponse = await axios.post(`${API_BASE_URL}/wardrobes`, testWardrobe, { headers });
    const wardrobeId = wardrobeResponse.data.data.wardrobe._id;
    console.log('✅ Wardrobe created:', wardrobeId, '\n');

    // Step 4: Get wardrobes
    console.log('4. Getting user wardrobes...');
    const getWardrobesResponse = await axios.get(`${API_BASE_URL}/wardrobes`, { headers });
    console.log('✅ Found', getWardrobesResponse.data.data.wardrobes.length, 'wardrobes\n');

    // Step 5: Add product to wardrobe
    console.log('5. Adding product to wardrobe...');
    const addItemResponse = await axios.post(`${API_BASE_URL}/wardrobes/${wardrobeId}/items`, {
      productId: productId,
      notes: 'Test item added via API',
      priority: 'high'
    }, { headers });
    console.log('✅ Product added to wardrobe\n');

    // Step 6: Get wardrobe items
    console.log('6. Getting wardrobe items...');
    const getItemsResponse = await axios.get(`${API_BASE_URL}/wardrobes/${wardrobeId}/items`, { headers });
    console.log('✅ Found', getItemsResponse.data.data.items.length, 'items in wardrobe\n');

    // Step 7: Add reaction to item
    console.log('7. Adding reaction to item...');
    const itemId = getItemsResponse.data.data.items[0]._id;
    const reactionResponse = await axios.post(`${API_BASE_URL}/wardrobes/${wardrobeId}/items/${itemId}/reactions`, {
      type: 'love'
    }, { headers });
    console.log('✅ Reaction added\n');

    // Step 8: Mark item as purchased
    console.log('8. Marking item as purchased...');
    const purchaseResponse = await axios.post(`${API_BASE_URL}/wardrobes/${wardrobeId}/items/${itemId}/purchase`, {}, { headers });
    console.log('✅ Item marked as purchased\n');

    // Step 9: Get wardrobe stats
    console.log('9. Getting wardrobe stats...');
    const statsResponse = await axios.get(`${API_BASE_URL}/wardrobes/stats`, { headers });
    console.log('✅ Wardrobe stats:', statsResponse.data.data.stats, '\n');

    // Step 10: Update wardrobe
    console.log('10. Updating wardrobe...');
    const updateResponse = await axios.put(`${API_BASE_URL}/wardrobes/${wardrobeId}`, {
      name: 'Updated Wedding Wardrobe',
      description: 'Updated description'
    }, { headers });
    console.log('✅ Wardrobe updated\n');

    console.log('🎉 All wardrobe API tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('- ✅ User authentication');
    console.log('- ✅ Product creation');
    console.log('- ✅ Wardrobe creation');
    console.log('- ✅ Wardrobe listing');
    console.log('- ✅ Adding items to wardrobe');
    console.log('- ✅ Getting wardrobe items');
    console.log('- ✅ Adding reactions');
    console.log('- ✅ Marking items as purchased');
    console.log('- ✅ Getting wardrobe stats');
    console.log('- ✅ Updating wardrobe');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testWardrobeAPI();

