const mongoose = require('mongoose');
const Wardrobe = require('../models/Wardrobe');
const WardrobeItem = require('../models/WardrobeItem');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

// Sample data
const sampleUsers = [
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: '$2b$10$example.hash.here', // This would be hashed in real scenario
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    name: 'Richa Patel',
    email: 'richa@example.com',
    password: '$2b$10$example.hash.here',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    name: 'Neyati Singh',
    email: 'neyati@example.com',
    password: '$2b$10$example.hash.here',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }
];

const sampleProducts = [
  {
    name: 'Elegant Red Saree',
    price: 4500,
    images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop' }],
    brand: 'Fabindia',
    category: 'Clothing',
    subcategory: 'Ethnic Wear',
    description: 'Beautiful red silk saree with golden border work',
    isActive: true,
    inStock: true,
    rating: 4.5,
    reviewCount: 120
  },
  {
    name: 'Gold Jhumka Earrings',
    price: 2500,
    images: [{ url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=400&fit=crop' }],
    brand: 'Tanishq',
    category: 'Jewelry',
    subcategory: 'Earrings',
    description: 'Traditional gold jhumka earrings with intricate design',
    isActive: true,
    inStock: true,
    rating: 4.8,
    reviewCount: 89
  },
  {
    name: 'Designer Handbag',
    price: 3500,
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop' }],
    brand: 'H&M',
    category: 'Bags',
    subcategory: 'Handbags',
    description: 'Stylish designer handbag perfect for any occasion',
    isActive: true,
    inStock: true,
    rating: 4.3,
    reviewCount: 67
  },
  {
    name: 'Traditional Mojaris',
    price: 1800,
    images: [{ url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop' }],
    brand: 'Bata',
    category: 'Footwear',
    subcategory: 'Traditional',
    description: 'Comfortable traditional mojari shoes for special occasions',
    isActive: true,
    inStock: true,
    rating: 4.2,
    reviewCount: 45
  },
  {
    name: 'Pearl Necklace Set',
    price: 6000,
    images: [{ url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=400&fit=crop' }],
    brand: 'Tanishq',
    category: 'Jewelry',
    subcategory: 'Necklaces',
    description: 'Classic pearl necklace set with matching earrings',
    isActive: true,
    inStock: true,
    rating: 4.7,
    reviewCount: 156
  },
  {
    name: 'Silk Scarf',
    price: 900,
    images: [{ url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop' }],
    brand: 'Fabindia',
    category: 'Accessories',
    subcategory: 'Scarves',
    description: 'Luxurious silk scarf with beautiful patterns',
    isActive: true,
    inStock: true,
    rating: 4.1,
    reviewCount: 34
  }
];

const sampleWardrobes = [
  {
    name: 'Family Wedding Collection',
    emoji: '👰',
    description: 'Beautiful collection for family wedding celebrations',
    occasionType: 'Wedding & Celebrations',
    budgetRange: { min: 1000, max: 10000 },
    isPrivate: false,
    settings: {
      allowMemberInvites: true,
      aiSuggestionsEnabled: true,
      autoOutfitGeneration: false
    },
    tags: ['wedding', 'family', 'celebration']
  },
  {
    name: 'Office Professional',
    emoji: '💼',
    description: 'Professional attire for office and meetings',
    occasionType: 'Office & Professional',
    budgetRange: { min: 500, max: 5000 },
    isPrivate: false,
    settings: {
      allowMemberInvites: true,
      aiSuggestionsEnabled: true,
      autoOutfitGeneration: false
    },
    tags: ['office', 'professional', 'work']
  },
  {
    name: 'Casual Weekend',
    emoji: '👕',
    description: 'Comfortable casual wear for weekends',
    occasionType: 'Casual & Weekend',
    budgetRange: { min: 300, max: 3000 },
    isPrivate: false,
    settings: {
      allowMemberInvites: true,
      aiSuggestionsEnabled: true,
      autoOutfitGeneration: false
    },
    tags: ['casual', 'weekend', 'comfortable']
  },
  {
    name: 'Party Night Out',
    emoji: '🎉',
    description: 'Glamorous outfits for parties and night outs',
    occasionType: 'Party & Nightlife',
    budgetRange: { min: 800, max: 8000 },
    isPrivate: true,
    settings: {
      allowMemberInvites: true,
      aiSuggestionsEnabled: true,
      autoOutfitGeneration: true
    },
    tags: ['party', 'night', 'glamorous']
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    const mongoUriWithDb = mongoUri.includes('myntra-fashion') 
      ? mongoUri 
      : mongoUri.replace('mongodb.net/', 'mongodb.net/myntra-fashion');

    await mongoose.connect(mongoUriWithDb, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Wardrobe.deleteMany({});
    await WardrobeItem.deleteMany({});
    console.log('🗑️ Cleared existing wardrobe data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    console.log('👥 Created sample users');

    // Create products
    const products = [];
    for (const productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
      products.push(product);
    }
    console.log('🛍️ Created sample products');

    // Create wardrobes
    const wardrobes = [];
    for (let i = 0; i < sampleWardrobes.length; i++) {
      const wardrobeData = sampleWardrobes[i];
      const owner = users[i % users.length]; // Distribute ownership
      
      const wardrobe = new Wardrobe({
        ...wardrobeData,
        owner: owner._id,
        members: [
          {
            userId: owner._id,
            role: 'Owner',
            joinedAt: new Date()
          }
        ]
      });

      // Add other users as members with different roles
      const otherUsers = users.filter(u => u._id.toString() !== owner._id.toString());
      for (let j = 0; j < otherUsers.length; j++) {
        const role = j === 0 ? 'Editor' : j === 1 ? 'Contributor' : 'Viewer';
        wardrobe.members.push({
          userId: otherUsers[j]._id,
          role: role,
          joinedAt: new Date()
        });
      }

      await wardrobe.save();
      wardrobes.push(wardrobe);
    }
    console.log('👗 Created sample wardrobes');

    // Add items to wardrobes
    for (let i = 0; i < wardrobes.length; i++) {
      const wardrobe = wardrobes[i];
      const productsToAdd = products.slice(i * 2, (i + 1) * 2); // 2 products per wardrobe
      
      for (const product of productsToAdd) {
        const wardrobeItem = new WardrobeItem({
          wardrobeId: wardrobe._id,
          productId: product._id,
          addedBy: wardrobe.owner,
          notes: `Added to ${wardrobe.name}`,
          priority: 'medium',
          reactions: [
            {
              userId: wardrobe.owner,
              type: 'love',
              createdAt: new Date()
            }
          ]
        });

        await wardrobeItem.save();
      }
    }
    console.log('📦 Added items to wardrobes');

    // Update wardrobe item counts
    for (const wardrobe of wardrobes) {
      const itemCount = await WardrobeItem.countDocuments({ wardrobeId: wardrobe._id });
      wardrobe.itemCount = itemCount;
      await wardrobe.save();
    }
    console.log('📊 Updated wardrobe item counts');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${products.length} products`);
    console.log(`Created ${wardrobes.length} wardrobes`);
    console.log(`Added items to wardrobes`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase();
