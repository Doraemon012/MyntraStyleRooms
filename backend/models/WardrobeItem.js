const mongoose = require('mongoose');

const wardrobeItemSchema = new mongoose.Schema({
  wardrobeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wardrobe',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  isPurchased: {
    type: Boolean,
    default: false
  },
  purchasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  purchasedAt: {
    type: Date,
    default: null
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'love', 'dislike'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  },
  customTags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
wardrobeItemSchema.index({ wardrobeId: 1 });
wardrobeItemSchema.index({ productId: 1 });
wardrobeItemSchema.index({ addedBy: 1 });
wardrobeItemSchema.index({ isPurchased: 1 });
wardrobeItemSchema.index({ addedAt: -1 });

// Virtual for reaction counts
wardrobeItemSchema.virtual('reactionCounts').get(function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.type] = (counts[reaction.type] || 0) + 1;
  });
  return counts;
});

// Virtual for checking if user has reacted
wardrobeItemSchema.virtual('userReaction').get(function() {
  return (userId) => {
    const reaction = this.reactions.find(r => r.userId.toString() === userId.toString());
    return reaction ? reaction.type : null;
  };
});

// Pre-save middleware to update wardrobe item count
wardrobeItemSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Wardrobe = require('./Wardrobe');
      await Wardrobe.findByIdAndUpdate(this.wardrobeId, {
        $inc: { itemCount: 1 },
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating wardrobe item count:', error);
    }
  }
  next();
});

// Pre-remove middleware to update wardrobe item count
wardrobeItemSchema.pre('remove', async function(next) {
  try {
    const Wardrobe = require('./Wardrobe');
    await Wardrobe.findByIdAndUpdate(this.wardrobeId, {
      $inc: { itemCount: -1 },
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error updating wardrobe item count on remove:', error);
  }
  next();
});

// Instance method to add reaction
wardrobeItemSchema.methods.addReaction = function(userId, reactionType) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    userId,
    type: reactionType,
    createdAt: new Date()
  });
  
  return this.save();
};

// Instance method to remove reaction
wardrobeItemSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  return this.save();
};

// Instance method to mark as purchased
wardrobeItemSchema.methods.markAsPurchased = function(userId) {
  this.isPurchased = true;
  this.purchasedBy = userId;
  this.purchasedAt = new Date();
  return this.save();
};

// Instance method to mark as unpurchased
wardrobeItemSchema.methods.markAsUnpurchased = function() {
  this.isPurchased = false;
  this.purchasedBy = null;
  this.purchasedAt = null;
  return this.save();
};

// Static method to get items for wardrobe
wardrobeItemSchema.statics.getWardrobeItems = function(wardrobeId, options = {}) {
  const {
    page = 1,
    limit = 20,
    category = null,
    isPurchased = null,
    sortBy = 'addedAt',
    sortOrder = 'desc'
  } = options;

  const query = { wardrobeId, isActive: true };

  if (isPurchased !== null) {
    query.isPurchased = isPurchased;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(query)
    .populate('productId')
    .populate('addedBy', 'name email profileImage')
    .populate('purchasedBy', 'name email profileImage')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get user's purchased items
wardrobeItemSchema.statics.getUserPurchasedItems = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    wardrobeId = null
  } = options;

  const query = {
    purchasedBy: userId,
    isPurchased: true,
    isActive: true
  };

  if (wardrobeId) {
    query.wardrobeId = wardrobeId;
  }

  return this.find(query)
    .populate('productId')
    .populate('wardrobeId', 'name emoji')
    .populate('addedBy', 'name email profileImage')
    .sort({ purchasedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get recently added items
wardrobeItemSchema.statics.getRecentItems = function(userId, limit = 10) {
  return this.find({
    addedBy: userId,
    isActive: true
  })
    .populate('productId')
    .populate('wardrobeId', 'name emoji')
    .sort({ addedAt: -1 })
    .limit(limit);
};

// Static method to get popular items (most reactions)
wardrobeItemSchema.statics.getPopularItems = function(wardrobeId, limit = 10) {
  return this.aggregate([
    { $match: { wardrobeId: mongoose.Types.ObjectId(wardrobeId), isActive: true } },
    {
      $addFields: {
        totalReactions: { $size: '$reactions' }
      }
    },
    { $sort: { totalReactions: -1, addedAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productId'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'addedBy',
        foreignField: '_id',
        as: 'addedBy'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'purchasedBy',
        foreignField: '_id',
        as: 'purchasedBy'
      }
    },
    {
      $unwind: {
        path: '$productId',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$addedBy',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$purchasedBy',
        preserveNullAndEmptyArrays: true
      }
    }
  ]);
};

module.exports = mongoose.model('WardrobeItem', wardrobeItemSchema);
