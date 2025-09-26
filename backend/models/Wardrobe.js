const mongoose = require('mongoose');

const wardrobeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Wardrobe name is required'],
    trim: true,
    maxlength: [50, 'Wardrobe name cannot be more than 50 characters']
  },
  emoji: {
    type: String,
    required: [true, 'Wardrobe emoji is required'],
    default: '👗'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  occasionType: {
    type: String,
    enum: [
      'Wedding & Celebrations',
      'Office & Professional',
      'Casual & Weekend',
      'Party & Nightlife',
      'Travel & Vacation',
      'Festival & Cultural',
      'Sports & Fitness',
      'Date Night',
      'General Collection'
    ],
    required: [true, 'Occasion type is required']
  },
  budgetRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 50000
    }
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['Owner', 'Editor', 'Contributor', 'Viewer'],
      default: 'Contributor'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  itemCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    aiSuggestionsEnabled: {
      type: Boolean,
      default: true
    },
    autoOutfitGeneration: {
      type: Boolean,
      default: false
    }
  },
  tags: [String],
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
wardrobeSchema.index({ owner: 1 });
wardrobeSchema.index({ 'members.userId': 1 });
wardrobeSchema.index({ occasionType: 1 });
wardrobeSchema.index({ lastUpdated: -1 });
wardrobeSchema.index({ isActive: 1 });

// Virtual for member count
wardrobeSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for checking if user is member
wardrobeSchema.virtual('isMember').get(function() {
  return (userId) => {
    return this.members.some(member => member.userId.toString() === userId.toString());
  };
});

// Virtual for getting user role in wardrobe
wardrobeSchema.virtual('getUserRole').get(function() {
  return (userId) => {
    const member = this.members.find(member => member.userId.toString() === userId.toString());
    return member ? member.role : null;
  };
});

// Pre-save middleware to add owner as member
wardrobeSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add owner as first member with Owner role
    this.members.unshift({
      userId: this.owner,
      role: 'Owner',
      joinedAt: new Date()
    });
  }
  next();
});

// Instance method to add member
wardrobeSchema.methods.addMember = function(userId, role = 'Contributor') {
  // Check if user is already a member
  const existingMember = this.members.find(member => member.userId.toString() === userId.toString());
  
  if (existingMember) {
    throw new Error('User is already a member of this wardrobe');
  }

  this.members.push({
    userId,
    role,
    joinedAt: new Date()
  });

  return this.save();
};

// Instance method to remove member
wardrobeSchema.methods.removeMember = function(userId) {
  // Cannot remove owner
  if (this.owner.toString() === userId.toString()) {
    throw new Error('Cannot remove wardrobe owner');
  }

  this.members = this.members.filter(member => member.userId.toString() !== userId.toString());
  return this.save();
};

// Instance method to update member role
wardrobeSchema.methods.updateMemberRole = function(userId, newRole) {
  // Cannot change owner role
  if (this.owner.toString() === userId.toString()) {
    throw new Error('Cannot change owner role');
  }

  const member = this.members.find(member => member.userId.toString() === userId.toString());
  if (!member) {
    throw new Error('User is not a member of this wardrobe');
  }

  member.role = newRole;
  return this.save();
};

// Instance method to update last activity
wardrobeSchema.methods.updateLastActivity = function() {
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to update item count
wardrobeSchema.methods.updateItemCount = async function() {
  const WardrobeItem = require('./WardrobeItem');
  const count = await WardrobeItem.countDocuments({ wardrobeId: this._id });
  this.itemCount = count;
  return this.save();
};

// Static method to find wardrobes by user
wardrobeSchema.statics.findByUser = function(userId, options = {}) {
  const query = {
    $or: [
      { owner: userId },
      { 'members.userId': userId }
    ],
    isActive: true
  };

  if (options.isOwner) {
    query.owner = userId;
  }

  if (options.isMember) {
    query['members.userId'] = userId;
  }

  if (options.occasionType) {
    query.occasionType = options.occasionType;
  }

  if (options.roomId && mongoose.Types.ObjectId.isValid(options.roomId)) {
    query.roomId = options.roomId;
  }

  return this.find(query)
    .populate('owner', 'name email profileImage')
    .populate('members.userId', 'name email profileImage')
    .sort({ lastUpdated: -1 });
};

// Static method to search wardrobes
wardrobeSchema.statics.searchWardrobes = function(searchTerm, userId = null, roomId = null) {
  const query = {
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { occasionType: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ],
    isActive: true,
    isPrivate: false // Only search public wardrobes
  };

  if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
    query.roomId = roomId;
  }

  // If user is provided, also include their private wardrobes
  if (userId) {
    query.$or.push({
      $and: [
        { isPrivate: true },
        {
          $or: [
            { owner: userId },
            { 'members.userId': userId }
          ]
        }
      ]
    });
  }

  return this.find(query)
    .populate('owner', 'name email profileImage')
    .populate('members.userId', 'name email profileImage')
    .sort({ lastUpdated: -1 });
};

// Static method to get wardrobe statistics
wardrobeSchema.statics.getWardrobeStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { owner: userId },
          { 'members.userId': userId }
        ],
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalWardrobes: { $sum: 1 },
        ownedWardrobes: {
          $sum: {
            $cond: [{ $eq: ['$owner', userId] }, 1, 0]
          }
        },
        totalItems: { $sum: '$itemCount' },
        avgItemsPerWardrobe: { $avg: '$itemCount' }
      }
    }
  ]);

  return stats[0] || {
    totalWardrobes: 0,
    ownedWardrobes: 0,
    totalItems: 0,
    avgItemsPerWardrobe: 0
  };
};

module.exports = mongoose.model('Wardrobe', wardrobeSchema);
