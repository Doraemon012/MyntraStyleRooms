const { io } = require('socket.io-client');

// Test Socket.IO connection
const socket = io('http://172.20.10.2:5000', {
  auth: {
    token: 'test-token',
    userId: 'test-user-1',
    userName: 'You'
  },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO server:', socket.id);
  
  // Test joining a room
  socket.emit('join-room', 'test-room-1');
});

socket.on('room-joined', (roomId) => {
  console.log('🚪 Joined room:', roomId);
  
  // Test sending a message
  setTimeout(() => {
    socket.emit('send-message', {
      text: 'Hello from test user!',
      roomId: 'test-room-1',
      messageType: 'text'
    });
  }, 1000);
});

socket.on('new-message', (message) => {
  console.log('💬 Received message:', message);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

// Keep the process alive
setTimeout(() => {
  console.log('🔄 Test completed, disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 5000);
