const express = require('express');
const { body, validationResult } = require('express-validator');
const Invitation = require('../models/Invitation');
const Room = require('../models/Room');
const User = require('../models/User');
const { authenticateToken, checkRoomPermission } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/invitations
// @desc    Get all invitations for current user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, room } = req.query;
    const userId = req.user._id;

    const invitations = await Invitation.findByUser(userId, { status, room });

    res.json({
      status: 'success',
      data: {
        invitations
      }
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/invitations/pending
// @desc    Get pending invitations for current user
// @access  Private
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const invitations = await Invitation.findPendingForUser(userId);

    res.json({
      status: 'success',
      data: {
        invitations
      }
    });
  } catch (error) {
    console.error('Get pending invitations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/invitations
// @desc    Send invitation to user
// @access  Private (Room Owner/Editor)
router.post('/', authenticateToken, [
  body('roomId')
    .notEmpty()
    .withMessage('Room ID is required'),
  body('inviteeId')
    .notEmpty()
    .withMessage('Invitee ID is required'),
  body('role')
    .optional()
    .isIn(['Editor', 'Contributor', 'Viewer'])
    .withMessage('Invalid role'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Message cannot be more than 200 characters'),
  body('expiresInDays')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Expiration must be between 1 and 30 days')
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

    const { roomId, inviteeId, role = 'Contributor', message, expiresInDays = 7 } = req.body;
    const inviterId = req.user._id;

    // Check if room exists and user has permission
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    // Check if user is owner or editor
    const isOwner = room.owner.toString() === inviterId.toString();
    const isEditor = room.members.some(member => 
      member.userId.toString() === inviterId.toString() && 
      member.role === 'Editor'
    );

    if (!isOwner && !isEditor) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to invite users to this room'
      });
    }

    // Check if invitee exists
    const invitee = await User.findById(inviteeId);
    if (!invitee) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const isAlreadyMember = room.members.some(member => 
      member.userId.toString() === inviteeId.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already a member of this room'
      });
    }

    // Check if user is the owner
    if (room.owner.toString() === inviteeId.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot invite room owner'
      });
    }

    // Create invitation
    const invitation = new Invitation({
      room: roomId,
      inviter: inviterId,
      invitee: inviteeId,
      role,
      message,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    });

    await invitation.save();

    // Add invitation to user's invitations array
    await User.findByIdAndUpdate(inviteeId, {
      $push: { invitations: invitation._id }
    });

    // Populate invitation data
    await invitation.populate('room', 'name emoji description isPrivate');
    await invitation.populate('inviter', 'name email profileImage');
    await invitation.populate('invitee', 'name email profileImage');

    res.status(201).json({
      status: 'success',
      message: 'Invitation sent successfully',
      data: {
        invitation
      }
    });
  } catch (error) {
    if (error.message === 'User already has a pending invitation for this room') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    console.error('Send invitation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/invitations/:id/accept
// @desc    Accept invitation
// @access  Private
router.put('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const invitationId = req.params.id;
    const userId = req.user._id;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        status: 'error',
        message: 'Invitation not found'
      });
    }

    // Check if invitation belongs to current user
    if (invitation.invitee.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only accept your own invitations'
      });
    }

    // Accept invitation
    await invitation.accept();

    // Remove invitation from user's invitations array
    await User.findByIdAndUpdate(userId, {
      $pull: { invitations: invitationId }
    });

    // Populate invitation data
    await invitation.populate('room', 'name emoji description isPrivate');
    await invitation.populate('inviter', 'name email profileImage');

    res.json({
      status: 'success',
      message: 'Invitation accepted successfully',
      data: {
        invitation
      }
    });
  } catch (error) {
    if (error.message === 'Invitation is not pending' || 
        error.message === 'Invitation has expired') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    console.error('Accept invitation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/invitations/:id/decline
// @desc    Decline invitation
// @access  Private
router.put('/:id/decline', authenticateToken, async (req, res) => {
  try {
    const invitationId = req.params.id;
    const userId = req.user._id;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        status: 'error',
        message: 'Invitation not found'
      });
    }

    // Check if invitation belongs to current user
    if (invitation.invitee.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only decline your own invitations'
      });
    }

    // Decline invitation
    await invitation.decline();

    // Remove invitation from user's invitations array
    await User.findByIdAndUpdate(userId, {
      $pull: { invitations: invitationId }
    });

    res.json({
      status: 'success',
      message: 'Invitation declined successfully'
    });
  } catch (error) {
    if (error.message === 'Invitation is not pending') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    console.error('Decline invitation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/invitations/:id
// @desc    Cancel invitation (inviter only)
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const invitationId = req.params.id;
    const userId = req.user._id;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        status: 'error',
        message: 'Invitation not found'
      });
    }

    // Check if user is the inviter
    if (invitation.inviter.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only cancel your own invitations'
      });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only cancel pending invitations'
      });
    }

    // Remove invitation from invitee's invitations array
    await User.findByIdAndUpdate(invitation.invitee, {
      $pull: { invitations: invitationId }
    });

    // Delete invitation
    await Invitation.findByIdAndDelete(invitationId);

    res.json({
      status: 'success',
      message: 'Invitation cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/invitations/cleanup
// @desc    Clean up expired invitations (admin only)
// @access  Private
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    // This could be restricted to admin users in production
    const result = await Invitation.cleanupExpired();

    res.json({
      status: 'success',
      message: 'Expired invitations cleaned up successfully',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Cleanup invitations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
