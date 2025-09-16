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
    const { page = 1, limit = 10, search } = req.query;
    const userId = req.user._id;

    let rooms;
    
    if (search) {
      rooms = await Room.searchRooms(search, userId);
    } else {
      rooms = await Room.findByUser(userId);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRooms = rooms.slice(startIndex, endIndex);

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
    console.error('Get rooms error:', error);
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
    const room = await Room.findById(req.params.roomId)
      .populate('owner', 'name email profileImage')
      .populate('members.userId', 'name email profileImage');

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        room,
        userRole: req.userRole
      }
    });
  } catch (error) {
    console.error('Get room error:', error);
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

    const { name, emoji, description, isPrivate = false, members = [] } = req.body;
    const ownerId = req.user._id;

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

    await room.save();

    // Update user stats
    await req.user.updateStats('roomsCreated');

    // Populate the room data
    await room.populate('owner', 'name email profileImage');
    await room.populate('members.userId', 'name email profileImage');

    res.status(201).json({
      status: 'success',
      message: 'Room created successfully',
      data: {
        room
      }
    });
  } catch (error) {
    console.error('Create room error:', error);
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
    const room = req.room;

    // Soft delete - set isActive to false
    room.isActive = false;
    await room.save();

    res.json({
      status: 'success',
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
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
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Add member to room
    await room.addMember(userId, role);

    // Populate the room data
    await room.populate('owner', 'name email profileImage');
    await room.populate('members.userId', 'name email profileImage');

    res.json({
      status: 'success',
      message: 'Member added successfully',
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
    
    console.error('Add member error:', error);
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