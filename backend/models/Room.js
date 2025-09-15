const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [50, 'Room name cannot be more than 50 characters']
  },
  emoji: {
    type: String,
    required: [true, 'Room emoji is required'],
    default: '👗'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
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
  lastMessage: {
    type: String,
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isLive: {
    type: Boolean,
    default: false
  },
  liveCallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveCall',
    default: null
  },
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    aiEnabled: {
      type: Boolean,
      default: true
    },
    voiceCallEnabled: {
      type: Boolean,
      default: true
    }
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  // Invitation fields
  invitationToken: {
    type: String,
    default: null
  },
  invitationRole: {
    type: String,
    enum: ['Editor', 'Contributor', 'Viewer'],
    default: null
  },
  invitationExpiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
roomSchema.index({ owner: 1 });
roomSchema.index({ 'members.userId': 1 });
roomSchema.index({ lastActivity: -1 });
roomSchema.index({ isActive: 1 });

// Virtual for member count
roomSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for checking if user is member
roomSchema.virtual('isMember').get(function() {
  return (userId) => {
    return this.members.some(member => member.userId.toString() === userId.toString());
  };
});

// Virtual for getting user role in room
roomSchema.virtual('getUserRole').get(function() {
  return (userId) => {
    const member = this.members.find(member => member.userId.toString() === userId.toString());
    return member ? member.role : null;
  };
});

// Pre-save middleware to add owner as member
roomSchema.pre('save', function(next) {
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
roomSchema.methods.addMember = function(userId, role = 'Contributor') {
  // Check if user is already a member
  const existingMember = this.members.find(member => member.userId.toString() === userId.toString());
  
  if (existingMember) {
    throw new Error('User is already a member of this room');
  }

  this.members.push({
    userId,
    role,
    joinedAt: new Date()
  });

  return this.save();
};

// Instance method to remove member
roomSchema.methods.removeMember = function(userId) {
  // Cannot remove owner
  if (this.owner.toString() === userId.toString()) {
    throw new Error('Cannot remove room owner');
  }

  this.members = this.members.filter(member => member.userId.toString() !== userId.toString());
  return this.save();
};

// Instance method to update member role
roomSchema.methods.updateMemberRole = function(userId, newRole) {
  // Cannot change owner role
  if (this.owner.toString() === userId.toString()) {
    throw new Error('Cannot change owner role');
  }

  const member = this.members.find(member => member.userId.toString() === userId.toString());
  if (!member) {
    throw new Error('User is not a member of this room');
  }

  member.role = newRole;
  return this.save();
};

// Instance method to update last activity
roomSchema.methods.updateLastActivity = function(message = null) {
  this.lastActivity = new Date();
  if (message) {
    this.lastMessage = message;
  }
  return this.save();
};

// Instance method to set live status
roomSchema.methods.setLiveStatus = function(isLive, callId = null) {
  this.isLive = isLive;
  this.liveCallId = callId;
  return this.save();
};

// Static method to find rooms by user
roomSchema.statics.findByUser = function(userId, options = {}) {
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

  return this.find(query)
    .populate('owner', 'name email profileImage')
    .populate('members.userId', 'name email profileImage')
    .sort({ lastActivity: -1 });
};

// Static method to search rooms
roomSchema.statics.searchRooms = function(searchTerm, userId = null) {
  const query = {
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ],
    isActive: true,
    isPrivate: false // Only search public rooms
  };

  // If user is provided, also include their private rooms
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
    .sort({ lastActivity: -1 });
};

// Instance method to generate invitation link
roomSchema.methods.generateInvitationLink = function(role = 'Contributor', expiresInHours = 24) {
  const crypto = require('crypto');
  const invitationToken = crypto.randomBytes(32).toString('hex');
  
  // Store invitation data
  this.invitationToken = invitationToken;
  this.invitationRole = role;
  this.invitationExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  
  // Generate invitation link
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const invitationLink = `${baseUrl}/join-room?token=${invitationToken}&roomId=${this._id}`;
  
  return {
    invitationLink,
    token: invitationToken,
    role: role,
    expiresAt: this.invitationExpiresAt,
    roomName: this.name,
    roomEmoji: this.emoji
  };
};

// Instance method to validate invitation token
roomSchema.methods.validateInvitationToken = function(token) {
  if (!this.invitationToken || !this.invitationExpiresAt) {
    return { valid: false, reason: 'No invitation token found' };
  }
  
  if (this.invitationToken !== token) {
    return { valid: false, reason: 'Invalid invitation token' };
  }
  
  if (new Date() > this.invitationExpiresAt) {
    return { valid: false, reason: 'Invitation token has expired' };
  }
  
  return { 
    valid: true, 
    role: this.invitationRole,
    roomName: this.name,
    roomEmoji: this.emoji
  };
};

// Instance method to join room via invitation
roomSchema.methods.joinViaInvitation = async function(userId, token) {
  const validation = this.validateInvitationToken(token);
  
  if (!validation.valid) {
    throw new Error(validation.reason);
  }
  
  // Check if user is already a member
  const existingMember = this.members.find(m => m.userId.toString() === userId.toString());
  if (existingMember) {
    throw new Error('User is already a member of this room');
  }
  
  // Add user as member
  await this.addMember(userId, validation.role);
  
  // Clear invitation token after successful join
  this.invitationToken = undefined;
  this.invitationRole = undefined;
  this.invitationExpiresAt = undefined;
  
  return this.save();
};

module.exports = mongoose.model('Room', roomSchema);
