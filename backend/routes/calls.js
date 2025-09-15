const express = require('express');
const { body, validationResult } = require('express-validator');
const LiveCall = require('../models/LiveCall');
const Room = require('../models/Room');
const WardrobeItem = require('../models/WardrobeItem');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const Wardrobe = require('../models/Wardrobe');
const { authenticateToken, checkRoomPermission } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/calls/:roomId/start
// @desc    Start a live call in room
// @access  Private
router.post('/:roomId/start', authenticateToken, checkRoomPermission('Contributor'), async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    // Check if there's already an active call
    const existingCall = await LiveCall.findActiveCall(roomId);
    if (existingCall) {
      return res.status(400).json({
        status: 'error',
        message: 'A call is already active in this room'
      });
    }

    // Create new live call
    const liveCall = new LiveCall({
      roomId,
      hostId: userId,
      participants: [{
        userId,
        joinedAt: new Date()
      }]
    });

    await liveCall.save();

    // Populate call data
    await liveCall.populate('participants.userId', 'name email profileImage');
    await liveCall.populate('hostId', 'name email profileImage');

    // Emit to socket.io clients
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('call-started', {
        call: liveCall,
        roomId
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Call started successfully',
      data: {
        call: liveCall
      }
    });
  } catch (error) {
    console.error('Start call error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/calls/:callId/join
// @desc    Join a live call
// @access  Private
router.post('/:callId/join', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const { connectionId } = req.body;
    const userId = req.user._id;

    const liveCall = await LiveCall.findById(callId);
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    if (liveCall.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Call is not active'
      });
    }

    // Check if room has reached max participants
    if (liveCall.activeParticipantsCount >= liveCall.settings.maxParticipants) {
      return res.status(400).json({
        status: 'error',
        message: 'Call has reached maximum participants'
      });
    }

    // Add participant to call
    await liveCall.addParticipant(userId, connectionId);

    // Populate call data
    await liveCall.populate('participants.userId', 'name email profileImage');

    // Emit to socket.io clients
    const io = req.app.get('io');
    if (io) {
      io.to(liveCall.roomId.toString()).emit('user-joined-call', {
        call: liveCall,
        userId,
        roomId: liveCall.roomId
      });
    }

    res.json({
      status: 'success',
      message: 'Joined call successfully',
      data: {
        call: liveCall
      }
    });
  } catch (error) {
    console.error('Join call error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/calls/:callId/leave
// @desc    Leave a live call
// @access  Private
router.post('/:callId/leave', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    const liveCall = await LiveCall.findById(callId);
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    // Remove participant from call
    await liveCall.removeParticipant(userId);

    // If host leaves and there are other participants, transfer host
    if (liveCall.hostId.toString() === userId.toString() && liveCall.activeParticipantsCount > 0) {
      const nextHost = liveCall.participants.find(p => !p.leftAt && p.userId.toString() !== userId.toString());
      if (nextHost) {
        liveCall.hostId = nextHost.userId;
        await liveCall.save();
      }
    }

    // If no participants left, end the call
    if (liveCall.activeParticipantsCount === 0) {
      await liveCall.endCall();
    }

    // Populate call data
    await liveCall.populate('participants.userId', 'name email profileImage');

    // Emit to socket.io clients
    const io = req.app.get('io');
    if (io) {
      io.to(liveCall.roomId.toString()).emit('user-left-call', {
        call: liveCall,
        userId,
        roomId: liveCall.roomId
      });
    }

    res.json({
      status: 'success',
      message: 'Left call successfully',
      data: {
        call: liveCall
      }
    });
  } catch (error) {
    console.error('Leave call error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/calls/:callId/end
// @desc    End a live call
// @access  Private (Host only)
router.post('/:callId/end', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    const liveCall = await LiveCall.findById(callId);
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    // Check if user is the host
    if (liveCall.hostId.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the host can end the call'
      });
    }

    // End the call
    await liveCall.endCall();

    // Emit to socket.io clients
    const io = req.app.get('io');
    if (io) {
      io.to(liveCall.roomId.toString()).emit('call-ended', {
        call: liveCall,
        roomId: liveCall.roomId
      });
    }

    res.json({
      status: 'success',
      message: 'Call ended successfully',
      data: {
        call: liveCall
      }
    });
  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/calls/:callId/participant/:userId/status
// @desc    Update participant status (mute/unmute, speaking)
// @access  Private
router.put('/:callId/participant/:userId/status', authenticateToken, [
  body('isMuted')
    .optional()
    .isBoolean()
    .withMessage('isMuted must be a boolean'),
  body('isSpeaking')
    .optional()
    .isBoolean()
    .withMessage('isSpeaking must be a boolean')
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

    const { callId, userId } = req.params;
    const { isMuted, isSpeaking } = req.body;
    const currentUserId = req.user._id;

    const liveCall = await LiveCall.findById(callId);
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    // Users can only update their own status
    if (userId !== currentUserId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update your own status'
      });
    }

    // Update participant status
    const updates = {};
    if (isMuted !== undefined) updates.isMuted = isMuted;
    if (isSpeaking !== undefined) updates.isSpeaking = isSpeaking;

    await liveCall.updateParticipantStatus(userId, updates);

    // Populate call data
    await liveCall.populate('participants.userId', 'name email profileImage');

    // Emit to socket.io clients
    const io = req.app.get('io');
    if (io) {
      io.to(liveCall.roomId.toString()).emit('participant-status-updated', {
        call: liveCall,
        userId,
        updates,
        roomId: liveCall.roomId
      });
    }

    res.json({
      status: 'success',
      message: 'Participant status updated successfully',
      data: {
        call: liveCall
      }
    });
  } catch (error) {
    console.error('Update participant status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/calls/:callId/wardrobe-items
// @desc    Add wardrobe item to call
// @access  Private
router.post('/:callId/wardrobe-items', authenticateToken, [
  body('itemId')
    .isMongoId()
    .withMessage('Valid item ID is required')
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

    const { callId } = req.params;
    const { itemId } = req.body;

    const liveCall = await LiveCall.findById(callId);
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    // Check if item exists
    const wardrobeItem = await WardrobeItem.findById(itemId).populate('productId');
    if (!wardrobeItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Wardrobe item not found'
      });
    }

    // Add wardrobe item to call
    await liveCall.addWardrobeItem(itemId);

    // Populate call data
    await liveCall.populate('wardrobeItems');

    // Emit to socket.io clients
    const io = req.app.get('io');
    if (io) {
      io.to(liveCall.roomId.toString()).emit('wardrobe-item-added', {
        call: liveCall,
        item: wardrobeItem,
        roomId: liveCall.roomId
      });
    }

    res.json({
      status: 'success',
      message: 'Wardrobe item added to call successfully',
      data: {
        call: liveCall,
        item: wardrobeItem
      }
    });
  } catch (error) {
    console.error('Add wardrobe item to call error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/calls/:callId/wardrobe-items/:itemId
// @desc    Remove wardrobe item from call
// @access  Private
router.delete('/:callId/wardrobe-items/:itemId', authenticateToken, async (req, res) => {
  try {
    const { callId, itemId } = req.params;

    const liveCall = await LiveCall.findById(callId);
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    // Remove wardrobe item from call
    await liveCall.removeWardrobeItem(itemId);

    // Emit to socket.io clients
    const io = req.app.get('io');
    if (io) {
      io.to(liveCall.roomId.toString()).emit('wardrobe-item-removed', {
        call: liveCall,
        itemId,
        roomId: liveCall.roomId
      });
    }

    res.json({
      status: 'success',
      message: 'Wardrobe item removed from call successfully',
      data: {
        call: liveCall
      }
    });
  } catch (error) {
    console.error('Remove wardrobe item from call error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/calls/:callId
// @desc    Get call details
// @access  Private
router.get('/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;

    const liveCall = await LiveCall.findById(callId)
      .populate('participants.userId', 'name email profileImage')
      .populate('hostId', 'name email profileImage')
      .populate('wardrobeItems');

    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        call: liveCall
      }
    });
  } catch (error) {
    console.error('Get call error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/calls/stats
// @desc    Get call statistics for user
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const userId = req.user._id;

    const stats = await LiveCall.getCallStats(userId, timeRange);

    res.json({
      status: 'success',
      data: {
        stats: stats[0] || {
          totalCalls: 0,
          totalDuration: 0,
          avgDuration: 0,
          callsHosted: 0
        },
        timeRange
      }
    });
  } catch (error) {
    console.error('Get call stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/calls/:callId/sync-browse
// @desc    Sync browsing - update what everyone is viewing (enhanced with search, filters, sort)
// @access  Private
router.post('/:callId/sync-browse', authenticateToken, [
  body('productId')
    .optional()
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('scrollPosition')
    .optional()
    .isNumeric()
    .withMessage('Scroll position must be a number'),
  body('searchQuery')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Search query must be a string with max 200 characters'),
  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object'),
  body('sortBy')
    .optional()
    .isIn(['relevance', 'price', 'popularity', 'rating', 'newest'])
    .withMessage('Sort by must be one of: relevance, price, popularity, rating, newest'),
  body('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  body('totalPages')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total pages must be a positive integer'),
  body('totalProducts')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total products must be a non-negative integer')
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

    const { callId } = req.params;
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
    } = req.body;
    const userId = req.user._id;

    const liveCall = await LiveCall.findById(callId);
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call session not found'
      });
    }

    // Check if user is participant
    const participant = liveCall.participants.find(p => p.userId.toString() === userId.toString());
    if (!participant) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a participant in this call'
      });
    }

    // Enhanced browsing data
    const browsingData = {
      productId,
      scrollPosition,
      searchQuery,
      filters,
      sortBy,
      sortOrder,
      page,
      totalPages,
      totalProducts
    };

    // Sync browsing with enhanced data
    await liveCall.syncBrowsing(userId, browsingData);

    // Emit to all participants via Socket.io with enhanced data
    req.app.get('io').to(`call-${callId}`).emit('call:browse-update', {
      userId,
      productId,
      scrollPosition,
      searchQuery,
      filters,
      sortBy,
      sortOrder,
      page,
      totalPages,
      totalProducts,
      timestamp: new Date()
    });

    res.json({
      status: 'success',
      message: 'Browsing synced successfully',
      data: {
        currentProductId: productId,
        scrollPosition,
        searchQuery,
        filters: liveCall.sessionData.activeFilters,
        sortBy: liveCall.sessionData.sortBy,
        sortOrder: liveCall.sessionData.sortOrder,
        currentPage: liveCall.sessionData.currentPage,
        totalPages: liveCall.sessionData.totalPages,
        totalProducts: liveCall.sessionData.totalProducts,
        activeBrowsers: liveCall.sessionData.activeBrowsers.length
      }
    });
  } catch (error) {
    console.error('Sync browsing error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/calls/:callId/add-to-cart
// @desc    Add product to cart during call - notify all participants
// @access  Private
router.post('/:callId/add-to-cart', authenticateToken, [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('action')
    .optional()
    .isIn(['added', 'removed'])
    .withMessage('Action must be added or removed')
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

    const { callId } = req.params;
    const { productId, action = 'added' } = req.body;
    const userId = req.user._id;

    const liveCall = await LiveCall.findById(callId);
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call session not found'
      });
    }

    // Check if user is participant
    const participant = liveCall.participants.find(p => p.userId.toString() === userId.toString());
    if (!participant) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a participant in this call'
      });
    }

    // Get product details
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Add to cart updates
    await liveCall.addCartUpdate(userId, productId, action);

    // Add to shared wardrobe if adding
    if (action === 'added') {
      await liveCall.addWardrobeItem(productId);
    }

    // Emit to all participants via Socket.io
    req.app.get('io').to(`call-${callId}`).emit('call:cart-update', {
      userId,
      userName: req.user.name,
      productId,
      productName: product.name,
      productPrice: product.price,
      productImage: product.images[0],
      action,
      timestamp: new Date()
    });

    res.json({
      status: 'success',
      message: `Product ${action} to cart successfully`,
      data: {
        product: {
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0]
        },
        action,
        cartUpdates: liveCall.sessionData.cartUpdates.length
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/calls/:callId/browsing-state
// @desc    Get current browsing state of the call
// @access  Private
router.get('/:callId/browsing-state', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    const liveCall = await LiveCall.findById(callId);

    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call session not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        // Basic browsing state
        currentProduct: liveCall.sessionData?.currentProductId || null,
        scrollPosition: liveCall.sessionData?.scrollPosition || 0,
        activeBrowsers: liveCall.sessionData?.activeBrowsers?.length || 0,
        
        // Enhanced browsing state
        searchQuery: liveCall.sessionData?.searchQuery || '',
        filters: liveCall.sessionData?.activeFilters || {},
        sortBy: liveCall.sessionData?.sortBy || 'relevance',
        sortOrder: liveCall.sessionData?.sortOrder || 'desc',
        currentPage: liveCall.sessionData?.currentPage || 1,
        totalPages: liveCall.sessionData?.totalPages || 1,
        totalProducts: liveCall.sessionData?.totalProducts || 0,
        
        // Session data
        recentCartUpdates: liveCall.sessionData?.cartUpdates?.slice(-5) || [],
        wardrobeItems: liveCall.wardrobeItems?.length || 0,
        participants: liveCall.participants?.length || 0,
        
        // Browsing history
        browsingHistory: liveCall.sessionData?.browsingHistory?.slice(-10) || []
      }
    });
  } catch (error) {
    console.error('Get browsing state error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/calls/:roomId/start-call
// @desc    Start collaborative shopping call (notify all room members)
// @access  Private
router.post('/:roomId/start-call', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    // Check if user is room member
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    const isMember = room.members.some(member => 
      member.userId.toString() === userId.toString()
    ) || room.owner.toString() === userId.toString();

    if (!isMember) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a member of this room'
      });
    }

    // Check if there's already an active call
    const existingCall = await LiveCall.findActiveCall(roomId);
    if (existingCall) {
      return res.status(400).json({
        status: 'error',
        message: 'There is already an active call in this room'
      });
    }

    // Create new call
    const liveCall = await LiveCall.create({
      roomId,
      hostId: userId,
      participants: [{
        userId,
        role: 'host',
        joinedAt: new Date(),
        isActive: true
      }],
      currentController: {
        userId,
        startedAt: new Date(),
        expiresAt: null
      },
      duration: {
        maxDuration: 30,
        minDuration: 10,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60 * 1000)
      },
      status: 'active'
    });

    // Get all room members (excluding host)
    const roomMembers = room.members.map(member => member.userId);
    const allMembers = [...roomMembers, room.owner].filter(id => 
      id.toString() !== userId.toString()
    );

    // Send notifications to all room members
    const notifications = await Promise.all(
      allMembers.map(memberId => 
        Notification.createCallInvitation(
          memberId,
          liveCall._id,
          roomId,
          req.user.name,
          room.name
        )
      )
    );

    // Emit real-time notifications
    notifications.forEach(notification => {
      req.app.get('io').to(`user-${notification.userId}`).emit('notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data
      });
    });

    // Auto-end call after 30 minutes
    setTimeout(async () => {
      try {
        const call = await LiveCall.findById(liveCall._id);
        if (call && call.status === 'active') {
          await call.endCall();
          
          // Notify all participants
          req.app.get('io').to(`call-${liveCall._id}`).emit('call:ended', {
            reason: 'time_limit_reached',
            duration: 30
          });
        }
      } catch (error) {
        console.error('Auto-end call error:', error);
      }
    }, 30 * 60 * 1000);

    res.json({
      status: 'success',
      message: 'Shopping call started successfully',
      data: {
        callId: liveCall._id,
        roomId,
        hostId: userId,
        participants: 1,
        notificationsSent: notifications.length
      }
    });
  } catch (error) {
    console.error('Start call error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/calls/:callId/join
// @desc    Join collaborative shopping call
// @access  Private
router.post('/:callId/join', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    const liveCall = await LiveCall.findById(callId).populate('roomId');
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    if (liveCall.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Call is not active'
      });
    }

    // Check if call is full (max 5 participants)
    if (liveCall.participants.length >= 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Call is full (maximum 5 participants)'
      });
    }

    // Check if user is already a participant
    const existingParticipant = liveCall.participants.find(p => 
      p.userId.toString() === userId.toString()
    );

    if (existingParticipant) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already in this call'
      });
    }

    // Check if user is room member
    const room = liveCall.roomId;
    const isMember = room.members.some(member => 
      member.userId.toString() === userId.toString()
    ) || room.owner.toString() === userId.toString();

    if (!isMember) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a member of this room'
      });
    }

    // Add participant
    await liveCall.addParticipant(userId);

    // Notify all participants about new join
    req.app.get('io').to(`call-${callId}`).emit('call:participant-joined', {
      userId,
      userName: req.user.name,
      participantCount: liveCall.participants.length
    });

    res.json({
      status: 'success',
      message: 'Joined call successfully',
      data: {
        callId,
        participantCount: liveCall.participants.length,
        currentController: liveCall.currentController.userId
      }
    });
  } catch (error) {
    console.error('Join call error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/calls/:callId/request-control
// @desc    Request control of browsing
// @access  Private
router.post('/:callId/request-control', authenticateToken, [
  body('message')
    .optional()
    .isString()
    .withMessage('Message must be a string')
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

    const { callId } = req.params;
    const { message = '' } = req.body;
    const userId = req.user._id;

    const liveCall = await LiveCall.findById(callId);
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    // Check if user is participant
    const participant = liveCall.participants.find(p => 
      p.userId.toString() === userId.toString()
    );

    if (!participant) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a participant in this call'
      });
    }

    // Request control
    await liveCall.requestControl(userId, message);

    // Notify current controller
    const currentController = liveCall.participants.find(p => 
      p.userId.toString() === liveCall.currentController.userId.toString()
    );

    if (currentController) {
      const notification = await Notification.createControlRequest(
        currentController.userId,
        callId,
        req.user.name
      );

      req.app.get('io').to(`user-${currentController.userId}`).emit('notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data
      });
    }

    res.json({
      status: 'success',
      message: 'Control request sent successfully',
      data: {
        callId,
        currentController: liveCall.currentController.userId,
        pendingRequests: liveCall.controlRequests.filter(req => req.status === 'pending').length
      }
    });
  } catch (error) {
    console.error('Request control error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @route   POST /api/calls/:callId/approve-control
// @desc    Approve control request
// @access  Private
router.post('/:callId/approve-control', authenticateToken, [
  body('requestUserId')
    .notEmpty()
    .withMessage('Request user ID is required')
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

    const { callId } = req.params;
    const { requestUserId } = req.body;
    const userId = req.user._id;

    const liveCall = await LiveCall.findById(callId);
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    // Approve control request
    await liveCall.approveControlRequest(requestUserId, userId);

    // Notify all participants about control change
    req.app.get('io').to(`call-${callId}`).emit('call:control-changed', {
      newController: requestUserId,
      previousController: userId,
      timestamp: new Date()
    });

    res.json({
      status: 'success',
      message: 'Control request approved successfully',
      data: {
        callId,
        currentController: liveCall.currentController.userId,
        expiresAt: liveCall.currentController.expiresAt
      }
    });
  } catch (error) {
    console.error('Approve control error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @route   POST /api/calls/:callId/deny-control
// @desc    Deny control request
// @access  Private
router.post('/:callId/deny-control', authenticateToken, [
  body('requestUserId')
    .notEmpty()
    .withMessage('Request user ID is required')
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

    const { callId } = req.params;
    const { requestUserId } = req.body;
    const userId = req.user._id;

    const liveCall = await LiveCall.findById(callId);
    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    // Deny control request
    await liveCall.denyControlRequest(requestUserId, userId);

    // Notify requester
    req.app.get('io').to(`user-${requestUserId}`).emit('call:control-denied', {
      callId,
      reason: 'Control request denied'
    });

    res.json({
      status: 'success',
      message: 'Control request denied successfully',
      data: {
        callId,
        currentController: liveCall.currentController.userId
      }
    });
  } catch (error) {
    console.error('Deny control error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @route   GET /api/calls/:callId/status
// @desc    Get call status and information
// @access  Private
router.get('/:callId/status', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    const liveCall = await LiveCall.findById(callId)
      .populate('participants.userId', 'name profileImage')
      .populate('currentController.userId', 'name profileImage')
      .populate('hostId', 'name profileImage');

    if (!liveCall) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found'
      });
    }

    // Check if user is participant
    const participant = liveCall.participants.find(p => 
      p.userId.toString() === userId.toString()
    );

    if (!participant) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a participant in this call'
      });
    }

    const callStatus = liveCall.getCallStatus();

    res.json({
      status: 'success',
      data: {
        ...callStatus,
        participants: liveCall.participants.map(p => ({
          id: p.userId._id,
          name: p.userId.name,
          profileImage: p.userId.profileImage,
          role: p.role,
          isActive: p.isActive
        })),
        currentController: {
          id: liveCall.currentController.userId?._id,
          name: liveCall.currentController.userId?.name,
          profileImage: liveCall.currentController.userId?.profileImage
        },
        host: {
          id: liveCall.hostId._id,
          name: liveCall.hostId.name,
          profileImage: liveCall.hostId.profileImage
        }
      }
    });
  } catch (error) {
    console.error('Get call status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
