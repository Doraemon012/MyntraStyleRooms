import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';
import { useAuth } from './auth-context';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  onNewMessage: (callback: (message: any) => void) => void;
  onMessageEdited: (callback: (message: any) => void) => void;
  onMessageDeleted: (callback: (messageId: string) => void) => void;
  onMessageReaction: (callback: (message: any) => void) => void;
  onTypingStart: (callback: (data: any) => void) => void;
  onTypingStop: (callback: (data: any) => void) => void;
  emitTypingStart: (roomId: string) => void;
  emitTypingStop: (roomId: string) => void;
  offEvent: (event: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (token && user && !socketRef.current) {
      console.log('🔌 Initializing Socket.io connection...');
      
      // Create socket connection with authentication
      const socketUrl = API_CONFIG.BASE_URL.replace('/api', '');
      console.log('🔌 Connecting to Socket.io at:', socketUrl);
      
      const newSocket = io(socketUrl, {
        auth: {
          token,
          userId: user._id,
          userName: user.name
        },
        transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
        timeout: API_CONFIG.SOCKET_TIMEOUT || 15000,
        forceNew: true,
        upgrade: true,
        rememberUpgrade: true,
        compression: true,
        pingTimeout: 60000,
        pingInterval: 25000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 5
      });

      socketRef.current = newSocket;

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket.io connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket.io disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket.io connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket.io reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('❌ Socket.io reconnection error:', error);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('❌ Socket.io reconnection failed');
        setIsConnected(false);
      });

      setSocket(newSocket);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (socketRef.current) {
        console.log('🔌 Disconnecting Socket.io...');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [token, user]);

  const joinRoom = (roomId: string) => {
    if (socket && isConnected) {
      console.log('🚪 Joining room:', roomId);
      socket.emit('join-room', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket && isConnected) {
      console.log('🚪 Leaving room:', roomId);
      socket.emit('leave-room', roomId);
    }
  };

  const onNewMessage = (callback: (message: any) => void) => {
    if (socket) {
      socket.on('new-message', callback);
    }
  };

  const onMessageEdited = (callback: (message: any) => void) => {
    if (socket) {
      socket.on('message-edited', callback);
    }
  };

  const onMessageDeleted = (callback: (messageId: string) => void) => {
    if (socket) {
      socket.on('message-deleted', callback);
    }
  };

  const onMessageReaction = (callback: (message: any) => void) => {
    if (socket) {
      socket.on('message-reaction', callback);
    }
  };

  const onTypingStart = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('typing-start', callback);
    }
  };

  const onTypingStop = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('typing-stop', callback);
    }
  };

  const emitTypingStart = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('typing-start', { roomId });
    }
  };

  const emitTypingStop = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { roomId });
    }
  };

  const offEvent = (event: string) => {
    if (socket) {
      socket.off(event);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    onNewMessage,
    onMessageEdited,
    onMessageDeleted,
    onMessageReaction,
    onTypingStart,
    onTypingStop,
    emitTypingStart,
    emitTypingStop,
    offEvent,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
