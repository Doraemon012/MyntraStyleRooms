const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: [
      process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
      "http://10.10.53.19:3000",
      "http://10.10.53.19:8081",
      "http://172.20.10.2:3000",
      "http://localhost:8081",
      "exp://10.10.53.19:8081",
      "exp://172.20.10.2:8081",
      "exp://localhost:8081"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  allowEIO3: true,
  compression: true,
  maxHttpBufferSize: 1e6
});

// Attach Socket.io to app for use in routes
app.set('io', io);

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;
    const userName = socket.handshake.auth.userName;
    
    // For development, allow mock authentication
    if (token === 'mock-token') {
      socket.userId = userId;
      socket.userName = userName || 'You';
      console.log(`🔌 Socket authenticated with mock user: ${socket.userName} (${userId})`);
      return next();
    }
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    
    // Verify JWT token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.id !== userId) {
      return next(new Error('Token user mismatch'));
    }
    
    // Attach user info to socket
    socket.userId = userId;
    socket.userName = userName;
    
    console.log(`🔌 Socket authenticated for user: ${socket.userName} (${userId})`);
    next();
  } catch (error) {
    console.error('❌ Socket authentication error:', error.message);
    // For development, allow connection even with auth errors
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Development mode: Allowing connection despite auth error');
      socket.userId = socket.handshake.auth.userId || 'dev-user';
      socket.userName = socket.handshake.auth.userName || 'Dev User';
      next();
    } else {
      next(new Error('Authentication failed'));
    }
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userName} (${socket.userId})`);
  
  // Store typing timeouts for cleanup
  const typingTimeouts = new Map();
  
  // Handle joining rooms
  socket.on('join-room', (roomId) => {
    console.log(`🚪 User ${socket.userName} joining room: ${roomId}`);
    socket.join(roomId);
    socket.emit('room-joined', roomId);
    
    // Notify other users in the room that someone joined
    socket.to(roomId).emit('user-joined-room', {
      userId: socket.userId,
      userName: socket.userName,
      roomId: roomId,
      timestamp: new Date()
    });
  });
  
  // Handle leaving rooms
  socket.on('leave-room', (roomId) => {
    console.log(`🚪 User ${socket.userName} leaving room: ${roomId}`);
    socket.leave(roomId);
    socket.emit('room-left', roomId);
    
    // Notify other users in the room that someone left
    socket.to(roomId).emit('user-left-room', {
      userId: socket.userId,
      userName: socket.userName,
      roomId: roomId,
      timestamp: new Date()
    });
  });

  // Handle real-time messaging
  socket.on('send-message', (data) => {
    console.log(`💬 Message from ${socket.userName} in room ${data.roomId}: ${data.text}`);
    
    // Determine sender type - if it's AI, keep it as 'ai', otherwise 'friend'
    const senderType = data.sender === 'ai' ? 'ai' : 'friend';
    
    // Broadcast message to all users in the room except sender
    socket.to(data.roomId).emit('new-message', {
      id: data.id || Date.now().toString(),
      text: data.text,
      sender: senderType,
      senderName: data.senderName || socket.userName,
      senderId: socket.userId,
      senderAvatar: data.senderAvatar,
      timestamp: data.timestamp || new Date().toISOString(),
      roomId: data.roomId,
      messageType: data.messageType || 'text',
      productData: data.productData,
      reactions: data.reactions || { thumbsUp: 0, thumbsDown: 0 }
    });
  });

  // Handle typing indicators with automatic timeout
  socket.on('typing-start', (data) => {
    // Clear existing timeout for this room
    if (typingTimeouts.has(data.roomId)) {
      clearTimeout(typingTimeouts.get(data.roomId));
    }
    
    // Emit typing start
    socket.to(data.roomId).emit('typing-start', {
      userId: socket.userId,
      userName: socket.userName,
      roomId: data.roomId
    });
    
    // Set timeout to automatically stop typing after 3 seconds
    const timeout = setTimeout(() => {
      socket.to(data.roomId).emit('typing-stop', {
        userId: socket.userId,
        userName: socket.userName,
        roomId: data.roomId
      });
      typingTimeouts.delete(data.roomId);
    }, 3000);
    
    typingTimeouts.set(data.roomId, timeout);
  });

  socket.on('typing-stop', (data) => {
    // Clear timeout and emit stop
    if (typingTimeouts.has(data.roomId)) {
      clearTimeout(typingTimeouts.get(data.roomId));
      typingTimeouts.delete(data.roomId);
    }
    
    socket.to(data.roomId).emit('typing-stop', {
      userId: socket.userId,
      userName: socket.userName,
      roomId: data.roomId
    });
  });

  // Handle message reactions
  socket.on('message-reaction', (data) => {
    console.log(`👍 Reaction from ${socket.userName} on message ${data.messageId}: ${data.reactionType}`);
    
    socket.to(data.roomId).emit('message-reaction-updated', {
      messageId: data.messageId,
      userId: socket.userId,
      userName: socket.userName,
      reactionType: data.reactionType,
      roomId: data.roomId,
      timestamp: new Date()
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 User disconnected: ${socket.userName} (${socket.userId}) - ${reason}`);
    
    // Clear all typing timeouts
    typingTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    typingTimeouts.clear();
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const wardrobeRoutes = require('./routes/wardrobes');
const productRoutes = require('./routes/products');
const messageRoutes = require('./routes/messages');
const callRoutes = require('./routes/calls');
const aiRoutes = require('./routes/ai');
const notificationRoutes = require('./routes/notifications');
const invitationRoutes = require('./routes/invitations');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - DISABLED FOR DEVELOPMENT
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : [
        'http://localhost:3000', 
        'http://localhost:19006',
        'http://172.20.10.2:3000',
        'http://172.20.10.2:19006',
        'exp://172.20.10.2:19000',
        'exp://localhost:19000'
      ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection - FORCE MYNTRA FASHION DATABASE
const mongoUri = process.env.MONGODB_URI;

// For development, you can use a local MongoDB or skip DB connection
if (process.env.NODE_ENV === 'development' && !mongoUri) {
  console.log('⚠️ No MongoDB URI found, running without database (Socket.IO will still work)');
} else {
  // Ensure we're using the myntra-fashion database
  const mongoUriWithDb = mongoUri.includes('myntra-fashion') 
    ? mongoUri 
    : mongoUri.replace('mongodb.net/', 'mongodb.net/myntra-fashion');

  console.log('🔗 Connecting to Myntra Fashion Database:', mongoUriWithDb);

  mongoose.connect(mongoUriWithDb, {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 10000, // Increased timeout
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    connectTimeoutMS: 15000, // Increased timeout
    retryWrites: true,
    w: 'majority'
  })
  .then(() => console.log('✅ Connected to MYNTRA FASHION DATABASE successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Continuing without database - Socket.IO will still work for real-time chat');
  });
}

// Additional Socket.io handlers for call sessions and other features
io.on('connection', (socket) => {
  // Join call session
  socket.on('join-call', (callId) => {
    socket.join(`call-${callId}`);
    console.log(`👤 User ${socket.userId} joined call ${callId}`);
  });

  // Leave call session
  socket.on('leave-call', (callId) => {
    socket.leave(`call-${callId}`);
    console.log(`👤 User ${socket.userId} left call ${callId}`);
  });

  // Join user-specific room for notifications
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${socket.userId} joined user room ${userId}`);
  });

  // Voice call signaling
  socket.on('call-signal', (data) => {
    socket.to(data.targetUserId).emit('call-signal', data);
  });

  // Call notifications
  socket.on('call-started', (data) => {
    socket.to(data.roomId).emit('call-started', data);
  });

  socket.on('user-joined-call', (data) => {
    socket.to(data.roomId).emit('user-joined-call', data);
  });

  socket.on('user-left-call', (data) => {
    socket.to(data.roomId).emit('user-left-call', data);
  });

  // Real-time browsing sync (enhanced)
  socket.on('call:sync-browse', (data) => {
    socket.to(`call-${data.callId}`).emit('call:browse-update', {
      userId: data.userId,
      productId: data.productId,
      scrollPosition: data.scrollPosition,
      searchQuery: data.searchQuery,
      filters: data.filters,
      sortBy: data.sortBy,
      sortOrder: data.sortOrder,
      page: data.page,
      totalPages: data.totalPages,
      totalProducts: data.totalProducts,
      timestamp: data.timestamp
    });
  });

  // Master control events
  socket.on('call:request-control', (data) => {
    socket.to(`call-${data.callId}`).emit('call:control-requested', {
      userId: data.userId,
      userName: data.userName,
      callId: data.callId,
      timestamp: new Date()
    });
  });

  socket.on('call:approve-control', (data) => {
    socket.to(`call-${data.callId}`).emit('call:control-transferred', {
      newController: data.newController,
      callId: data.callId,
      timestamp: new Date()
    });
  });

  socket.on('call:deny-control', (data) => {
    socket.to(`call-${data.callId}`).emit('call:control-denied', {
      requestUserId: data.requestUserId,
      callId: data.callId,
      timestamp: new Date()
    });
  });

  socket.on('call:release-control', (data) => {
    socket.to(`call-${data.callId}`).emit('call:control-released', {
      userId: data.userId,
      callId: data.callId,
      timestamp: new Date()
    });
  });

  // Cart updates
  socket.on('call:cart-update', (data) => {
    socket.to(`call-${data.callId}`).emit('call:cart-notification', data);
  });

  // Control changes
  socket.on('call:control-changed', (data) => {
    socket.to(`call-${data.callId}`).emit('call:control-update', data);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/rooms', authenticateToken, roomRoutes);
app.use('/api/wardrobes', authenticateToken, wardrobeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/calls', authenticateToken, callRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/invitations', authenticateToken, invitationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Myntra Fashion Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 Server accessible on all network interfaces`);
});

module.exports = { app, server, io };
