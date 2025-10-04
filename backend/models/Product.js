const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot be more than 200 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Women',
      'Men',
      'Kids',
      'Beauty',
      'Footwear',
      'Sports',
      'Accessories',
      'Home & Living',
      'Electronics'
    ]
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: null
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  specifications: {
    material: String,
    care: String,
    origin: String,
    weight: String,
    dimensions: String,
    color: String,
    pattern: String,
    closure: String,
    heelHeight: String,
    sole: String,
    season: String,
    occasion: [String]
  },
  sizes: [{
    size: String,
    stock: {
      type: Number,
      default: 0
    }
  }],
  colors: [{
    name: String,
    hex: String,
    image: String,
    stock: {
      type: Number,
      default: 0
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [String],
  aiRecommended: {
    type: Boolean,
    default: false
  },
  trendingScore: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  },
  metadata: {
    source: {
      type: String,
      default: 'myntra'
    },
    externalId: String,
    lastSynced: Date
  },
  // Additional fields for better frontend compatibility
  features: [String],
  isNew: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isSustainable: {
    type: Boolean,
    default: false
  },
  sustainability: String,
  delivery: {
    standard: {
      estimatedDays: String,
      price: Number,
      originalPrice: Number,
      discount: Number
    },
    express: {
      estimatedDays: String,
      price: Number
    }
  },
  offers: {
    bankOffers: [String],
    couponOffers: [String],
    additionalDiscount: Number
  },
  returnPolicy: String,
  paymentOptions: {
    cod: Boolean,
    codFee: Number
  },
  similarProducts: [String],
  youMayAlsoLike: [String],
  questions: [{
    _id: {
      type: String,
      default: function() {
        return new mongoose.Types.ObjectId().toString();
      }
    },
    question: String,
    answer: String,
    askedBy: String,
    answeredBy: String,
    date: String,
    helpful: Number
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ trendingScore: -1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ aiRecommended: 1 });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg ? primaryImg.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return this.discount;
});

// Virtual for stock status
productSchema.virtual('inStock').get(function() {
  return (this.sizes && this.sizes.some(size => size.stock > 0)) || (this.colors && this.colors.some(color => color.stock > 0));
});

// Pre-save middleware to calculate discount
productSchema.pre('save', function(next) {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Instance method to add review
productSchema.methods.addReview = function(userId, rating, comment, images = []) {
  this.reviews.push({
    userId,
    rating,
    comment,
    images,
    createdAt: new Date()
  });

  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;

  return this.save();
};

// Instance method to increment view count
productSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to increment purchase count
productSchema.methods.incrementPurchaseCount = function() {
  this.purchaseCount += 1;
  return this.save();
};

// Instance method to increment wishlist count
productSchema.methods.incrementWishlistCount = function() {
  this.wishlistCount += 1;
  return this.save();
};

// Static method to search products
productSchema.statics.searchProducts = function(searchTerm, filters = {}) {
  const {
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
  } = filters;

  let query = {};

  // Text search
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Subcategory filter
  if (subcategory) {
    query.subcategory = subcategory;
  }

  // Brand filter
  if (brand) {
    query.brand = { $regex: brand, $options: 'i' };
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  // Rating filter
  if (minRating !== undefined || maxRating !== undefined) {
    query['rating.average'] = {};
    if (minRating !== undefined) query['rating.average'].$gte = minRating;
    if (maxRating !== undefined) query['rating.average'].$lte = maxRating;
  }

  // Stock filter
  if (inStock) {
    query.$or = [
      { 'sizes.stock': { $gt: 0 } },
      { 'colors.stock': { $gt: 0 } }
    ];
  }

  // Sort options
  let sortOptions = {};
  switch (sortBy) {
    case 'price':
      sortOptions.price = sortOrder === 'desc' ? -1 : 1;
      break;
    case 'rating':
      sortOptions['rating.average'] = sortOrder === 'desc' ? -1 : 1;
      break;
    case 'popularity':
      sortOptions.purchaseCount = sortOrder === 'desc' ? -1 : 1;
      break;
    case 'newest':
      sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
      break;
    case 'trending':
      sortOptions.trendingScore = sortOrder === 'desc' ? -1 : 1;
      break;
    default: // relevance
      if (searchTerm) {
        sortOptions.score = { $meta: 'textScore' };
      } else {
        sortOptions.trendingScore = -1;
      }
  }

  return this.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get trending products
productSchema.statics.getTrendingProducts = function(limit = 20) {
  return this.find({ isAvailable: true })
    .sort({ trendingScore: -1, purchaseCount: -1 })
    .limit(limit);
};

// Static method to get AI recommended products
productSchema.statics.getAIRecommendedProducts = function(userId, limit = 20) {
  // This would typically use ML models to recommend products
  // For now, return products marked as AI recommended
  return this.find({ 
    aiRecommended: true, 
    isAvailable: true 
  })
    .sort({ trendingScore: -1 })
    .limit(limit);
};

// Static method to get similar products
productSchema.statics.getSimilarProducts = function(productId, limit = 10) {
  return this.findById(productId)
    .then(product => {
      if (!product) return [];

      return this.find({
        _id: { $ne: productId },
        $or: [
          { category: product.category },
          { brand: product.brand },
          { subcategory: product.subcategory }
        ],
        isAvailable: true
      })
        .sort({ rating: -1 })
        .limit(limit);
    });
};

// Static method to get products by category
productSchema.statics.getProductsByCategory = function(category, limit = 20) {
  return this.find({ 
    category, 
    isAvailable: true 
  })
    .sort({ trendingScore: -1 })
    .limit(limit);
};

// Static method to get popular brands
productSchema.statics.getPopularBrands = function(limit = 20) {
  return this.aggregate([
    { $match: { isAvailable: true } },
    {
      $group: {
        _id: '$brand',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating.average' },
        totalSales: { $sum: '$purchaseCount' }
      }
    },
    { $sort: { totalSales: -1, avgRating: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Product', productSchema);
