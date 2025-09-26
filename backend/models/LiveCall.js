const mongoose = require('mongoose');

const liveCallSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['host', 'participant'],
      default: 'participant'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: {
      type: Date,
      default: null
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isSpeaking: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Real-time browsing data
    currentProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    scrollPosition: {
      type: Number,
      default: 0
    },
    browsingHistory: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }],
    connectionId: String,
    streamId: String
  }],
  wardrobeItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WardrobeItem'
  }],
  // Real-time session data
  sessionData: {
    currentProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    scrollPosition: {
      type: Number,
      default: 0
    },
    // Master browsing state
    searchQuery: {
      type: String,
      default: ''
    },
    activeFilters: {
      category: {
        type: String,
        default: ''
      },
      subcategory: {
        type: String,
        default: ''
      },
      brand: {
        type: String,
        default: ''
      },
      priceRange: {
        min: {
          type: Number,
          default: null
        },
        max: {
          type: Number,
          default: null
        }
      },
      ratingRange: {
        min: {
          type: Number,
          default: null
        },
        max: {
          type: Number,
          default: null
        }
      },
      inStock: {
        type: Boolean,
        default: false
      }
    },
    sortBy: {
      type: String,
      enum: ['relevance', 'price', 'popularity', 'rating', 'newest'],
      default: 'relevance'
    },
    sortOrder: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'desc'
    },
    currentPage: {
      type: Number,
      default: 1
    },
    totalPages: {
      type: Number,
      default: 1
    },
    totalProducts: {
      type: Number,
      default: 0
    },
    browsingHistory: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      },
      viewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    cartUpdates: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      action: {
        type: String,
        enum: ['added', 'removed'],
        default: 'added'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    activeBrowsers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      lastSeen: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // Master screen control system
  masterControl: {
    currentController: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      startedAt: {
        type: Date,
        default: null
      },
      expiresAt: {
        type: Date,
        default: null
      }
    },
    controlRequests: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      requestedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'denied'],
        default: 'pending'
      },
      expiresAt: {
        type: Date,
        default: Date.now() + 5 * 60 * 1000 // 5 minutes
      }
    }],
    autoTransferAfter: {
      type: Number, // minutes
      default: 10
    }
  },
  callDuration: {
    type: Number,
    default: 0 // in seconds
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'paused'],
    default: 'active'
  },
  // Call duration limits
  duration: {
    maxDuration: {
      type: Number,
      default: 30 // minutes
    },
    minDuration: {
      type: Number,
      default: 10 // minutes
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date,
      default: null
    }
  },
  // Current controller
  currentController: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  // Control requests queue
  controlRequests: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending'
    },
    message: {
      type: String,
      default: ''
    }
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  },
  settings: {
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowRecording: {
      type: Boolean,
      default: false
    },
    maxParticipants: {
      type: Number,
      default: 8
    }
  },
  recording: {
    url: String,
    duration: Number,
    startedAt: Date,
    endedAt: Date
  },
  metadata: {
    webrtcConfig: {
      iceServers: [{
        urls: [String],
        username: { type: String, default: '' },
        credential: { type: String, default: '' }
      }]
    },
    sessionId: String,
    callType: {
      type: String,
      enum: ['voice', 'video', 'screen_share'],
      default: 'voice'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
liveCallSchema.index({ roomId: 1 });
liveCallSchema.index({ hostId: 1 });
liveCallSchema.index({ status: 1 });
liveCallSchema.index({ startedAt: -1 });

// Virtual for active participants count
liveCallSchema.virtual('activeParticipantsCount').get(function() {
  return this.participants.filter(p => !p.leftAt).length;
});

// Virtual for call duration in minutes
liveCallSchema.virtual('durationInMinutes').get(function() {
  return Math.floor(this.callDuration / 60);
});

// Pre-save middleware to update room's live status
liveCallSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Room = require('./Room');
      await Room.findByIdAndUpdate(this.roomId, {
        isLive: true,
        liveCallId: this._id
      });
    } catch (error) {
      console.error('Error updating room live status:', error);
    }
  }
  
  if (this.status === 'ended' && !this.endedAt) {
    this.endedAt = new Date();
    this.callDuration = Math.floor((this.endedAt - this.startedAt) / 1000);
    
    // Update room's live status
    try {
      const Room = require('./Room');
      await Room.findByIdAndUpdate(this.roomId, {
        isLive: false,
        liveCallId: null
      });
    } catch (error) {
      console.error('Error updating room live status on end:', error);
    }
  }
  
  next();
});

// Instance method to add participant
liveCallSchema.methods.addParticipant = function(userId, connectionId = null) {
  // Check if user is already a participant
  const existingParticipant = this.participants.find(p => p.userId.toString() === userId.toString());
  
  if (existingParticipant) {
    // Update existing participant
    existingParticipant.joinedAt = new Date();
    existingParticipant.leftAt = null;
    existingParticipant.connectionId = connectionId;
    return this.save();
  }

  // Add new participant
  this.participants.push({
    userId,
    joinedAt: new Date(),
    connectionId
  });

  return this.save();
};

// Instance method to remove participant
liveCallSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  
  if (participant) {
    participant.leftAt = new Date();
  }

  return this.save();
};

// Instance method to update participant status
liveCallSchema.methods.updateParticipantStatus = function(userId, updates) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  
  if (participant) {
    Object.assign(participant, updates);
  }

  return this.save();
};

// Instance method to add wardrobe item
liveCallSchema.methods.addWardrobeItem = function(itemId) {
  if (!this.wardrobeItems.includes(itemId)) {
    this.wardrobeItems.push(itemId);
  }
  return this.save();
};

// Instance method to remove wardrobe item
liveCallSchema.methods.removeWardrobeItem = function(itemId) {
  this.wardrobeItems = this.wardrobeItems.filter(id => id.toString() !== itemId.toString());
  return this.save();
};

// Instance method to end call
liveCallSchema.methods.endCall = function() {
  this.status = 'ended';
  this.endedAt = new Date();
  this.callDuration = Math.floor((this.endedAt - this.startedAt) / 1000);
  return this.save();
};

// Instance method to sync browsing - update what everyone is viewing
liveCallSchema.methods.syncBrowsing = function(userId, browsingData = {}) {
  const {
    productId,
    scrollPosition = 0,
    searchQuery = '',
    filters = {},
    sortBy = 'relevance',
    sortOrder = 'desc',
    page = 1,
    totalPages = 1,
    totalProducts = 0
  } = browsingData;

  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  
  if (participant) {
    // Update participant's current view
    if (productId) participant.currentProductId = productId;
    participant.scrollPosition = scrollPosition;
    
    // Add to browsing history if product changed
    if (productId && productId !== participant.currentProductId) {
      participant.browsingHistory.push({
        productId,
        viewedAt: new Date()
      });
    }
    
    // Update session data (master view)
    if (productId) this.sessionData.currentProductId = productId;
    this.sessionData.scrollPosition = scrollPosition;
    this.sessionData.searchQuery = searchQuery;
    this.sessionData.sortBy = sortBy;
    this.sessionData.sortOrder = sortOrder;
    this.sessionData.currentPage = page;
    this.sessionData.totalPages = totalPages;
    this.sessionData.totalProducts = totalProducts;
    
    // Update active filters
    if (filters.category !== undefined) this.sessionData.activeFilters.category = filters.category;
    if (filters.subcategory !== undefined) this.sessionData.activeFilters.subcategory = filters.subcategory;
    if (filters.brand !== undefined) this.sessionData.activeFilters.brand = filters.brand;
    if (filters.priceRange) {
      this.sessionData.activeFilters.priceRange.min = filters.priceRange.min;
      this.sessionData.activeFilters.priceRange.max = filters.priceRange.max;
    }
    if (filters.ratingRange) {
      this.sessionData.activeFilters.ratingRange.min = filters.ratingRange.min;
      this.sessionData.activeFilters.ratingRange.max = filters.ratingRange.max;
    }
    if (filters.inStock !== undefined) this.sessionData.activeFilters.inStock = filters.inStock;
    
    // Add to session browsing history if product changed
    if (productId && productId !== this.sessionData.currentProductId) {
      this.sessionData.browsingHistory.push({
        productId,
        viewedAt: new Date(),
        viewedBy: userId
      });
    }
    
    // Update active browser
    const activeBrowser = this.sessionData.activeBrowsers.find(b => b.userId.toString() === userId.toString());
    if (activeBrowser) {
      activeBrowser.lastSeen = new Date();
    } else {
      this.sessionData.activeBrowsers.push({
        userId,
        lastSeen: new Date()
      });
    }
  }

  return this.save();
};

// Instance method to add cart update
liveCallSchema.methods.addCartUpdate = function(userId, productId, action = 'added') {
  // Add to cart updates
  this.sessionData.cartUpdates.push({
    userId,
    productId,
    action,
    timestamp: new Date()
  });

  return this.save();
};

// Instance method to get active participants
liveCallSchema.methods.getActiveParticipants = function() {
  return this.participants.filter(p => p.isActive && !p.leftAt);
};

// Instance method to get current browsing state
liveCallSchema.methods.getBrowsingState = function() {
  return {
    currentProductId: this.sessionData.currentProductId,
    scrollPosition: this.sessionData.scrollPosition,
    activeBrowsers: this.sessionData.activeBrowsers.length,
    recentCartUpdates: this.sessionData.cartUpdates.slice(-5) // Last 5 updates
  };
};

// Instance method to request control
liveCallSchema.methods.requestControl = function(userId, message = '') {
  // Check if user is already in control
  if (this.currentController.userId && this.currentController.userId.toString() === userId.toString()) {
    throw new Error('You already have control');
  }

  // Check if user already has pending request
  const existingRequest = this.controlRequests.find(req => 
    req.userId.toString() === userId.toString() && req.status === 'pending'
  );

  if (existingRequest) {
    throw new Error('You already have a pending control request');
  }

  // Add control request
  this.controlRequests.push({
    userId,
    message,
    requestedAt: new Date(),
    status: 'pending'
  });

  return this.save();
};

// Instance method to approve control request
liveCallSchema.methods.approveControlRequest = function(requestUserId, approverUserId) {
  // Check if approver is current controller or host
  const isCurrentController = this.currentController.userId && 
    this.currentController.userId.toString() === approverUserId.toString();
  const isHost = this.hostId.toString() === approverUserId.toString();

  if (!isCurrentController && !isHost) {
    throw new Error('Only current controller or host can approve control requests');
  }

  // Find and approve request
  const request = this.controlRequests.find(req => 
    req.userId.toString() === requestUserId.toString() && req.status === 'pending'
  );

  if (!request) {
    throw new Error('Control request not found');
  }

  request.status = 'approved';

  // Transfer control
  this.currentController = {
    userId: requestUserId,
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  };

  // Clear all pending requests
  this.controlRequests = this.controlRequests.filter(req => req.status !== 'pending');

  return this.save();
};

// Instance method to deny control request
liveCallSchema.methods.denyControlRequest = function(requestUserId, denierUserId) {
  // Check if denier is current controller or host
  const isCurrentController = this.currentController.userId && 
    this.currentController.userId.toString() === denierUserId.toString();
  const isHost = this.hostId.toString() === denierUserId.toString();

  if (!isCurrentController && !isHost) {
    throw new Error('Only current controller or host can deny control requests');
  }

  // Find and deny request
  const request = this.controlRequests.find(req => 
    req.userId.toString() === requestUserId.toString() && req.status === 'pending'
  );

  if (!request) {
    throw new Error('Control request not found');
  }

  request.status = 'denied';

  return this.save();
};

// Instance method to return control to host
liveCallSchema.methods.returnControlToHost = function() {
  this.currentController = {
    userId: this.hostId,
    startedAt: new Date(),
    expiresAt: null
  };

  // Clear all pending requests
  this.controlRequests = this.controlRequests.filter(req => req.status !== 'pending');

  return this.save();
};

// Instance method to check if control has expired
liveCallSchema.methods.checkControlExpiry = function() {
  if (this.currentController.expiresAt && new Date() > this.currentController.expiresAt) {
    this.returnControlToHost();
    return true; // Control was returned
  }
  return false; // Control still valid
};

// Instance method to get call status
liveCallSchema.methods.getCallStatus = function() {
  const now = new Date();
  const elapsed = Math.floor((now - this.duration.startTime) / 1000 / 60);
  const remaining = this.duration.maxDuration - elapsed;
  const canEnd = elapsed >= this.duration.minDuration;

  return {
    callId: this._id,
    participants: this.participants.length,
    currentController: this.currentController.userId,
    pendingRequests: this.controlRequests.filter(req => req.status === 'pending').length,
    duration: {
      elapsed,
      remaining,
      canEnd
    },
    status: this.status
  };
};

// Instance method to request master control
liveCallSchema.methods.requestMasterControl = function(userId) {
  // Check if user is already the controller
  if (this.masterControl.currentController.userId && 
      this.masterControl.currentController.userId.toString() === userId.toString()) {
    return { success: false, message: 'You already have control' };
  }

  // Check if user already has a pending request
  const existingRequest = this.masterControl.controlRequests.find(
    req => req.userId.toString() === userId.toString() && req.status === 'pending'
  );

  if (existingRequest) {
    return { success: false, message: 'You already have a pending request' };
  }

  // Add new control request
  this.masterControl.controlRequests.push({
    userId,
    requestedAt: new Date(),
    status: 'pending',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  });

  return this.save().then(() => ({ success: true, message: 'Control request sent' }));
};

// Instance method to approve control request
liveCallSchema.methods.approveControlRequest = function(requestUserId, approverUserId) {
  // Only host can approve requests
  if (this.hostId.toString() !== approverUserId.toString()) {
    return { success: false, message: 'Only the host can approve control requests' };
  }

  const request = this.masterControl.controlRequests.find(
    req => req.userId.toString() === requestUserId.toString() && req.status === 'pending'
  );

  if (!request) {
    return { success: false, message: 'No pending request found' };
  }

  // Update request status
  request.status = 'approved';

  // Transfer control
  this.masterControl.currentController = {
    userId: requestUserId,
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + this.masterControl.autoTransferAfter * 60 * 1000)
  };

  // Clear all other pending requests
  this.masterControl.controlRequests.forEach(req => {
    if (req.status === 'pending') {
      req.status = 'denied';
    }
  });

  return this.save().then(() => ({ success: true, message: 'Control transferred successfully' }));
};

// Instance method to deny control request
liveCallSchema.methods.denyControlRequest = function(requestUserId, denierUserId) {
  // Only host can deny requests
  if (this.hostId.toString() !== denierUserId.toString()) {
    return { success: false, message: 'Only the host can deny control requests' };
  }

  const request = this.masterControl.controlRequests.find(
    req => req.userId.toString() === requestUserId.toString() && req.status === 'pending'
  );

  if (!request) {
    return { success: false, message: 'No pending request found' };
  }

  request.status = 'denied';
  return this.save().then(() => ({ success: true, message: 'Control request denied' }));
};

// Instance method to release master control
liveCallSchema.methods.releaseMasterControl = function(userId) {
  if (!this.masterControl.currentController.userId || 
      this.masterControl.currentController.userId.toString() !== userId.toString()) {
    return { success: false, message: 'You are not the current controller' };
  }

  this.masterControl.currentController = {
    userId: null,
    startedAt: null,
    expiresAt: null
  };

  return this.save().then(() => ({ success: true, message: 'Control released' }));
};

// Instance method to transfer control to host
liveCallSchema.methods.transferControlToHost = function() {
  this.masterControl.currentController = {
    userId: this.hostId,
    startedAt: new Date(),
    expiresAt: null
  };

  // Clear all pending requests
  this.masterControl.controlRequests.forEach(req => {
    if (req.status === 'pending') {
      req.status = 'denied';
    }
  });

  return this.save();
};

// Static method to find active call for room
liveCallSchema.statics.findActiveCall = function(roomId) {
  return this.findOne({
    roomId,
    status: 'active'
  }).populate('participants.userId', 'name email profileImage');
};

// Static method to get call statistics
liveCallSchema.statics.getCallStats = function(userId, timeRange = 'week') {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    {
      $match: {
        $or: [
          { hostId: userId },
          { 'participants.userId': userId }
        ],
        startedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        totalDuration: { $sum: '$callDuration' },
        avgDuration: { $avg: '$callDuration' },
        callsHosted: {
          $sum: {
            $cond: [{ $eq: ['$hostId', userId] }, 1, 0]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('LiveCall', liveCallSchema);
