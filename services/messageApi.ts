import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Create axios instance for message API
const messageApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Optimized timeout for better performance
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
messageApiClient.interceptors.request.use(
  (config) => {
    console.log(`💬 Message API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Message API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
messageApiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Message API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Message API Response Error:', error.response?.status, error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Message API timeout - request took too long');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('🌐 Message API connection error - server unreachable');
    }
    
    return Promise.reject(error);
  }
);

export interface Message {
  _id: string;
  roomId: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  senderType: 'user' | 'ai' | 'system';
  text?: string;
  messageType: 'text' | 'product' | 'image' | 'voice' | 'system';
  productData?: {
    name: string;
    price: string;
    image: string;
    productId?: string;
    brand?: string;
    category?: string;
  };
  imageData?: {
    url: string;
    caption?: string;
    width?: number;
    height?: number;
  };
  voiceData?: {
    url: string;
    duration?: number;
    transcription?: string;
  };
  systemData?: {
    action: string;
    data: any;
  };
  timestamp: string;
  isRead: string[];
  reactions: Array<{
    userId: string;
    type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
    createdAt: string;
  }>;
  replyTo?: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  text?: string;
  messageType?: 'text' | 'product' | 'image' | 'voice';
  productData?: {
    name: string;
    price: string;
    image: string;
    productId?: string;
    brand?: string;
    category?: string;
  };
  replyTo?: string;
}

export interface MessageResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    message: Message;
    pagination?: {
      currentPage: number;
      limit: number;
      hasMore: boolean;
    };
  };
}

export interface MessagesResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    messages: Message[];
    pagination: {
      currentPage: number;
      limit: number;
      hasMore: boolean;
    };
  };
}

export const messageApi = {
  // Get messages for a room
  getMessages: async (token: string, roomId: string, options?: {
    page?: number;
    limit?: number;
    before?: string;
    after?: string;
  }): Promise<MessagesResponse> => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.before) params.append('before', options.before);
    if (options?.after) params.append('after', options.after);

    const response = await messageApiClient.get(`/messages/${roomId}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Send message to room
  sendMessage: async (token: string, roomId: string, messageData: SendMessageData): Promise<MessageResponse> => {
    const response = await messageApiClient.post(`/messages/${roomId}`, messageData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Edit message
  editMessage: async (token: string, messageId: string, text: string): Promise<MessageResponse> => {
    const response = await messageApiClient.put(`/messages/${messageId}`, { text }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Delete message
  deleteMessage: async (token: string, messageId: string): Promise<{ status: string; message: string }> => {
    const response = await messageApiClient.delete(`/messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Add reaction to message
  addReaction: async (token: string, messageId: string, reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'): Promise<MessageResponse> => {
    const response = await messageApiClient.post(`/messages/${messageId}/reactions`, { type: reactionType }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Remove reaction from message
  removeReaction: async (token: string, messageId: string): Promise<MessageResponse> => {
    const response = await messageApiClient.delete(`/messages/${messageId}/reactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Mark message as read
  markAsRead: async (token: string, messageId: string): Promise<{ status: string; message: string }> => {
    const response = await messageApiClient.post(`/messages/${messageId}/read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Share product in room chat
  shareProduct: async (token: string, roomId: string, productId: string, message?: string): Promise<MessageResponse> => {
    const response = await messageApiClient.post(`/messages/${roomId}/share-product`, {
      productId,
      message,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default messageApi;


