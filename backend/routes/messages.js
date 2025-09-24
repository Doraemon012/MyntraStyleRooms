const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Room = require('../models/Room');
const { authenticateToken, checkRoomPermission } = require('../middleware/auth');
const router = express.Router();


// @route   GET /api/messages/:roomId
// @desc    Get messages for a room
// @access  Private
router.get('/:roomId', authenticateToken, checkRoomPermission('Viewer'), async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50, before, after } = req.query;

    const messages = await Message.getRoomMessages(roomId, {
      page: parseInt(page),
      limit: parseInt(limit),
      before,
      after
    });

    res.json({
      status: 'success',
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasMore: messages.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/messages/:roomId
// @desc    Send message to room
// @access  Private
router.post('/:roomId', authenticateToken, checkRoomPermission('Contributor'), [
  body('text')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'product', 'image', 'voice'])
    .withMessage('Invalid message type'),
  body('productData')
    .optional()
    .isObject()
    .withMessage('Product data must be an object'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid reply message ID')
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

    const { roomId } = req.params;
    const { text, messageType = 'text', productData, replyTo } = req.body;
    const senderId = req.user._id;

    // Get room to check AI settings
    const room = await Room.findById(roomId);

    // Validate message content based on type
    if (messageType === 'text' && !text) {
      return res.status(400).json({
        status: 'error',
        message: 'Text is required for text messages'
      });
    }

    if (messageType === 'product' && !productData) {
      return res.status(400).json({
        status: 'error',
        message: 'Product data is required for product messages'
      });
    }

    // Create message
    const message = new Message({
      roomId,
      senderId,
      senderType: 'user',
      text,
      messageType,
      productData,
      replyTo,
      timestamp: new Date()
    });

    await message.save();

    // Populate message data
    await message.populate('senderId', 'name email profileImage');
    if (productData && productData.productId) {
      await message.populate('productData.productId');
    }
    if (replyTo) {
      await message.populate('replyTo');
    }

    // Emit to socket.io clients in the room
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('new-message', {
        message,
        roomId
      });
    }


    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/messages/:id
// @desc    Edit message
// @access  Private
router.put('/:id', authenticateToken, [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
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

    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only edit your own messages'
      });
    }

    // Check if message is too old (e.g., 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.timestamp < fifteenMinutesAgo) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot edit messages older than 15 minutes'
      });
    }

    // Update message
    message.text = text;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    // Populate message data
    await message.populate('senderId', 'name email profileImage');

    // Emit to socket.io clients in the room
    const io = req.app.get('io');
    if (io) {
      io.to(message.roomId.toString()).emit('message-edited', {
        message,
        roomId: message.roomId
      });
    }

    res.json({
      status: 'success',
      message: 'Message edited successfully',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Check if user is the sender or has permission to delete
    const room = await Room.findById(message.roomId);
    const isOwner = room.owner.toString() === userId.toString();
    const isSender = message.senderId.toString() === userId.toString();
    const isEditor = room.members.find(m => 
      m.userId.toString() === userId.toString() && 
      ['Owner', 'Editor'].includes(m.role)
    );

    if (!isSender && !isOwner && !isEditor) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this message'
      });
    }

    // Soft delete message
    await message.softDelete();

    // Emit to socket.io clients in the room
    const io = req.app.get('io');
    if (io) {
      io.to(message.roomId.toString()).emit('message-deleted', {
        messageId: id,
        roomId: message.roomId
      });
    }

    res.json({
      status: 'success',
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/messages/:id/reactions
// @desc    Add reaction to message
// @access  Private
router.post('/:id/reactions', authenticateToken, [
  body('type')
    .isIn(['like', 'love', 'laugh', 'wow', 'sad', 'angry'])
    .withMessage('Invalid reaction type')
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

    const { id } = req.params;
    const { type } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Check if user has permission to react (must be room member)
    const room = await Room.findById(message.roomId);
    const isMember = room.members.some(m => m.userId.toString() === userId.toString());
    const isOwner = room.owner.toString() === userId.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'You must be a room member to react to messages'
      });
    }

    // Add reaction
    await message.addReaction(userId, type);

    // Populate message data
    await message.populate('senderId', 'name email profileImage');

    // Emit to socket.io clients in the room
    const io = req.app.get('io');
    if (io) {
      io.to(message.roomId.toString()).emit('message-reaction', {
        message,
        roomId: message.roomId
      });
    }

    res.json({
      status: 'success',
      message: 'Reaction added successfully',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/messages/:id/reactions
// @desc    Remove reaction from message
// @access  Private
router.delete('/:id/reactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Remove reaction
    await message.removeReaction(userId);

    // Populate message data
    await message.populate('senderId', 'name email profileImage');

    // Emit to socket.io clients in the room
    const io = req.app.get('io');
    if (io) {
      io.to(message.roomId.toString()).emit('message-reaction', {
        message,
        roomId: message.roomId
      });
    }

    res.json({
      status: 'success',
      message: 'Reaction removed successfully',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Check if user has permission to read (must be room member)
    const room = await Room.findById(message.roomId);
    const isMember = room.members.some(m => m.userId.toString() === userId.toString());
    const isOwner = room.owner.toString() === userId.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'You must be a room member to read messages'
      });
    }

    // Mark as read
    await message.markAsRead(userId);

    res.json({
      status: 'success',
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/messages/:roomId/share-product
// @desc    Share a product/outfit in room chat
// @access  Private
router.post('/:roomId/share-product', authenticateToken, checkRoomPermission('Contributor'), [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot be more than 500 characters')
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

    const { productId, message } = req.body;
    const { roomId } = req.params;
    const userId = req.user._id;

    // Get product details
    const Product = require('../models/Product');
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Create message with product data
    const newMessage = new Message({
      roomId,
      senderId: userId,
      senderType: 'user',
      messageType: 'product',
      text: message || `Check out this ${product.name}!`,
      productData: {
        name: product.name,
        price: `₹${product.price}`,
        image: product.primaryImage,
        productId: product._id,
        brand: product.brand,
        category: product.category
      }
    });

    await newMessage.save();

    // Populate sender info
    await newMessage.populate('senderId', 'name email profileImage');

    // Update room's last message and activity
    const Room = require('../models/Room');
    await Room.findByIdAndUpdate(roomId, {
      lastMessage: `Shared: ${product.name}`,
      lastActivity: new Date()
    });

    // Emit to socket.io clients
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('new-message', {
        message: newMessage,
        roomId
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Product shared successfully',
      data: {
        message: newMessage
      }
    });
  } catch (error) {
    console.error('Share product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
