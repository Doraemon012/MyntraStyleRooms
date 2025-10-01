const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Editor', 'Contributor', 'Viewer'],
    default: 'Contributor'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [200, 'Message cannot be more than 200 characters']
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration: 7 days from now
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  },
  respondedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
invitationSchema.index({ invitee: 1, status: 1 });
invitationSchema.index({ room: 1, status: 1 });
invitationSchema.index({ expiresAt: 1 });
invitationSchema.index({ createdAt: -1 });

// Virtual for checking if invitation is expired
invitationSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for checking if invitation is active (pending and not expired)
invitationSchema.virtual('isActive').get(function() {
  return this.status === 'pending' && !this.isExpired;
});

// Pre-save middleware to check for duplicates
invitationSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Check if there's already a pending invitation for this room and user
    const existingInvitation = await this.constructor.findOne({
      room: this.room,
      invitee: this.invitee,
      status: 'pending'
    });
    
    if (existingInvitation) {
      const error = new Error('User already has a pending invitation for this room');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

// Instance method to accept invitation
invitationSchema.methods.accept = async function() {
  if (this.status !== 'pending') {
    throw new Error('Invitation is not pending');
  }
  
  if (this.isExpired) {
    throw new Error('Invitation has expired');
  }
  
  this.status = 'accepted';
  this.respondedAt = new Date();
  
  // Add user to room
  const Room = require('./Room');
  const room = await Room.findById(this.room);
  if (!room) {
    throw new Error('Room not found');
  }
  
  await room.addMember(this.invitee, this.role);
  
  return this.save();
};

// Instance method to decline invitation
invitationSchema.methods.decline = async function() {
  if (this.status !== 'pending') {
    throw new Error('Invitation is not pending');
  }
  
  this.status = 'declined';
  this.respondedAt = new Date();
  
  return this.save();
};

// Instance method to expire invitation
invitationSchema.methods.expire = async function() {
  if (this.status !== 'pending') {
    throw new Error('Invitation is not pending');
  }
  
  this.status = 'expired';
  this.respondedAt = new Date();
  
  return this.save();
};

// Static method to find invitations for a user
invitationSchema.statics.findByUser = function(userId, options = {}) {
  const query = { invitee: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.room) {
    query.room = options.room;
  }
  
  return this.find(query)
    .populate('room', 'name emoji description isPrivate')
    .populate('inviter', 'name email profileImage')
    .populate('invitee', 'name email profileImage')
    .sort({ createdAt: -1 });
};

// Static method to find pending invitations for a user
invitationSchema.statics.findPendingForUser = function(userId) {
  return this.find({
    invitee: userId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  })
    .populate({
      path: 'room',
      select: 'name emoji description isPrivate members',
      populate: {
        path: 'members.userId',
        select: 'name email profileImage'
      }
    })
    .populate('inviter', 'name email profileImage')
    .sort({ createdAt: -1 });
};

// Static method to clean up expired invitations
invitationSchema.statics.cleanupExpired = async function() {
  const result = await this.updateMany(
    {
      status: 'pending',
      expiresAt: { $lt: new Date() }
    },
    {
      $set: {
        status: 'expired',
        respondedAt: new Date()
      }
    }
  );
  
  return result;
};

module.exports = mongoose.model('Invitation', invitationSchema);
