import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

interface SocketMessage {
  id: string;
  text: string;
  sender: 'user' | 'friend' | 'ai' | 'maya';
  senderName: string;
  senderId?: string;
  senderAvatar?: string;
  timestamp: string;
  roomId: string;
  messageType?: 'text' | 'product' | 'image' | 'voice' | 'system';
  productData?: any;
  reactions?: {
    thumbsUp: number;
    thumbsDown: number;
    userThumbsUp?: boolean;
    userThumbsDown?: boolean;
  };
}

interface TypingUser {
  userId: string;
  userName: string;
  roomId: string;
}

interface SocketServiceCallbacks {
  onMessage?: (message: SocketMessage) => void;
  onTypingStart?: (user: TypingUser) => void;
  onTypingStop?: (user: TypingUser) => void;
  onUserJoined?: (user: TypingUser) => void;
  onUserLeft?: (user: TypingUser) => void;
  onReactionUpdate?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private callbacks: SocketServiceCallbacks = {};
  private currentRoomId: string | null = null;
  private typingTimeout: NodeJS.Timeout | null = null;
  private isConnected = false;

  // Initialize socket connection
  async initialize(callbacks: SocketServiceCallbacks) {
    this.callbacks = callbacks;

    try {
      // Get user token and info from storage
      const token = await AsyncStorage.getItem('userToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      // For development, use mock user data if authentication is not available
      let user;
      if (token && userInfo) {
        user = JSON.parse(userInfo);
      } else {
        console.log('⚠️ No authentication found, using mock user for Socket.IO');
        user = {
          _id: 'mock-user-1',
          name: 'You',
          email: 'test@example.com'
        };
      }
      
      // Determine server URL based on environment
      const serverUrl = __DEV__ 
        ? 'http://10.84.92.165:5000'  // Updated to correct local IP
        : 'https://your-production-url.com';

      console.log('🔌 Connecting to Socket.IO server:', serverUrl);

      this.socket = io(serverUrl, {
        auth: {
          token: token || 'mock-token',
          userId: user._id,
          userName: user.name
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('❌ Socket initialization error:', error);
      this.callbacks.onError?.(error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.callbacks.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      this.callbacks.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.callbacks.onError?.(error);
    });

    // Room events
    this.socket.on('room-joined', (roomId) => {
      console.log('🚪 Joined room:', roomId);
      this.currentRoomId = roomId;
    });

    this.socket.on('room-left', (roomId) => {
      console.log('🚪 Left room:', roomId);
      if (this.currentRoomId === roomId) {
        this.currentRoomId = null;
      }
    });

    // Message events
    this.socket.on('new-message', (message: SocketMessage) => {
      console.log('💬 New message received:', message.text);
      this.callbacks.onMessage?.(message);
    });

    // Typing events
    this.socket.on('typing-start', (user: TypingUser) => {
      console.log('⌨️ User started typing:', user.userName);
      this.callbacks.onTypingStart?.(user);
    });

    this.socket.on('typing-stop', (user: TypingUser) => {
      console.log('⌨️ User stopped typing:', user.userName);
      this.callbacks.onTypingStop?.(user);
    });

    // User events
    this.socket.on('user-joined-room', (user: TypingUser) => {
      console.log('👋 User joined room:', user.userName);
      this.callbacks.onUserJoined?.(user);
    });

    this.socket.on('user-left-room', (user: TypingUser) => {
      console.log('👋 User left room:', user.userName);
      this.callbacks.onUserLeft?.(user);
    });

    // Reaction events
    this.socket.on('message-reaction-updated', (data) => {
      console.log('👍 Reaction updated:', data);
      this.callbacks.onReactionUpdate?.(data);
    });
  }

  // Join a room
  joinRoom(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot join room');
      return;
    }

    console.log('🚪 Joining room:', roomId);
    this.socket.emit('join-room', roomId);
  }

  // Leave a room
  leaveRoom(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot leave room');
      return;
    }

    console.log('🚪 Leaving room:', roomId);
    this.socket.emit('leave-room', roomId);
  }

  // Send a message
  sendMessage(message: Omit<SocketMessage, 'id' | 'timestamp'>) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot send message');
      return;
    }

    const messageData = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    console.log('💬 Sending message:', messageData.text);
    this.socket.emit('send-message', messageData);
  }

  // Start typing indicator
  startTyping(roomId: string) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.socket.emit('typing-start', { roomId });

    // Auto-stop typing after 3 seconds
    this.typingTimeout = setTimeout(() => {
      this.stopTyping(roomId);
    }, 3000);
  }

  // Stop typing indicator
  stopTyping(roomId: string) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    this.socket.emit('typing-stop', { roomId });
  }

  // Send reaction
  sendReaction(messageId: string, reactionType: 'thumbsUp' | 'thumbsDown', roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot send reaction');
      return;
    }

    console.log('👍 Sending reaction:', reactionType, 'for message:', messageId);
    this.socket.emit('message-reaction', {
      messageId,
      reactionType,
      roomId
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentRoomId = null;
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      currentRoomId: this.currentRoomId,
      socketId: this.socket?.id
    };
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
