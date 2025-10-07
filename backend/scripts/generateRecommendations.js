const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myntra_style_rooms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate recommendations for all products
const generateRecommendations = async () => {
  try {
    console.log('Starting recommendation generation...');
    
    // Get all products
    const products = await Product.find({ isAvailable: true });
    console.log(`Found ${products.length} products to process`);
    
    let processed = 0;
    let errors = 0;
    
    for (const product of products) {
      try {
        console.log(`Processing product ${processed + 1}/${products.length}: ${product.name}`);
        
        // Get similar products (up to 5)
        const similarProducts = await Product.getSimilarProducts(product._id, 5);
        const similarProductIds = similarProducts.map(p => p._id);
        
        // Get recommended products (up to 5)
        const recommendedProducts = await Product.getRecommendedProducts(product._id, 5);
        const recommendedProductIds = recommendedProducts.map(p => p._id);
        
        // Update the product with recommendations
        await Product.findByIdAndUpdate(product._id, {
          similarProducts: similarProductIds,
          youMayAlsoLike: recommendedProductIds
        });
        
        console.log(`  - Found ${similarProductIds.length} similar products`);
        console.log(`  - Found ${recommendedProductIds.length} recommended products`);
        
        processed++;
        
        // Add a small delay to prevent overwhelming the database
        if (processed % 10 === 0) {
          console.log(`Processed ${processed} products...`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`Error processing product ${product._id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\nRecommendation generation completed!`);
    console.log(`- Processed: ${processed} products`);
    console.log(`- Errors: ${errors} products`);
    
  } catch (error) {
    console.error('Error generating recommendations:', error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await generateRecommendations();
  } catch (error) {
    console.error('Script execution failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateRecommendations };

