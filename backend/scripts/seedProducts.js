const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Import product data
const { mockProducts, mockProductsDetail } = require('./productData');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    // Ensure we're using the myntra-fashion database
    const mongoUriWithDb = mongoUri.includes('myntra-fashion') 
      ? mongoUri 
      : mongoUri.replace('mongodb.net/', 'mongodb.net/myntra-fashion');
    
    await mongoose.connect(mongoUriWithDb);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Transform products from frontend data to MongoDB schema
const transformProduct = (product, isDetailed = false) => {
  const baseProduct = {
    name: product.name,
    brand: product.brand,
    category: mapCategory(product.category),
    subcategory: product.subcategory,
    price: product.price,
    originalPrice: product.originalPrice || null,
    discount: product.discountPercentage || 0,
    description: product.description,
    images: product.images ? product.images.map((img, index) => ({
      url: img,
      alt: `${product.name} - Image ${index + 1}`,
      isPrimary: index === 0
    })) : [{
      url: product.image,
      alt: product.name,
      isPrimary: true
    }],
    specifications: {
      material: product.material || 'Not specified',
      color: product.color || 'Not specified',
      pattern: product.pattern || 'Solid',
      occasion: product.occasion || ['Casual'],
      season: 'All Season'
    },
    sizes: (product.sizes || []).map(size => ({
      size: size,
      stock: Math.floor(Math.random() * 50) + 10 // Random stock between 10-60
    })),
    colors: [{
      name: product.color || 'Default',
      hex: '#000000',
      image: product.image || product.images?.[0],
      stock: Math.floor(Math.random() * 50) + 10
    }],
    rating: {
      average: product.rating || 0,
      count: product.reviewCount || 0
    },
    reviews: isDetailed && product.reviews ? product.reviews.map(review => ({
      userId: new mongoose.Types.ObjectId(),
      rating: review.rating,
      comment: review.comment,
      images: review.images || [],
      createdAt: new Date(), // Use current date instead of parsing
      isVerified: review.verified || false
    })) : [],
    isAvailable: true,
    tags: generateTags(product),
    aiRecommended: product.isTrending || false,
    trendingScore: product.isTrending ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 50),
    viewCount: Math.floor(Math.random() * 1000),
    purchaseCount: Math.floor(Math.random() * 100),
    wishlistCount: Math.floor(Math.random() * 50),
    metadata: {
      source: 'myntra-collective',
      externalId: product._id || product.id,
      lastSynced: new Date()
    },
    features: product.features || [],
    delivery: product.delivery || {
      standard: {
        estimatedDays: '2-3 business days',
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        discount: product.discountPercentage || 0
      }
    },
    offers: product.offers || {
      bankOffers: [],
      couponOffers: [],
      additionalDiscount: 0
    },
    returnPolicy: product.returnPolicy || '30 days return & exchange policy',
    paymentOptions: product.paymentOptions || {
      cod: true,
      codFee: 0
    },
    similarProducts: product.similarProducts || [],
    youMayAlsoLike: product.youMayAlsoLike || [],
    questions: isDetailed && product.questions ? product.questions : []
  };

  return baseProduct;
};

// Map frontend categories to MongoDB schema categories
const mapCategory = (category) => {
  const categoryMap = {
    'Women': 'Clothing',
    'Men': 'Clothing',
    'Kids': 'Clothing',
    'Sports': 'Clothing',
    'Beauty': 'Beauty',
    'Accessories': 'Accessories',
    'Electronics': 'Electronics',
    'Footwear': 'Footwear'
  };
  return categoryMap[category] || 'Clothing';
};

// Generate relevant tags based on product data
const generateTags = (product) => {
  const tags = [];
  
  if (product.isNew) tags.push('new');
  if (product.isTrending) tags.push('trending');
  if (product.isSustainable) tags.push('sustainable');
  if (product.discountPercentage > 50) tags.push('sale');
  if (product.rating > 4.5) tags.push('high-rated');
  
  // Add category-based tags
  if (product.category === 'Women') tags.push('women', 'fashion');
  if (product.category === 'Men') tags.push('men', 'fashion');
  if (product.subcategory === 'Dresses') tags.push('dress', 'formal');
  if (product.subcategory === 'T-Shirts') tags.push('casual', 'basic');
  if (product.subcategory === 'Running Shoes') tags.push('sports', 'athletic');
  
  return [...new Set(tags)]; // Remove duplicates
};

// Seed products to MongoDB
const seedProducts = async () => {
  try {
    console.log('Starting product seeding...');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Transform and insert detailed products
    const detailedProducts = mockProducts.map(product => transformProduct(product, true));
    await Product.insertMany(detailedProducts);
    console.log(`Inserted ${detailedProducts.length} detailed products`);
    
    // Transform and insert mock products (avoid duplicates)
    const mockProductsTransformed = mockProductsDetail
      .filter(mockProduct => !mockProducts.some(detailed => detailed._id === mockProduct.id))
      .map(product => transformProduct(product, false));
    
    if (mockProductsTransformed.length > 0) {
      await Product.insertMany(mockProductsTransformed);
      console.log(`Inserted ${mockProductsTransformed.length} additional products`);
    }
    
    // Get total count
    const totalProducts = await Product.countDocuments();
    console.log(`Total products in database: ${totalProducts}`);
    
    // Display some statistics
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nProducts by category:');
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} products`);
    });
    
    const brands = await Product.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    console.log('\nTop brands:');
    brands.forEach(brand => {
      console.log(`  ${brand._id}: ${brand.count} products`);
    });
    
    console.log('\nProduct seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await seedProducts();
    process.exit(0);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedProducts, transformProduct };
