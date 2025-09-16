const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/products
// @desc    Search and filter products
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      inStock,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      category,
      subcategory,
      brand,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxRating: maxRating ? parseFloat(maxRating) : undefined,
      inStock: inStock === 'true',
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const products = await Product.searchProducts(search, filters);

    // Increment view count for each product (if user is authenticated)
    if (req.user) {
      products.forEach(product => {
        product.incrementViewCount();
      });
    }

    res.json({
      status: 'success',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasMore: products.length === parseInt(limit)
        },
        filters: {
          search,
          category,
          subcategory,
          brand,
          priceRange: { min: minPrice, max: maxPrice },
          ratingRange: { min: minRating, max: maxRating },
          inStock,
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/trending
// @desc    Get trending products
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const products = await Product.getTrendingProducts(parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/ai-recommended
// @desc    Get AI recommended products
// @access  Private
router.get('/ai-recommended', optionalAuth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const userId = req.user ? req.user._id : null;
    
    const products = await Product.getAIRecommendedProducts(userId, parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get AI recommended products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get product categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isAvailable: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          subcategories: { $addToSet: '$subcategory' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/brands
// @desc    Get popular brands
// @access  Public
router.get('/brands', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const brands = await Product.getPopularBrands(parseInt(limit));

    res.json({
      status: 'success',
      data: {
        brands
      }
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Increment view count if user is authenticated
    if (req.user) {
      await product.incrementViewCount();
    }

    res.json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/:id/similar
// @desc    Get similar products
// @access  Public
router.get('/:id/similar', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const products = await Product.getSimilarProducts(req.params.id, parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get similar products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    const products = await Product.getProductsByCategory(category, parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add review to product
// @access  Private
router.post('/:id/reviews', optionalAuth, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot be more than 500 characters')
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

    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const { rating, comment, images = [] } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find(review => 
      review.userId.toString() === userId.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    await product.addReview(userId, rating, comment, images);

    res.status(201).json({
      status: 'success',
      message: 'Review added successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/products/:id/wishlist
// @desc    Add product to wishlist
// @access  Private
router.post('/:id/wishlist', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Increment wishlist count
    await product.incrementWishlistCount();

    // TODO: Add to user's wishlist collection
    // For now, just return success

    res.json({
      status: 'success',
      message: 'Product added to wishlist successfully'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/products/:id/purchase
// @desc    Mark product as purchased (for analytics)
// @access  Private
router.post('/:id/purchase', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Increment purchase count
    await product.incrementPurchaseCount();

    res.json({
      status: 'success',
      message: 'Purchase recorded successfully'
    });
  } catch (error) {
    console.error('Record purchase error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
