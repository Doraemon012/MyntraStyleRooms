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
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Attach Socket.io to app for use in routes
app.set('io', io);

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

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('🗄️  Database:', process.env.MONGODB_URI.split('@')[1]?.split('/')[0] || 'Unknown');
  console.log('📊 Database name: myntra-fashion');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('\n� === NEW SOCKET CONNECTION ===');
  console.log('�👤 Socket ID:', socket.id);
  console.log('📅 Connected at:', new Date().toISOString());

  // Join room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`🏠 Socket ${socket.id} joined room ${roomId}`);
  });

  // Leave room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`� Socket ${socket.id} left room ${roomId}`);
  });

  // Send message
  socket.on('send-message', (data) => {
    console.log(`💬 Message sent in room ${data.roomId} by ${socket.id}`);
    socket.to(data.roomId).emit('new-message', data);
  });

  // Join call session
  socket.on('join-call', (callId) => {
    socket.join(`call-${callId}`);
    console.log(`� Socket ${socket.id} joined call ${callId}`);
  });

  // Leave call session
  socket.on('leave-call', (callId) => {
    socket.leave(`call-${callId}`);
    console.log(`� Socket ${socket.id} left call ${callId}`);
  });

  // Join user-specific room for notifications
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 Socket ${socket.id} joined user room ${userId}`);
  });

  // Voice call signaling
  socket.on('call-signal', (data) => {
    console.log(`📡 Call signal from ${socket.id} to ${data.targetUserId}`);
    socket.to(data.targetUserId).emit('call-signal', data);
  });

  // Real-time browsing sync (enhanced)
  socket.on('call:sync-browse', (data) => {
    console.log(`🔄 Browse sync in call ${data.callId} by user ${data.userId}`);
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

  // Cart updates
  socket.on('call:cart-update', (data) => {
    console.log(`🛒 Cart update in call ${data.callId}`);
    socket.to(`call-${data.callId}`).emit('call:cart-notification', data);
  });

  // Control changes
  socket.on('call:control-changed', (data) => {
    console.log(`🎮 Control changed in call ${data.callId}`);
    socket.to(`call-${data.callId}`).emit('call:control-update', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`� Socket ${socket.id} disconnected at ${new Date().toISOString()}`);
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
