const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myntra-collective', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const WardrobeItem = require('./backend/models/WardrobeItem');

async function cleanupInvalidWardrobeItems() {
  try {
    console.log('🧹 Cleaning up invalid wardrobe items...\n');

    // Find all wardrobe items with null productId
    const invalidItems = await WardrobeItem.find({ productId: null });
    console.log(`Found ${invalidItems.length} wardrobe items with null productId`);

    if (invalidItems.length > 0) {
      console.log('\nInvalid items:');
      invalidItems.forEach((item, index) => {
        console.log(`${index + 1}. Item ID: ${item._id}, Wardrobe ID: ${item.wardrobeId}, Added: ${item.addedAt}`);
      });

      // Delete invalid items
      const deleteResult = await WardrobeItem.deleteMany({ productId: null });
      console.log(`\n✅ Deleted ${deleteResult.deletedCount} invalid wardrobe items`);
    } else {
      console.log('✅ No invalid wardrobe items found');
    }

    // Also check for items with invalid product references
    const allItems = await WardrobeItem.find({}).populate('productId');
    const itemsWithInvalidProduct = allItems.filter(item => !item.productId);
    
    if (itemsWithInvalidProduct.length > 0) {
      console.log(`\nFound ${itemsWithInvalidProduct.length} items with invalid product references`);
      const invalidIds = itemsWithInvalidProduct.map(item => item._id);
      const deleteResult2 = await WardrobeItem.deleteMany({ _id: { $in: invalidIds } });
      console.log(`✅ Deleted ${deleteResult2.deletedCount} items with invalid product references`);
    }

    console.log('\n🎉 Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

cleanupInvalidWardrobeItems();

