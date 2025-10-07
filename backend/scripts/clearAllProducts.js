const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

async function clearAllProducts() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Count products before deletion
    const countBefore = await Product.countDocuments();
    console.log(`📊 Found ${countBefore} products in database`);

    if (countBefore === 0) {
      console.log('ℹ️  No products to delete');
      return;
    }

    // Delete all products
    console.log('🗑️  Deleting all products...');
    const result = await Product.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} products`);
    
    // Verify deletion
    const countAfter = await Product.countDocuments();
    console.log(`📊 Products remaining: ${countAfter}`);

  } catch (error) {
    console.error('❌ Error clearing products:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
clearAllProducts();



