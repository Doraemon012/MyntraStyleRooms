const express = require('express');
const { body, validationResult } = require('express-validator');
const OpenAI = require('openai');
const Product = require('../models/Product');
const Wardrobe = require('../models/Wardrobe');
const WardrobeItem = require('../models/WardrobeItem');
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// @route   POST /api/ai/chat
// @desc    Chat with AI stylist
// @access  Private
router.post('/chat', authenticateToken, [
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  body('roomId')
    .optional()
    .isMongoId()
    .withMessage('Invalid room ID'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, roomId, context = {} } = req.body;
    const userId = req.user._id;

    try {
      // Check if roomId is provided and AI is enabled in that room
      if (roomId) {
        const Room = require('../models/Room');
        const room = await Room.findById(roomId);
        
        if (!room) {
          return res.status(404).json({
            status: 'error',
            message: 'Room not found'
          });
        }

        // Check if AI is enabled in this room
        if (!room.settings.aiEnabled) {
          return res.status(403).json({
            status: 'error',
            message: 'AI stylist is disabled in this room'
          });
        }

        // Check if user has permission to use AI in this room
        const member = room.members.find(m => m.userId.toString() === userId.toString());
        if (!member) {
          return res.status(403).json({
            status: 'error',
            message: 'You are not a member of this room'
          });
        }
      }

      // Get AI response directly
      const aiResponse = await getAIResponse(message);

      // Check if AI wants to recommend products
      const productRecommendations = await extractProductRecommendations(aiResponse, {});

      // If roomId is provided, create AI message in the room
      if (roomId && productRecommendations.length > 0) {
        const Message = require('../models/Message');
        const aiMessage = await Message.createAIMessage(roomId, aiResponse, productRecommendations[0]);
        
        // Emit to socket.io clients
        const io = req.app.get('io');
        if (io) {
          io.to(roomId).emit('new-message', {
            message: aiMessage,
            roomId
          });
        }
      }

      res.json({
        status: 'success',
        data: {
          response: aiResponse,
          productRecommendations,
          message: message,
          context: context,
          roomId: roomId
        }
      });
    } catch (error) {
      console.error('AI processing error:', error);
      res.json({
        status: 'success',
        data: {
          response: "I'd love to help you with styling! Here are some great options:\n\nPRODUCT: Statement Earrings - Accessorize - ₹899 - Beautiful statement earrings to complete your look\nPRODUCT: Silk Blend Saree - Soch - ₹4999 - Elegant silk blend saree with intricate work",
          productRecommendations: [],
          message: message,
          context: context,
          roomId: roomId
        }
      });
    }
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/ai/outfit-suggestions
// @desc    Get AI outfit suggestions for wardrobe
// @access  Private
router.post('/outfit-suggestions', authenticateToken, [
  body('wardrobeId')
    .isMongoId()
    .withMessage('Valid wardrobe ID is required'),
  body('occasion')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occasion description cannot be more than 100 characters'),
  body('budget')
    .optional()
    .isNumeric()
    .withMessage('Budget must be a number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { wardrobeId, occasion, budget } = req.body;
    const userId = req.user._id;

    // Get wardrobe and items
    const wardrobe = await Wardrobe.findById(wardrobeId)
      .populate('owner', 'name preferences');
    
    if (!wardrobe) {
      return res.status(404).json({
        status: 'error',
        message: 'Wardrobe not found'
      });
    }

    const wardrobeItems = await WardrobeItem.getWardrobeItems(wardrobeId, { limit: 100 });
    const items = wardrobeItems.map(item => ({
      id: item.productId._id,
      name: item.productId.name,
      category: item.productId.category,
      subcategory: item.productId.subcategory,
      price: item.productId.price,
      brand: item.productId.brand,
      colors: item.productId.colors,
      images: item.productId.images
    }));

    // Create outfit suggestions
    const outfitSuggestions = await generateOutfitSuggestions(items, {
      occasion: occasion || wardrobe.occasionType,
      budget,
      userPreferences: wardrobe.owner.preferences
    });

    res.json({
      status: 'success',
      data: {
        outfitSuggestions,
        wardrobe: {
          name: wardrobe.name,
          occasionType: wardrobe.occasionType,
          itemCount: wardrobe.itemCount
        }
      }
    });
  } catch (error) {
    console.error('AI outfit suggestions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/ai/product-recommendations
// @desc    Get AI product recommendations
// @access  Private
router.post('/product-recommendations', authenticateToken, [
  body('query')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Query must be between 1 and 200 characters'),
  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { query, filters = {} } = req.body;
    const userId = req.user._id;

    // Get user preferences
    const userPreferences = req.user.preferences;

    // Search products based on query
    const products = await Product.searchProducts(query, {
      ...filters,
      limit: 20
    });

    // Use AI to rank and filter products
    const aiRankedProducts = await rankProductsWithAI(products, userPreferences, query);

    res.json({
      status: 'success',
      data: {
        products: aiRankedProducts,
        query,
        filters
      }
    });
  } catch (error) {
    console.error('AI product recommendations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/ai/style-analysis
// @desc    Analyze user's style preferences
// @access  Private
router.post('/style-analysis', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's wardrobe data
    const wardrobes = await Wardrobe.findByUser(userId);
    const wardrobeItems = await WardrobeItem.find({
      wardrobeId: { $in: wardrobes.map(w => w._id) },
      isActive: true
    }).populate('productId');

    // Analyze style patterns
    const styleAnalysis = await analyzeStylePatterns(wardrobeItems, req.user.preferences);

    res.json({
      status: 'success',
      data: {
        styleAnalysis
      }
    });
  } catch (error) {
    console.error('Style analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// Helper function to get user context
async function getUserContext(userId, roomId) {
  const context = {
    user: {
      name: req.user.name,
      preferences: req.user.preferences,
      location: req.user.location
    },
    recentActivity: [],
    wardrobeItems: []
  };

  // Get recent wardrobe items
  const recentItems = await WardrobeItem.getRecentItems(userId, 10);
  context.wardrobeItems = recentItems.map(item => ({
    name: item.productId.name,
    category: item.productId.category,
    brand: item.productId.brand,
    price: item.productId.price
  }));

  // Get room context if roomId provided
  if (roomId) {
    const recentMessages = await Message.getRoomMessages(roomId, { limit: 10 });
    context.recentActivity = recentMessages.map(msg => ({
      type: msg.messageType,
      text: msg.text,
      timestamp: msg.timestamp
    }));
  }

  return context;
}

// Helper function to create styling prompt
function createStylingPrompt(message, userContext, additionalContext) {
  return `You are a professional fashion stylist and AI assistant for Myntra's social shopping platform. 

User Context:
- Name: ${userContext.user.name}
- Location: ${userContext.user.location || 'Not specified'}
- Style Preferences: ${JSON.stringify(userContext.user.preferences)}
- Recent Items: ${JSON.stringify(userContext.wardrobeItems)}

Recent Activity: ${JSON.stringify(userContext.recentActivity)}

User Message: "${message}"

Additional Context: ${JSON.stringify(additionalContext)}

Please provide helpful, personalized fashion advice. If the user is asking for product recommendations, suggest specific items from Myntra's catalog. Be conversational, friendly, and knowledgeable about fashion trends, styling tips, and outfit coordination.

If recommending products, format them as:
PRODUCT: [Product Name] - [Brand] - ₹[Price] - [Brief Description]

Keep responses concise but informative (max 300 words).`;
}

// Helper function to get AI response
async function getAIResponse(prompt) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('OpenAI API key not configured, using mock response');
      return getMockAIResponse(prompt);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional fashion stylist AI assistant for Myntra. Provide helpful, personalized fashion advice and product recommendations. Always suggest specific products with PRODUCT: format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getMockAIResponse(prompt);
  }
}


// Mock AI response for testing
function getMockAIResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('accessory') || lowerPrompt.includes('jewelry') || lowerPrompt.includes('earring')) {
    return `Great choice! For accessories, I recommend these beautiful pieces:

PRODUCT: Statement Earrings - Accessorize - ₹899 - Beautiful statement earrings to complete your look
PRODUCT: Block Heels Sandals - Metro - ₹1899 - Comfortable block heel sandals for all-day wear

These accessories will perfectly complement your outfit and add that extra sparkle to your look! ✨`;
  }
  
  if (lowerPrompt.includes('saree') || lowerPrompt.includes('ethnic')) {
    return `Perfect for ethnic wear! Here are some stunning options:

PRODUCT: Silk Blend Saree - Soch - ₹4999 - Elegant silk blend saree with intricate work
PRODUCT: Statement Earrings - Accessorize - ₹899 - Beautiful statement earrings to complete your look

The saree is perfect for weddings and festivals, and the earrings will add the perfect finishing touch! 🎉`;
  }
  
  if (lowerPrompt.includes('party') || lowerPrompt.includes('night')) {
    return `For a party look, I suggest these trendy pieces:

PRODUCT: Floral Print Maxi Dress - Libas - ₹2499 - Beautiful floral print maxi dress perfect for summer occasions
PRODUCT: Statement Earrings - Accessorize - ₹899 - Beautiful statement earrings to complete your look

This combination will make you the star of the party! 🌟`;
  }
  
  return `I'd love to help you with styling! Based on your request, here are some great options:

PRODUCT: Floral Print Maxi Dress - Libas - ₹2499 - Beautiful floral print maxi dress perfect for summer occasions
PRODUCT: Silk Blend Saree - Soch - ₹4999 - Elegant silk blend saree with intricate work

These pieces are trending and perfect for various occasions. Would you like me to suggest accessories to go with them? 💫`;
}

// Helper function to extract product recommendations from AI response
async function extractProductRecommendations(aiResponse, userContext) {
  const productMatches = aiResponse.match(/PRODUCT: ([^-]+) - ([^-]+) - ₹([^-]+) - (.+)/g);
  
  if (!productMatches) return [];

  const recommendations = [];
  
  for (const match of productMatches) {
    const [, name, brand, price, description] = match.match(/PRODUCT: ([^-]+) - ([^-]+) - ₹([^-]+) - (.+)/);
    
    try {
      // Search for similar products in database
      const products = await Product.find({
        $or: [
          { name: { $regex: name.trim(), $options: 'i' } },
          { brand: { $regex: brand.trim(), $options: 'i' } }
        ]
      }).limit(1);
      
      if (products.length > 0) {
        recommendations.push({
          name: products[0].name,
          brand: products[0].brand,
          price: `₹${products[0].price}`,
          image: products[0].primaryImage,
          productId: products[0]._id,
          description: description.trim(),
          originalPrice: products[0].originalPrice,
          discount: products[0].discountPercentage
        });
      } else {
        // Fallback: create recommendation from AI response
        recommendations.push({
          name: name.trim(),
          brand: brand.trim(),
          price: `₹${price}`,
          image: "https://via.placeholder.com/300x400/4CAF50/ffffff?text=Product",
          productId: null,
          description: description.trim(),
          originalPrice: null,
          discount: 0
        });
      }
    } catch (error) {
      console.error('Error extracting product recommendation:', error);
      // Fallback: create recommendation from AI response
      recommendations.push({
        name: name.trim(),
        brand: brand.trim(),
        price: `₹${price}`,
        image: "https://via.placeholder.com/300x400/4CAF50/ffffff?text=Product",
        productId: null,
        description: description.trim(),
        originalPrice: null,
        discount: 0
      });
    }
  }

  return recommendations;
}

// Helper function to generate outfit suggestions
async function generateOutfitSuggestions(items, context) {
  const prompt = `Create 3 outfit suggestions using these wardrobe items:

Items: ${JSON.stringify(items)}

Context:
- Occasion: ${context.occasion}
- Budget: ${context.budget ? `₹${context.budget}` : 'No budget limit'}
- User Preferences: ${JSON.stringify(context.userPreferences)}

For each outfit, provide:
1. Outfit name
2. Items to wear together
3. Occasion suitability
4. Confidence score (1-100)

Format as JSON array.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a fashion stylist. Create outfit suggestions in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('Outfit generation error:', error);
    return [];
  }
}

// Helper function to rank products with AI
async function rankProductsWithAI(products, userPreferences, query) {
  const prompt = `Rank these products based on user preferences and query:

Products: ${JSON.stringify(products.slice(0, 10))}
User Preferences: ${JSON.stringify(userPreferences)}
Query: "${query}"

Return ranked product IDs in order of relevance.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a product recommendation AI. Return only the ranked product IDs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    });

    // Parse AI response and reorder products
    const rankedIds = completion.choices[0].message.content.split('\n').map(id => id.trim());
    const rankedProducts = [];
    
    for (const id of rankedIds) {
      const product = products.find(p => p._id.toString() === id);
      if (product) rankedProducts.push(product);
    }

    return rankedProducts;
  } catch (error) {
    console.error('Product ranking error:', error);
    return products;
  }
}

// Helper function to analyze style patterns
async function analyzeStylePatterns(wardrobeItems, userPreferences) {
  const analysis = {
    topCategories: {},
    topBrands: {},
    priceRange: { min: Infinity, max: 0 },
    colorPreferences: {},
    styleInsights: []
  };

  wardrobeItems.forEach(item => {
    const product = item.productId;
    
    // Category analysis
    analysis.topCategories[product.category] = (analysis.topCategories[product.category] || 0) + 1;
    
    // Brand analysis
    analysis.topBrands[product.brand] = (analysis.topBrands[product.brand] || 0) + 1;
    
    // Price analysis
    analysis.priceRange.min = Math.min(analysis.priceRange.min, product.price);
    analysis.priceRange.max = Math.max(analysis.priceRange.max, product.price);
    
    // Color analysis
    if (product.colors && product.colors.length > 0) {
      product.colors.forEach(color => {
        analysis.colorPreferences[color.name] = (analysis.colorPreferences[color.name] || 0) + 1;
      });
    }
  });

  // Generate insights
  const topCategory = Object.keys(analysis.topCategories).reduce((a, b) => 
    analysis.topCategories[a] > analysis.topCategories[b] ? a : b
  );

  analysis.styleInsights.push(`You have a strong preference for ${topCategory.toLowerCase()}`);
  analysis.styleInsights.push(`Your wardrobe spans ₹${analysis.priceRange.min} - ₹${analysis.priceRange.max}`);
  
  const topBrand = Object.keys(analysis.topBrands).reduce((a, b) => 
    analysis.topBrands[a] > analysis.topBrands[b] ? a : b
  );
  
  if (topBrand) {
    analysis.styleInsights.push(`${topBrand} is your most preferred brand`);
  }

  return analysis;
}

module.exports = router;
