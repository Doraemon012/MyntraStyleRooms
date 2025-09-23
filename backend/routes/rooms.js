const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const User = require('../models/User');
const { authenticateToken, checkRoomPermission } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all rooms for current user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('\n📋 === FETCHING USER ROOMS ===');
    console.log('👤 User:', req.user.name, `(${req.user.email})`);
    
    const { page = 1, limit = 10, search } = req.query;
    const userId = req.user._id;

    console.log('🔍 Query params:', { page, limit, search: search || 'none' });

    let rooms;
    
    if (search) {
      console.log('🔎 Searching rooms with term:', search);
      rooms = await Room.searchRooms(search, userId);
    } else {
      console.log('📂 Getting all user rooms');
      rooms = await Room.findByUser(userId);
    }

    console.log('✅ Found', rooms.length, 'rooms');
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRooms = rooms.slice(startIndex, endIndex);

    console.log('📄 Returning', paginatedRooms.length, 'rooms (page', page, ')');
    console.log('📋 === ROOMS FETCH COMPLETE ===\n');

    res.json({
      status: 'success',
      data: {
        rooms: paginatedRooms,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(rooms.length / limit),
          totalRooms: rooms.length,
          hasNext: endIndex < rooms.length,
          hasPrev: startIndex > 0
        }
      }
    });
  } catch (error) {
    console.error('\n❌ === ROOMS FETCH FAILED ===');
    console.error('👤 User:', req.user?.name || 'Unknown');
    console.error('🚨 Error:', error);
    console.error('❌ === ROOMS FETCH FAILED ===\n');
    
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get single room by ID
// @access  Private
router.get('/:roomId', authenticateToken, checkRoomPermission('Viewer'), async (req, res) => {
  try {
    console.log('\n🏠 === FETCHING SINGLE ROOM ===');
    console.log('🏠 Room ID:', req.params.roomId);
    console.log('👤 Requested by:', req.user.name);
    console.log('🎭 User Role:', req.userRole);

    const room = await Room.findById(req.params.roomId)
      .populate('owner', 'name email profileImage')
      .populate('members.userId', 'name email profileImage');

    if (!room) {
      console.log('❌ Room not found:', req.params.roomId);
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    console.log('✅ Room found:', room.name);
    console.log('📊 Member count:', room.memberCount);
    console.log('🏠 === ROOM FETCH COMPLETE ===\n');

    res.json({
      status: 'success',
      data: {
        room,
        userRole: req.userRole
      }
    });
  } catch (error) {
    console.error('\n❌ === SINGLE ROOM FETCH FAILED ===');
    console.error('🏠 Room ID:', req.params.roomId);
    console.error('👤 Requested by:', req.user?.name || 'Unknown');
    console.error('🚨 Error:', error);
    console.error('❌ === SINGLE ROOM FETCH FAILED ===\n');
    
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private
router.post('/', authenticateToken, [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Room name must be between 2 and 50 characters'),
  body('emoji')
    .notEmpty()
    .withMessage('Room emoji is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot be more than 200 characters')
], async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('\n🏠 === ROOM CREATION REQUEST ===');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('👤 User:', req.user.name, `(${req.user.email})`);
    console.log('📝 Request Body:', JSON.stringify(req.body, null, 2));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, emoji, description, isPrivate = false, members = [] } = req.body;
    const ownerId = req.user._id;

    console.log('✅ Validation passed');
    console.log('🏠 Creating room with:');
    console.log('  - Name:', name);
    console.log('  - Emoji:', emoji);
    console.log('  - Description:', description || 'No description');
    console.log('  - Private:', isPrivate);
    console.log('  - Owner ID:', ownerId);
    console.log('  - Initial Members:', members.length);

    // Create room
    const room = new Room({
      name,
      emoji,
      description,
      isPrivate,
      owner: ownerId,
      members: members.map(member => ({
        userId: member.userId,
        role: member.role || 'Contributor'
      }))
    });

    console.log('💾 Saving room to database...');
    await room.save();
    console.log('✅ Room saved with ID:', room._id);

    // Update user stats
    console.log('📊 Updating user stats...');
    await req.user.updateStats('roomsCreated');
    console.log('✅ User stats updated');

    // Populate the room data
    console.log('🔄 Populating room data...');
    await room.populate('owner', 'name email profileImage');
    await room.populate('members.userId', 'name email profileImage');
    console.log('✅ Room data populated');

    const duration = Date.now() - startTime;
    console.log('⏱️ Room creation completed in:', duration + 'ms');
    console.log('🎉 Room created successfully:', {
      id: room._id,
      name: room.name,
      memberCount: room.memberCount,
      owner: room.owner.name
    });
    console.log('🏠 === ROOM CREATION COMPLETE ===\n');

    res.status(201).json({
      status: 'success',
      message: 'Room created successfully',
      data: {
        room
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('\n❌ === ROOM CREATION FAILED ===');
    console.error('📅 Timestamp:', new Date().toISOString());
    console.error('👤 User:', req.user?.name || 'Unknown', `(${req.user?.email || 'Unknown'})`);
    console.error('⏱️ Failed after:', duration + 'ms');
    console.error('🚨 Error Details:', error);
    console.error('📋 Stack Trace:', error.stack);
    console.error('❌ === ROOM CREATION FAILED ===\n');
    
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private (Owner or Editor)
router.put('/:id', authenticateToken, checkRoomPermission('Editor'), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Room name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot be more than 200 characters')
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

    const { name, emoji, description, isPrivate, settings } = req.body;
    const room = req.room;

    // Update fields
    if (name !== undefined) room.name = name;
    if (emoji !== undefined) room.emoji = emoji;
    if (description !== undefined) room.description = description;
    if (isPrivate !== undefined) room.isPrivate = isPrivate;
    if (settings !== undefined) room.settings = { ...room.settings, ...settings };

    await room.save();

    // Populate the room data
    await room.populate('owner', 'name email profileImage');
    await room.populate('members.userId', 'name email profileImage');

    res.json({
      status: 'success',
      message: 'Room updated successfully',
      data: {
        room
      }
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private (Owner only)
router.delete('/:id', authenticateToken, checkRoomPermission('Owner'), async (req, res) => {
  try {
    console.log('\n🗑️ === DELETING ROOM ===');
    console.log('🏠 Room ID:', req.params.id);
    console.log('👤 Requested by:', req.user.name);
    
    const room = req.room;
    console.log('🏠 Room to delete:', room.name);
    console.log('📊 Members:', room.memberCount);

    // Soft delete - set isActive to false
    room.isActive = false;
    await room.save();

    console.log('✅ Room soft deleted successfully');
    console.log('🗑️ === ROOM DELETION COMPLETE ===\n');

    res.json({
      status: 'success',
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('\n❌ === ROOM DELETION FAILED ===');
    console.error('🏠 Room ID:', req.params.id);
    console.error('👤 Requested by:', req.user?.name || 'Unknown');
    console.error('🚨 Error:', error);
    console.error('❌ === ROOM DELETION FAILED ===\n');
    
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/rooms/:id/members
// @desc    Add member to room
// @access  Private (Owner or Editor)
router.post('/:roomId/members', authenticateToken, checkRoomPermission('Editor'), [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('role')
    .optional()
    .isIn(['Editor', 'Contributor', 'Viewer'])
    .withMessage('Invalid role')
], async (req, res) => {
  try {
    console.log('\n👥 === ADDING MEMBER TO ROOM ===');
    console.log('🏠 Room ID:', req.params.roomId);
    console.log('👤 Requested by:', req.user.name);
    console.log('➕ Adding user:', req.body.userId);
    console.log('🎭 Role:', req.body.role || 'Contributor');

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, role = 'Contributor' } = req.body;
    const room = req.room;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    console.log('✅ User found:', user.name, `(${user.email})`);

    // Add member to room
    await room.addMember(userId, role);
    console.log('✅ Member added successfully');

    // Populate the room data
    await room.populate('owner', 'name email profileImage');
    await room.populate('members.userId', 'name email profileImage');

    console.log('📊 Room now has', room.memberCount, 'members');
    console.log('👥 === MEMBER ADDITION COMPLETE ===\n');

    res.json({
      status: 'success',
      message: 'Member added successfully',
      data: {
        room
      }
    });
  } catch (error) {
    console.error('\n❌ === MEMBER ADDITION FAILED ===');
    console.error('🏠 Room ID:', req.params.roomId);
    console.error('👤 Requested by:', req.user?.name || 'Unknown');
    console.error('🚨 Error:', error.message);
    console.error('❌ === MEMBER ADDITION FAILED ===\n');
    
    if (error.message === 'User is already a member of this room') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/rooms/:id/members/:memberId
// @desc    Update member role
// @access  Private (Owner only)
router.put('/:id/members/:memberId', authenticateToken, checkRoomPermission('Owner'), [
  body('role')
    .isIn(['Editor', 'Contributor', 'Viewer'])
    .withMessage('Invalid role')
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

    const { role } = req.body;
    const { memberId } = req.params;
    const room = req.room;

    // Update member role
    await room.updateMemberRole(memberId, role);

    // Populate the room data
    await room.populate('owner', 'name email profileImage');
    await room.populate('members.userId', 'name email profileImage');

    res.json({
      status: 'success',
      message: 'Member role updated successfully',
      data: {
        room
      }
    });
  } catch (error) {
    if (error.message === 'User is not a member of this room' || 
        error.message === 'Cannot change owner role') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    console.error('Update member role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/rooms/:id/members/:memberId
// @desc    Remove member from room
// @access  Private (Owner or Editor)
router.delete('/:id/members/:memberId', authenticateToken, checkRoomPermission('Editor'), async (req, res) => {
  try {
    const { memberId } = req.params;
    const room = req.room;

    // Remove member from room
    await room.removeMember(memberId);

    // Populate the room data
    await room.populate('owner', 'name email profileImage');
    await room.populate('members.userId', 'name email profileImage');

    res.json({
      status: 'success',
      message: 'Member removed successfully',
      data: {
        room
      }
    });
  } catch (error) {
    if (error.message === 'Cannot remove room owner') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    console.error('Remove member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/rooms/:id/join
// @desc    Join room (for public rooms)
// @access  Private
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    if (room.isPrivate) {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot join private room without invitation'
      });
    }

    // Add user as member
    await room.addMember(req.user._id, 'Contributor');

    // Populate the room data
    await room.populate('owner', 'name email profileImage');
    await room.populate('members.userId', 'name email profileImage');

    res.json({
      status: 'success',
      message: 'Joined room successfully',
      data: {
        room
      }
    });
  } catch (error) {
    if (error.message === 'User is already a member of this room') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    console.error('Join room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/rooms/:id/leave
// @desc    Leave room
// @access  Private
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    // Cannot leave if you're the owner
    if (room.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Room owner cannot leave. Transfer ownership or delete the room.'
      });
    }

    // Remove user from room
    await room.removeMember(req.user._id);

    res.json({
      status: 'success',
      message: 'Left room successfully'
    });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/rooms/:roomId/ai-toggle
// @desc    Toggle AI stylist on/off (Owner only)
// @access  Private
router.put('/:roomId/ai-toggle', authenticateToken, checkRoomPermission('Owner'), [
  body('aiEnabled')
    .isBoolean()
    .withMessage('AI enabled status must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { aiEnabled } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    // Update AI setting
    room.settings.aiEnabled = aiEnabled;
    await room.save();

    res.json({
      status: 'success',
      message: `AI stylist ${aiEnabled ? 'enabled' : 'disabled'} successfully`,
      data: {
        room: {
          id: room._id,
          name: room.name,
          aiEnabled: room.settings.aiEnabled
        }
      }
    });
  } catch (error) {
    console.error('AI toggle error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/rooms/:roomId/generate-invitation
// @desc    Generate invitation link for room (Owner/Editor only)
// @access  Private
router.post('/:roomId/generate-invitation', authenticateToken, checkRoomPermission('Editor'), [
  body('role')
    .optional()
    .isIn(['Editor', 'Contributor', 'Viewer'])
    .withMessage('Invalid role'),
  body('expiresInHours')
    .optional()
    .isInt({ min: 1, max: 168 }) // 1 hour to 1 week
    .withMessage('Expiration must be between 1 and 168 hours')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role = 'Contributor', expiresInHours = 24 } = req.body;
    const room = req.room;

    // Generate invitation link
    const invitationData = room.generateInvitationLink(role, expiresInHours);
    await room.save();

    res.json({
      status: 'success',
      message: 'Invitation link generated successfully',
      data: {
        invitationLink: invitationData.invitationLink,
        token: invitationData.token,
        role: invitationData.role,
        expiresAt: invitationData.expiresAt,
        roomName: invitationData.roomName,
        roomEmoji: invitationData.roomEmoji,
        copyToClipboard: invitationData.invitationLink // For frontend to copy
      }
    });
  } catch (error) {
    console.error('Generate invitation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/rooms/:roomId/join-invitation
// @desc    Join room via invitation link
// @access  Private
router.post('/:roomId/join-invitation', authenticateToken, [
  body('token')
    .notEmpty()
    .withMessage('Invitation token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token } = req.body;
    const userId = req.user._id;
    
    // Find the room
    const Room = require('../models/Room');
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    // Join room via invitation
    await room.joinViaInvitation(userId, token);

    // Populate room data
    await room.populate('owner', 'name email profileImage');
    await room.populate('members.userId', 'name email profileImage');

    res.json({
      status: 'success',
      message: 'Successfully joined room via invitation',
      data: {
        room
      }
    });
  } catch (error) {
    console.error('Join invitation error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;