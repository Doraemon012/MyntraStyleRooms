const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Product model
const Product = require('../models/Product');

// Load the JSON data
const jsonDataPath = path.join(__dirname, '../../assets/CatalogCSVItems/myntra_top500_products.json');
const productData = JSON.parse(fs.readFileSync(jsonDataPath, 'utf8'));

// Helper function to generate random tags based on category and subcategory
const generateTags = (category, subcategory, brand) => {
  const categoryTags = {
    'Women': ['women', 'fashion', 'style', 'trendy'],
    'Men': ['men', 'masculine', 'casual', 'formal'],
    'Kids': ['kids', 'children', 'cute', 'playful']
  };
  
  const subcategoryTags = {
    'Dresses': ['dress', 'elegant', 'feminine', 'occasion'],
    'Tops': ['top', 'shirt', 'blouse', 'casual'],
    'Bottoms': ['pants', 'jeans', 'trousers', 'bottom'],
    'Jackets': ['jacket', 'outerwear', 'warm', 'layered'],
    'Accessories': ['accessory', 'add-on', 'complement', 'style'],
    'Shoes': ['footwear', 'shoes', 'comfort', 'walking'],
    'Bags': ['bag', 'handbag', 'purse', 'carry']
  };
  
  const brandTags = {
    'Zara': ['zara', 'european', 'contemporary'],
    'H&M': ['h&m', 'fast-fashion', 'affordable'],
    'Levi\'s': ['levis', 'denim', 'classic', 'american'],
    'Nike': ['nike', 'sport', 'athletic', 'performance'],
    'Adidas': ['adidas', 'sport', 'athletic', 'german']
  };
  
  const occasionTags = ['casual', 'formal', 'party', 'work', 'date', 'travel', 'sport', 'wedding'];
  const styleTags = ['vintage', 'modern', 'minimalist', 'bohemian', 'preppy', 'edgy', 'romantic'];
  const colorTags = ['black', 'white', 'blue', 'red', 'green', 'pink', 'yellow', 'purple', 'brown', 'gray'];
  
  let tags = [];
  
  // Add category-based tags
  if (categoryTags[category]) {
    tags = tags.concat(categoryTags[category]);
  }
  
  // Add subcategory-based tags
  if (subcategoryTags[subcategory]) {
    tags = tags.concat(subcategoryTags[subcategory]);
  }
  
  // Add brand-based tags
  if (brandTags[brand]) {
    tags = tags.concat(brandTags[brand]);
  }
  
  // Add random occasion, style, and color tags
  const randomOccasion = occasionTags[Math.floor(Math.random() * occasionTags.length)];
  const randomStyle = styleTags[Math.floor(Math.random() * styleTags.length)];
  const randomColor = colorTags[Math.floor(Math.random() * colorTags.length)];
  
  tags.push(randomOccasion, randomStyle, randomColor);
  
  // Remove duplicates and return up to 8 tags
  return [...new Set(tags)].slice(0, 8);
};

// Helper function to generate features based on product data
const generateFeatures = (product) => {
  const features = [];
  
  // Add material-based features
  if (product.specifications?.material) {
    features.push(`${product.specifications.material} fabric`);
  }
  
  // Add category-based features
  if (product.category === 'Women') {
    features.push('Women\'s fashion');
  } else if (product.category === 'Men') {
    features.push('Men\'s fashion');
  } else if (product.category === 'Kids') {
    features.push('Kids\' fashion');
  }
  
  // Add subcategory-based features
  const subcategoryFeatures = {
    'Dresses': ['A-line silhouette', 'Comfortable fit'],
    'Tops': ['Versatile styling', 'Easy care'],
    'Bottoms': ['Comfortable waistband', 'Durable construction'],
    'Jackets': ['Weather protection', 'Layering piece'],
    'Shoes': ['Comfortable sole', 'Breathable material'],
    'Bags': ['Spacious interior', 'Durable hardware']
  };
  
  if (subcategoryFeatures[product.subcategory]) {
    features.push(...subcategoryFeatures[product.subcategory]);
  }
  
  // Add random general features
  const generalFeatures = [
    'Machine washable',
    'Wrinkle resistant',
    'Colorfast',
    'Easy care',
    'Comfortable fit',
    'Durable construction',
    'Trendy design',
    'Versatile styling'
  ];
  
  const randomFeatures = generalFeatures
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
  
  features.push(...randomFeatures);
  
  // Remove duplicates and return up to 6 features
  return [...new Set(features)].slice(0, 6);
};

// Helper function to generate occasion array
const generateOccasions = () => {
  const occasions = ['casual', 'formal', 'party', 'work', 'date', 'travel', 'sport', 'wedding'];
  return occasions.sort(() => 0.5 - Math.random()).slice(0, 3);
};

// Helper function to enrich product data
const enrichProduct = (product) => {
  return {
    ...product,
    // Generate random values for new fields
    tags: generateTags(product.category, product.subcategory, product.brand),
    features: generateFeatures(product),
    trendingScore: Math.floor(Math.random() * 101), // 0-100
    purchaseCount: Math.floor(Math.random() * 501), // 0-500
    wishlistCount: Math.floor(Math.random() * 201), // 0-200
    viewCount: Math.floor(Math.random() * 2001), // 0-2000
    isAvailable: true,
    aiRecommended: Math.random() < 0.3, // 30% chance
    similarProducts: [], // Will be populated by recommendation script
    youMayAlsoLike: [], // Will be populated by recommendation script
    
    // Add occasion to specifications if not present
    specifications: {
      ...product.specifications,
      occasion: product.specifications?.occasion || generateOccasions()
    },
    
    // Ensure rating structure is correct
    rating: {
      average: product.rating?.average || (3 + Math.random() * 2), // 3-5
      count: product.rating?.count || Math.floor(Math.random() * 200) + 10 // 10-210
    },
    
    // Add delivery information if not present
    delivery: product.delivery || {
      standard: {
        estimatedDays: '2-4 business days',
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        discount: product.discount || 0
      }
    },
    
    // Add offers if not present
    offers: product.offers || {
      bankOffers: ['10% off on HDFC Credit Card'],
      couponOffers: ['WELCOME10 - 10% off for new users'],
      additionalDiscount: Math.floor(Math.random() * 200)
    },
    
    // Add return policy if not present
    returnPolicy: product.returnPolicy || '30 days return & exchange policy',
    
    // Add payment options if not present
    paymentOptions: product.paymentOptions || {
      cod: true,
      codFee: 0
    },
    
    // Add metadata
    metadata: {
      source: 'myntra',
      lastSynced: new Date()
    }
  };
};

async function seedProductsWithRecommendations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myntra_style_rooms');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Process and enrich products
    console.log(`Processing ${productData.length} products...`);
    const enrichedProducts = productData.map(enrichProduct);

    // Insert products in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < enrichedProducts.length; i += batchSize) {
      const batch = enrichedProducts.slice(i, i + batchSize);
      await Product.insertMany(batch);
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${enrichedProducts.length} products`);
    }

    console.log('Products seeded successfully!');
    console.log(`Created ${inserted} products with enriched data`);

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedProductsWithRecommendations();
}

module.exports = { seedProductsWithRecommendations };

