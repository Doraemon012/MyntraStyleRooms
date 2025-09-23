const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'ai'],
    default: 'user'
  },
  text: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    },
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'product', 'image', 'voice', 'system'],
    default: 'text'
  },
  productData: {
    name: String,
    price: String,
    image: String,
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    brand: String,
    category: String
  },
  imageData: {
    url: String,
    caption: String,
    width: Number,
    height: Number
  },
  voiceData: {
    url: String,
    duration: Number,
    transcription: String
  },
  systemData: {
    action: String, // 'member_joined', 'member_left', 'room_created', etc.
    data: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
messageSchema.index({ roomId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ timestamp: -1 });

// Virtual for reaction counts
messageSchema.virtual('reactionCounts').get(function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.type] = (counts[reaction.type] || 0) + 1;
  });
  return counts;
});

// Virtual for checking if user has reacted
messageSchema.virtual('userReaction').get(function() {
  return (userId) => {
    const reaction = this.reactions.find(r => r.userId.toString() === userId.toString());
    return reaction ? reaction.type : null;
  };
});

// Pre-save middleware to update room's last activity
messageSchema.pre('save', async function(next) {
  if (this.isNew && this.messageType !== 'system') {
    try {
      const Room = require('./Room');
      await Room.findByIdAndUpdate(this.roomId, {
        lastActivity: this.timestamp,
        lastMessage: this.text || `[${this.messageType}]`
      });
    } catch (error) {
      console.error('Error updating room activity:', error);
    }
  }
  next();
});

// Instance method to add reaction
messageSchema.methods.addReaction = function(userId, reactionType) {
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
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  return this.save();
};

// Instance method to mark as read
messageSchema.methods.markAsRead = function(userId) {
  if (!this.isRead.includes(userId)) {
    this.isRead.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to soft delete
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.text = '[Message deleted]';
  return this.save();
};

// Static method to get messages for room
messageSchema.statics.getRoomMessages = function(roomId, options = {}) {
  const {
    page = 1,
    limit = 50,
    before = null,
    after = null
  } = options;

  const query = {
    roomId,
    isDeleted: false
  };

  // Add timestamp filters
  if (before) {
    query.timestamp = { $lt: new Date(before) };
  }
  if (after) {
    query.timestamp = { $gt: new Date(after) };
  }

  return this.find(query)
    .populate('senderId', 'name email profileImage')
    .populate('productData.productId')
    .populate('replyTo')
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to create system message
messageSchema.statics.createSystemMessage = function(roomId, action, data = {}) {
  return this.create({
    roomId,
    senderId: null, // System messages don't have a sender
    senderType: 'system',
    messageType: 'system',
    systemData: {
      action,
      data
    },
    timestamp: new Date()
  });
};

// Static method to create AI message
messageSchema.statics.createAIMessage = function(roomId, text, productData = null) {
  const messageData = {
    roomId,
    senderId: null, // AI messages don't have a human sender
    senderType: 'ai',
    messageType: productData ? 'product' : 'text',
    text,
    timestamp: new Date()
  };

  if (productData) {
    messageData.productData = productData;
  }

  return this.create(messageData);
};

module.exports = mongoose.model('Message', messageSchema);
