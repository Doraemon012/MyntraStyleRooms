const mongoose = require('mongoose');
require('dotenv').config();

// Import Product model
const Product = require('./models/Product');

// Simple product seed data with proper ratings
const productSeedData = [
  {
    name: 'Elegant Floral Midi Dress',
    brand: 'Zara',
    category: 'Women',
    subcategory: 'Dresses',
    price: 2299,
    originalPrice: 4599,
    discount: 50,
    description: 'A stunning floral midi dress crafted from premium viscose blend.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
        alt: 'Floral Midi Dress',
        isPrimary: true
      }
    ],
    specifications: {
      material: 'Viscose Blend',
      color: 'Navy Blue Floral'
    },
    sizes: [
      { size: 'XS', stock: 5 },
      { size: 'S', stock: 8 },
      { size: 'M', stock: 12 },
      { size: 'L', stock: 6 }
    ],
    colors: [
      { name: 'Navy Blue Floral', hex: '#1e3a8a', stock: 34 }
    ],
    rating: {
      average: 4.3,
      count: 127
    },
    reviews: [],
    isAvailable: true,
    tags: ['new', 'trending'],
    aiRecommended: true,
    trendingScore: 85,
    viewCount: 1250,
    purchaseCount: 89,
    wishlistCount: 156,
    features: ['Premium viscose blend fabric', 'A-line silhouette'],
    delivery: {
      standard: {
        estimatedDays: '2-3 business days',
        price: 2299,
        originalPrice: 4599,
        discount: 50
      }
    },
    offers: {
      bankOffers: ['15% off on HDFC Credit Card'],
      couponOffers: ['WELCOME15 - 15% off for new users'],
      additionalDiscount: 345
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: [],
    youMayAlsoLike: [],
    questions: [],
    metadata: {
      source: 'myntra',
      lastSynced: new Date()
    }
  },
  {
    name: 'Classic Denim Jacket',
    brand: 'Levi\'s',
    category: 'Women',
    subcategory: 'Jackets',
    price: 3499,
    originalPrice: 4999,
    discount: 30,
    description: 'Iconic denim jacket crafted from premium 100% cotton denim.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
        alt: 'Denim Jacket',
        isPrimary: true
      }
    ],
    specifications: {
      material: 'Cotton Denim',
      color: 'Mid Blue'
    },
    sizes: [
      { size: 'XS', stock: 4 },
      { size: 'S', stock: 7 },
      { size: 'M', stock: 10 },
      { size: 'L', stock: 8 }
    ],
    colors: [
      { name: 'Mid Blue', hex: '#1e40af', stock: 34 }
    ],
    rating: {
      average: 4.6,
      count: 89
    },
    reviews: [],
    isAvailable: true,
    tags: ['trending', 'classic'],
    aiRecommended: false,
    trendingScore: 78,
    viewCount: 980,
    purchaseCount: 67,
    wishlistCount: 123,
    features: ['100% Cotton Denim', 'Classic fit'],
    delivery: {
      standard: {
        estimatedDays: '3-4 business days',
        price: 3499,
        originalPrice: 4999,
        discount: 30
      }
    },
    offers: {
      bankOffers: ['20% off on HDFC Credit Card'],
      couponOffers: ['DENIM25 - 25% off on denim'],
      additionalDiscount: 500
    },
    returnPolicy: '30 days return & exchange policy',
    paymentOptions: {
      cod: true,
      codFee: 0
    },
    similarProducts: [],
    youMayAlsoLike: [],
    questions: [],
    metadata: {
      source: 'myntra',
      lastSynced: new Date()
    }
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Create products
    for (const productData of productSeedData) {
      const product = new Product(productData);
      const savedProduct = await product.save();
      console.log(`Created product: ${savedProduct.name} with rating: ${savedProduct.rating.average} (${savedProduct.rating.count})`);
    }

    console.log('Products seeded successfully!');
    console.log(`Created ${productSeedData.length} products`);

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedProducts();
