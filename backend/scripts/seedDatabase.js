const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Room = require('../models/Room');
const Wardrobe = require('../models/Wardrobe');

// Sample data
const sampleUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    location: 'Mumbai',
    preferences: {
      stylePreferences: ['casual', 'ethnic'],
      budgetRange: { min: 1000, max: 10000 },
      favoriteBrands: ['Libas', 'Soch'],
      sizePreferences: { top: 'M', bottom: 'M', shoes: '7' }
    },
    stats: {
      roomsCreated: 3,
      wardrobesOwned: 2,
      itemsPurchased: 8,
      styleScore: 85
    },
    badges: ['trendsetter', 'ethnic-expert']
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'password123',
    location: 'Delhi',
    preferences: {
      stylePreferences: ['formal', 'western'],
      budgetRange: { min: 2000, max: 15000 },
      favoriteBrands: ['Van Heusen', 'Arrow'],
      sizePreferences: { top: 'L', bottom: 'L', shoes: '9' }
    },
    stats: {
      roomsCreated: 2,
      wardrobesOwned: 1,
      itemsPurchased: 5,
      styleScore: 78
    },
    badges: ['early-adopter']
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password123',
    location: 'Bangalore',
    preferences: {
      stylePreferences: ['party', 'western', 'casual'],
      budgetRange: { min: 1500, max: 12000 },
      favoriteBrands: ['H&M', 'Zara'],
      sizePreferences: { top: 'S', bottom: 'S', shoes: '6' }
    },
    stats: {
      roomsCreated: 4,
      wardrobesOwned: 3,
      itemsPurchased: 12,
      styleScore: 92
    },
    badges: ['style-guru', 'shopping-pro']
  }
];

const sampleProducts = [
  {
    name: 'Floral Print Maxi Dress',
    brand: 'Libas',
    category: 'Clothing',
    subcategory: 'Dresses',
    price: 2499,
    originalPrice: 2999,
    images: [
      { url: 'https://via.placeholder.com/400x600/ff6b6b/ffffff?text=Dress', alt: 'Floral Maxi Dress', isPrimary: true }
    ],
    description: 'Beautiful floral print maxi dress perfect for summer occasions',
    specifications: {
      material: 'Cotton Blend',
      care: 'Machine Wash',
      color: 'Floral Print',
      season: 'Summer'
    },
    sizes: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 8 }
    ],
    colors: [
      { name: 'Floral Print', hex: '#ff6b6b', stock: 33 }
    ],
    rating: { average: 4.3, count: 127 },
    tags: ['summer', 'floral', 'maxi', 'casual'],
    aiRecommended: true,
    trendingScore: 85
  },
  {
    name: 'Silk Blend Saree',
    brand: 'Soch',
    category: 'Clothing',
    subcategory: 'Sarees',
    price: 4999,
    originalPrice: 5999,
    images: [
      { url: 'https://via.placeholder.com/400x600/4CAF50/ffffff?text=Saree', alt: 'Silk Saree', isPrimary: true }
    ],
    description: 'Elegant silk blend saree with intricate work',
    specifications: {
      material: 'Silk Blend',
      care: 'Dry Clean Only',
      color: 'Red',
      occasion: ['Wedding', 'Festival']
    },
    sizes: [
      { size: 'Free Size', stock: 20 }
    ],
    colors: [
      { name: 'Red', hex: '#d32f2f', stock: 20 }
    ],
    rating: { average: 4.6, count: 89 },
    tags: ['ethnic', 'silk', 'wedding', 'festival'],
    aiRecommended: true,
    trendingScore: 92
  },
  {
    name: 'Block Heels Sandals',
    brand: 'Metro',
    category: 'Footwear',
    subcategory: 'Sandals',
    price: 1899,
    originalPrice: 2299,
    images: [
      { url: 'https://via.placeholder.com/400x400/2196F3/ffffff?text=Heels', alt: 'Block Heels', isPrimary: true }
    ],
    description: 'Comfortable block heel sandals for all-day wear',
    specifications: {
      material: 'Synthetic Leather',
      heelHeight: '3 inches',
      sole: 'Rubber',
      color: 'Black'
    },
    sizes: [
      { size: '6', stock: 12 },
      { size: '7', stock: 15 },
      { size: '8', stock: 10 }
    ],
    colors: [
      { name: 'Black', hex: '#000000', stock: 37 }
    ],
    rating: { average: 4.1, count: 156 },
    tags: ['heels', 'comfortable', 'casual'],
    aiRecommended: true,
    trendingScore: 78
  },
  {
    name: 'Statement Earrings',
    brand: 'Accessorize',
    category: 'Jewelry',
    subcategory: 'Earrings',
    price: 899,
    originalPrice: 1299,
    images: [
      { url: 'https://via.placeholder.com/400x400/FF9800/ffffff?text=Earrings', alt: 'Statement Earrings', isPrimary: true }
    ],
    description: 'Beautiful statement earrings to complete your look',
    specifications: {
      material: 'Alloy',
      care: 'Wipe Clean',
      color: 'Gold',
      occasion: ['Party', 'Casual']
    },
    sizes: [
      { size: 'One Size', stock: 25 }
    ],
    colors: [
      { name: 'Gold', hex: '#ffd700', stock: 25 }
    ],
    rating: { average: 4.4, count: 203 },
    tags: ['jewelry', 'statement', 'gold'],
    aiRecommended: false,
    trendingScore: 65
  }
];

const sampleRooms = [
  {
    name: 'Family Wedding',
    emoji: '👰',
    description: 'Planning outfits for the upcoming family wedding',
    isPrivate: false,
    members: [],
    settings: {
      allowMemberInvites: true,
      aiEnabled: true,
      voiceCallEnabled: true
    }
  },
  {
    name: 'College Freshers',
    emoji: '🎉',
    description: 'Getting ready for college freshers party',
    isPrivate: false,
    members: [],
    settings: {
      allowMemberInvites: true,
      aiEnabled: true,
      voiceCallEnabled: true
    }
  },
  {
    name: 'Saturday Party',
    emoji: '🔥',
    description: 'Weekend party outfit planning',
    isPrivate: true,
    members: [],
    settings: {
      allowMemberInvites: false,
      aiEnabled: true,
      voiceCallEnabled: true
    }
  }
];

const sampleWardrobes = [
  {
    name: 'Wedding Collection',
    emoji: '👰',
    description: 'Special collection for wedding season',
    occasionType: 'Wedding & Celebrations',
    budgetRange: { min: 2000, max: 15000 },
    isPrivate: false,
    members: [],
    settings: {
      allowMemberInvites: true,
      aiSuggestionsEnabled: true,
      autoOutfitGeneration: true
    }
  },
  {
    name: 'Office Formals',
    emoji: '💼',
    description: 'Professional wardrobe for office',
    occasionType: 'Office & Professional',
    budgetRange: { min: 1500, max: 8000 },
    isPrivate: true,
    members: [],
    settings: {
      allowMemberInvites: false,
      aiSuggestionsEnabled: true,
      autoOutfitGeneration: false
    }
  },
  {
    name: 'Weekend Casuals',
    emoji: '🌟',
    description: 'Casual outfits for weekend outings',
    occasionType: 'Casual & Weekend',
    budgetRange: { min: 1000, max: 5000 },
    isPrivate: false,
    members: [],
    settings: {
      allowMemberInvites: true,
      aiSuggestionsEnabled: true,
      autoOutfitGeneration: true
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Room.deleteMany({});
    await Wardrobe.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create users
    const users = await User.create(sampleUsers);
    console.log(`👥 Created ${users.length} users`);

    // Create products
    const products = await Product.create(sampleProducts);
    console.log(`🛍️ Created ${products.length} products`);

    // Create rooms with owners
    const rooms = [];
    for (let i = 0; i < sampleRooms.length; i++) {
      const roomData = {
        ...sampleRooms[i],
        owner: users[i % users.length]._id
      };
      const room = await Room.create(roomData);
      rooms.push(room);
    }
    console.log(`🏠 Created ${rooms.length} rooms`);

    // Create wardrobes with owners
    const wardrobes = [];
    for (let i = 0; i < sampleWardrobes.length; i++) {
      const wardrobeData = {
        ...sampleWardrobes[i],
        owner: users[i % users.length]._id
      };
      const wardrobe = await Wardrobe.create(wardrobeData);
      wardrobes.push(wardrobe);
    }
    console.log(`👗 Created ${wardrobes.length} wardrobes`);

    // Add some members to rooms and wardrobes
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const otherUsers = users.filter(u => u._id.toString() !== room.owner.toString());
      
      // Add 1-2 members to each room
      const membersToAdd = otherUsers.slice(0, Math.floor(Math.random() * 2) + 1);
      for (const member of membersToAdd) {
        await room.addMember(member._id, 'Contributor');
      }
    }

    for (let i = 0; i < wardrobes.length; i++) {
      const wardrobe = wardrobes[i];
      const otherUsers = users.filter(u => u._id.toString() !== wardrobe.owner.toString());
      
      // Add 1-2 members to each wardrobe
      const membersToAdd = otherUsers.slice(0, Math.floor(Math.random() * 2) + 1);
      for (const member of membersToAdd) {
        await wardrobe.addMember(member._id, 'Contributor');
      }
    }

    console.log('👥 Added members to rooms and wardrobes');

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Products: ${products.length}`);
    console.log(`- Rooms: ${rooms.length}`);
    console.log(`- Wardrobes: ${wardrobes.length}`);

    console.log('\n🔑 Test Credentials:');
    console.log('Email: alice@example.com, Password: password123');
    console.log('Email: bob@example.com, Password: password123');
    console.log('Email: priya@example.com, Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
