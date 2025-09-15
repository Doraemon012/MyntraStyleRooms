const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'call_invitation',
      'call_started',
      'call_joined',
      'call_ended',
      'control_request',
      'control_approved',
      'control_denied',
      'cart_update',
      'wardrobe_update'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    callId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveCall'
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    wardrobeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wardrobe'
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    additionalData: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create call invitation notification
notificationSchema.statics.createCallInvitation = function(userId, callId, roomId, hostName, roomName) {
  return this.create({
    userId,
    type: 'call_invitation',
    title: 'Shopping Call Started',
    message: `${hostName} started a shopping call in ${roomName}`,
    data: {
      callId,
      roomId,
      additionalData: {
        hostName,
        roomName
      }
    },
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  });
};

// Static method to create control request notification
notificationSchema.statics.createControlRequest = function(userId, callId, requesterName) {
  return this.create({
    userId,
    type: 'control_request',
    title: 'Control Request',
    message: `${requesterName} wants to show you something`,
    data: {
      callId,
      additionalData: {
        requesterName
      }
    },
    expiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
  });
};

// Static method to create cart update notification
notificationSchema.statics.createCartUpdate = function(userId, callId, productName, userName, action = 'added') {
  return this.create({
    userId,
    type: 'cart_update',
    title: 'Cart Update',
    message: `${userName} ${action} ${productName} to cart`,
    data: {
      callId,
      additionalData: {
        productName,
        userName,
        action
      }
    },
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  });
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, limit = 20, offset = 0) {
  return this.find({
    userId,
    expiresAt: { $gt: new Date() } // Only non-expired notifications
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(offset)
  .populate('data.callId', 'roomId hostId status')
  .populate('data.roomId', 'name emoji')
  .populate('data.productId', 'name price images')
  .populate('data.fromUserId', 'name profileImage');
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);
