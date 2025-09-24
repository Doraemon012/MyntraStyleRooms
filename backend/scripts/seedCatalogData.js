const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');

// Import mock data
const { mockProducts } = require('../../data/products');
const { mockCategories } = require('../../data/categories');
const { mockBanners } = require('../../data/banners');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myntra_style_rooms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Banner.deleteMany({});
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
};

// Seed categories
const seedCategories = async () => {
  try {
    console.log('📂 Seeding categories...');
    const categories = await Category.insertMany(mockCategories);
    console.log(`✅ ${categories.length} categories seeded`);
    return categories;
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

// Seed banners
const seedBanners = async () => {
  try {
    console.log('🎯 Seeding banners...');
    const banners = await Banner.insertMany(mockBanners);
    console.log(`✅ ${banners.length} banners seeded`);
    return banners;
  } catch (error) {
    console.error('❌ Error seeding banners:', error);
    throw error;
  }
};

// Seed products
const seedProducts = async () => {
  try {
    console.log('🛍️  Seeding products...');
    
    // Transform mock products to match our schema
    const transformedProducts = mockProducts.map(product => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      discountPercentage: product.discountPercentage,
      image: product.image,
      images: product.images,
      description: product.description,
      features: product.features,
      material: product.material,
      color: product.color,
      sizes: product.sizes,
      availableSizes: product.availableSizes,
      rating: product.rating,
      reviewCount: product.reviewCount,
      reviews: product.reviews,
      questions: product.questions,
      isAvailable: true,
      isNew: product.isNew || false,
      isTrending: product.isTrending || false,
      isSustainable: product.isSustainable || false,
      sustainability: product.sustainability || '',
      delivery: product.delivery,
      offers: product.offers,
      returnPolicy: product.returnPolicy,
      paymentOptions: product.paymentOptions,
      similarProducts: product.similarProducts,
      youMayAlsoLike: product.youMayAlsoLike,
      tags: [],
      aiRecommended: false,
      trendingScore: product.isTrending ? Math.floor(Math.random() * 100) : 0,
      viewCount: 0,
      purchaseCount: 0,
      wishlistCount: 0,
      metadata: {
        source: 'myntra',
        externalId: product._id,
        lastSynced: new Date()
      }
    }));

    const products = await Product.insertMany(transformedProducts);
    console.log(`✅ ${products.length} products seeded`);
    return products;
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
};

// Update category counts
const updateCategoryCounts = async (products) => {
  try {
    console.log('📊 Updating category counts...');
    
    // Count products by category
    const categoryCounts = {};
    products.forEach(product => {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    });

    // Update category counts
    for (const [categoryName, count] of Object.entries(categoryCounts)) {
      await Category.updateOne(
        { name: categoryName },
        { $set: { count } }
      );
    }

    console.log('✅ Category counts updated');
  } catch (error) {
    console.error('❌ Error updating category counts:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearData();
    
    // Seed data
    const categories = await seedCategories();
    const banners = await seedBanners();
    const products = await seedProducts();
    
    // Update category counts
    await updateCategoryCounts(products);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Banners: ${banners.length}`);
    console.log(`   - Products: ${products.length}`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
