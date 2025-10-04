const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');

// Mock data
const mockProducts = [
  {
    name: 'Floral Printed Chiffon Empire Dress',
    brand: 'Label Ritu Kumar',
    price: 1440,
    originalPrice: 4800,
    discount: 70,
    rating: {
      average: 4.1,
      count: 23
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
        alt: 'Floral Printed Chiffon Empire Dress',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
        alt: 'Floral Printed Chiffon Empire Dress - Side View',
        isPrimary: false
      }
    ],
    category: 'Women',
    subcategory: 'Dresses',
    description: 'Pink and yellow floral print empire dress with flowy chiffon fabric. Perfect for casual outings and semi-formal occasions. Features a comfortable empire waistline and short sleeves.',
    features: [
      '100% Chiffon fabric',
      'Machine washable',
      'Empire waistline',
      'Short sleeves',
      'Knee length',
      'Floral print design'
    ],
    specifications: {
      material: 'Chiffon',
      color: 'Pink & Yellow Floral',
      care: 'Machine washable',
      occasion: ['Casual', 'Semi-formal']
    },
    sizes: [
      { size: 'XS', stock: 5 },
      { size: 'S', stock: 8 },
      { size: 'M', stock: 10 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 3 }
    ],
    colors: [
      {
        name: 'Pink & Yellow Floral',
        hex: '#FFB6C1',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
        stock: 32
      }
    ],
    isNew: true,
    isSustainable: true,
    sustainability: 'Regular',
    delivery: {
      standard: {
        estimatedDays: '25 September - 2 October',
        price: 1440,
        originalPrice: 4800,
        discount: 70
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card', '5% off on HDFC Bank Debit Card'],
      couponOffers: ['MYNTRA10 - 10% off', 'WELCOME20 - 20% off for new users'],
      additionalDiscount: 234
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: [],
    youMayAlsoLike: [],
    reviews: [
      {
        userId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: 'Beautiful dress! Perfect fit and the fabric is so comfortable. The floral print is exactly as shown.',
        isVerified: true
      },
      {
        userId: new mongoose.Types.ObjectId(),
        rating: 4,
        comment: 'Good quality dress. The color is slightly different than expected but overall satisfied.',
        isVerified: true
      }
    ],
    questions: [
      {
        question: 'What is the fabric composition?',
        answer: 'This dress is made of 100% chiffon fabric which is lightweight and breathable.',
        askedBy: 'Customer',
        answeredBy: 'Label Ritu Kumar',
        date: '3 days ago',
        helpful: 5
      },
      {
        question: 'Is this suitable for plus size?',
        answer: 'Yes, this dress is available in sizes XS to XL and the empire waistline is flattering for all body types.',
        askedBy: 'Customer',
        answeredBy: 'Label Ritu Kumar',
        date: '1 week ago',
        helpful: 3
      }
    ]
  },
  {
    name: 'Printed A-Line Dress',
    brand: 'Label Ritu Kumar',
    price: 1410,
    originalPrice: 4700,
    discount: 70,
    rating: {
      average: 3.7,
      count: 15
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
        alt: 'Printed A-Line Dress',
        isPrimary: true
      }
    ],
    category: 'Women',
    subcategory: 'Dresses',
    description: 'Orange-red printed A-line dress with short puffed sleeves and V-neckline. Perfect for casual and semi-formal occasions.',
    features: [
      'A-line silhouette',
      'Short puffed sleeves',
      'V-neckline',
      'Printed design',
      'Knee length',
      'Comfortable fit'
    ],
    specifications: {
      material: 'Polyester',
      color: 'Orange-Red',
      care: 'Machine washable',
      occasion: ['Casual', 'Semi-formal']
    },
    sizes: [
      { size: 'XS', stock: 4 },
      { size: 'S', stock: 7 },
      { size: 'M', stock: 9 },
      { size: 'L', stock: 5 }
    ],
    colors: [
      {
        name: 'Orange-Red',
        hex: '#FF4500',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
        stock: 25
      }
    ],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '26 September - 3 October',
        price: 1410,
        originalPrice: 4700,
        discount: 70
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card'],
      couponOffers: ['MYNTRA10 - 10% off'],
      additionalDiscount: 200
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: [],
    youMayAlsoLike: [],
    reviews: [
      {
        userId: new mongoose.Types.ObjectId(),
        rating: 4,
        comment: 'Nice dress, good quality fabric. The A-line cut is very flattering.',
        isVerified: true
      }
    ],
    questions: []
  },
  {
    name: 'Women Ethnic Kurta',
    brand: 'anayna',
    price: 379,
    originalPrice: 1998,
    discount: 81,
    rating: {
      average: 4.2,
      count: 45
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
        alt: 'Women Ethnic Kurta',
        isPrimary: true
      }
    ],
    category: 'Women',
    subcategory: 'Ethnic Wear',
    description: 'Pink women ethnic kurta with white geometric print and white trim. Perfect for traditional occasions and festivals.',
    features: [
      'Pink ethnic kurta',
      'White geometric print',
      'White trim details',
      'V-neckline',
      'Long sleeves',
      'Knee length'
    ],
    specifications: {
      material: 'Cotton',
      color: 'Pink with White Print',
      care: 'Machine washable',
      occasion: ['Traditional', 'Festival', 'Daily wear']
    },
    sizes: [
      { size: 'XS', stock: 8 },
      { size: 'S', stock: 12 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 10 },
      { size: 'XL', stock: 7 }
    ],
    colors: [
      {
        name: 'Pink with White Print',
        hex: '#FFC0CB',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
        stock: 52
      }
    ],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '24 September - 1 October',
        price: 379,
        originalPrice: 1998,
        discount: 81
      }
    },
    offers: {
      bankOffers: ['15% off on SBI Credit Card', '10% off on HDFC Bank Debit Card'],
      couponOffers: ['ETHNIC20 - 20% off on ethnic wear', 'MYNTRA10 - 10% off'],
      additionalDiscount: 50
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: [],
    youMayAlsoLike: [],
    reviews: [
      {
        userId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: 'Beautiful ethnic kurta! Perfect for festivals. The quality is excellent for the price.',
        isVerified: true
      },
      {
        userId: new mongoose.Types.ObjectId(),
        rating: 4,
        comment: 'Good quality and comfortable fit. The print is very traditional and elegant.',
        isVerified: true
      }
    ],
    questions: [
      {
        question: 'Is this suitable for daily wear?',
        answer: 'Yes, this kurta is perfect for both daily wear and special occasions. The cotton fabric makes it comfortable for all-day wear.',
        askedBy: 'Customer',
        answeredBy: 'anayna',
        date: '2 days ago',
        helpful: 8
      }
    ]
  },
  {
    name: 'Anti-Frizz Argan Oil Shampoo',
    brand: 'Love Beauty & Planet',
    price: 200,
    originalPrice: 400,
    discount: 50,
    rating: {
      average: 4.4,
      count: 128
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=600&fit=crop',
        alt: 'Anti-Frizz Argan Oil Shampoo',
        isPrimary: true
      }
    ],
    category: 'Beauty',
    subcategory: 'Hair Care',
    description: 'LOVE beauty AND planet Anti-Frizz Argan Oil Shampoo with up to 48 hours of frizz control. Made with natural ingredients.',
    features: [
      'Up to 48 hours frizz control',
      'Argan oil formula',
      'Natural ingredients',
      'Sulfate-free',
      'Paraben-free',
      'Cruelty-free'
    ],
    specifications: {
      material: 'Liquid',
      color: 'Purple',
      care: 'For external use only',
      occasion: ['Daily use']
    },
    sizes: [
      { size: '250ml', stock: 20 },
      { size: '400ml', stock: 15 }
    ],
    colors: [
      {
        name: 'Purple',
        hex: '#800080',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=600&fit=crop',
        stock: 35
      }
    ],
    isSustainable: true,
    sustainability: 'Eco-friendly packaging',
    delivery: {
      standard: {
        estimatedDays: '25 September - 2 October',
        price: 200,
        originalPrice: 400,
        discount: 50
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card'],
      couponOffers: ['BEAUTY15 - 15% off on beauty products', 'MYNTRA10 - 10% off'],
      additionalDiscount: 30
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: [],
    youMayAlsoLike: [],
    reviews: [
      {
        userId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: 'Amazing shampoo! My hair feels so soft and the frizz is completely controlled. Highly recommended!',
        isVerified: true
      },
      {
        userId: new mongoose.Types.ObjectId(),
        rating: 4,
        comment: 'Good product, works well for frizzy hair. The smell is pleasant too.',
        isVerified: true
      }
    ],
    questions: [
      {
        question: 'Is this suitable for all hair types?',
        answer: 'Yes, this shampoo is suitable for all hair types, especially beneficial for frizzy and dry hair.',
        askedBy: 'Customer',
        answeredBy: 'Love Beauty & Planet',
        date: '3 days ago',
        helpful: 12
      }
    ]
  },
  {
    name: 'Denim Jacket',
    brand: 'Roadster',
    price: 1899,
    originalPrice: 2999,
    discount: 37,
    rating: {
      average: 4.5,
      count: 67
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
        alt: 'Denim Jacket',
        isPrimary: true
      }
    ],
    category: 'Women',
    subcategory: 'Jackets',
    description: 'Classic denim jacket with comfortable fit and timeless style. Perfect for layering and casual outings.',
    features: [
      '100% Cotton Denim',
      'Classic fit',
      'Button closure',
      'Chest pockets',
      'Long sleeves',
      'Machine washable'
    ],
    specifications: {
      material: 'Cotton Denim',
      color: 'Blue',
      care: 'Machine washable',
      occasion: ['Casual', 'Layering']
    },
    sizes: [
      { size: 'XS', stock: 6 },
      { size: 'S', stock: 10 },
      { size: 'M', stock: 12 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 5 }
    ],
    colors: [
      {
        name: 'Blue',
        hex: '#0000FF',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
        stock: 41
      }
    ],
    isTrending: true,
    delivery: {
      standard: {
        estimatedDays: '25 September - 2 October',
        price: 1899,
        originalPrice: 2999,
        discount: 37
      }
    },
    offers: {
      bankOffers: ['10% off on Axis Bank Credit Card', '5% off on HDFC Bank Debit Card'],
      couponOffers: ['JACKET15 - 15% off on jackets', 'MYNTRA10 - 10% off'],
      additionalDiscount: 200
    },
    returnPolicy: 'Hassle free 7 days Return & Exchange',
    paymentOptions: {
      cod: true,
      codFee: 10
    },
    similarProducts: [],
    youMayAlsoLike: [],
    reviews: [
      {
        userId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: 'Perfect denim jacket! Great quality and fits perfectly. Very versatile piece.',
        isVerified: true
      },
      {
        userId: new mongoose.Types.ObjectId(),
        rating: 4,
        comment: 'Good quality denim jacket. The fit is comfortable and the style is classic.',
        isVerified: true
      }
    ],
    questions: [
      {
        question: 'Is this true to size?',
        answer: 'Yes, this jacket is true to size. We recommend ordering your usual size for the best fit.',
        askedBy: 'Customer',
        answeredBy: 'Roadster',
        date: '2 days ago',
        helpful: 7
      }
    ]
  }
];

const mockCategories = [
  {
    name: 'Fashion',
    icon: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
    color: '#E91E63',
    isActive: true,
    count: 1250,
    subcategories: ['Dresses', 'Tops', 'Bottoms', 'Jackets', 'Accessories'],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T00:00:00Z')
  },
  {
    name: 'Beauty',
    icon: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop&q=80',
    color: '#FF6B9D',
    isActive: false,
    count: 320,
    subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Bath & Body'],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T00:00:00Z')
  },
  {
    name: 'Homeliving',
    icon: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
    color: '#4A90E2',
    isActive: false,
    count: 450,
    subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Storage'],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T00:00:00Z')
  },
  {
    name: 'Footwear',
    icon: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop',
    color: '#7ED321',
    isActive: false,
    count: 750,
    subcategories: ['Sneakers', 'Sandals', 'Heels', 'Boots', 'Sports'],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T00:00:00Z')
  },
  {
    name: 'Accessories',
    icon: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop',
    color: '#9C27B0',
    isActive: false,
    count: 540,
    subcategories: ['Bags', 'Jewelry', 'Watches', 'Belts', 'Sunglasses'],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T00:00:00Z')
  }
];

const mockBanners = [
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    title: 'The Best Men\'s Wear Collection',
    discount: 'UP TO 70% OFF',
    brand: '#SNITCH',
    buttonText: 'Shop Now',
    isActive: true,
    order: 1,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T00:00:00Z')
  },
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    title: 'Women\'s Fashion Week',
    discount: 'UP TO 50% OFF',
    brand: '#FASHION',
    buttonText: 'Explore Now',
    isActive: true,
    order: 2,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T00:00:00Z')
  },
  {
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
    title: 'Footwear Collection',
    discount: 'UP TO 60% OFF',
    brand: '#SHOES',
    buttonText: 'Shop Now',
    isActive: true,
    order: 3,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T00:00:00Z')
  },
  {
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    title: 'Accessories Sale',
    discount: 'UP TO 40% OFF',
    brand: '#ACCESSORIES',
    buttonText: 'Buy Now',
    isActive: true,
    order: 4,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T00:00:00Z')
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('⚠️ No MongoDB URI found, skipping database migration');
      return false;
    }

    const mongoUriWithDb = mongoUri.includes('myntra-fashion') 
      ? mongoUri 
      : mongoUri.replace('mongodb.net/', 'mongodb.net/myntra-fashion');

    await mongoose.connect(mongoUriWithDb, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      retryWrites: true,
      w: 'majority'
    });

    console.log('✅ Connected to MYNTRA FASHION DATABASE successfully');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    return false;
  }
};

// Migrate data
const migrateData = async () => {
  try {
    console.log('🚀 Starting data migration...');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Banner.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Insert categories
    const categories = await Category.insertMany(mockCategories);
    console.log(`✅ Inserted ${categories.length} categories`);

    // Insert banners
    const banners = await Banner.insertMany(mockBanners);
    console.log(`✅ Inserted ${banners.length} banners`);

    // Insert products
    const products = await Product.insertMany(mockProducts);
    console.log(`✅ Inserted ${products.length} products`);

    // Update similar products and you may also like references
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const similarProducts = products.filter((_, index) => index !== i).slice(0, 4).map(p => p._id.toString());
      const youMayAlsoLike = products.filter((_, index) => index !== i).slice(0, 4).map(p => p._id.toString());
      
      await Product.findByIdAndUpdate(product._id, {
        similarProducts,
        youMayAlsoLike
      });
    }

    console.log('✅ Updated product references');

    console.log('🎉 Data migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Banners: ${banners.length}`);
    console.log(`   - Products: ${products.length}`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
};

// Main execution
const main = async () => {
  const connected = await connectDB();
  if (connected) {
    await migrateData();
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
  process.exit(0);
};

// Run migration
if (require.main === module) {
  main();
}

module.exports = { migrateData, connectDB };
