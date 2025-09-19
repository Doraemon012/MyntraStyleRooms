import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Create axios instance for room API
const roomApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout to prevent frequent timeouts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
roomApiClient.interceptors.request.use(
  (config) => {
    console.log(`🏠 Room API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Room API Request Error:', error);
    return Promise.reject(error);
  }
);

export interface Room {
  _id: string;
  name: string;
  emoji: string;
  description?: string;
  isPrivate: boolean;
  owner: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  members: Array<{
    userId: {
      _id: string;
      name: string;
      email: string;
      profileImage?: string;
    };
    role: 'Owner' | 'Editor' | 'Contributor' | 'Viewer';
    joinedAt: string;
  }>;
  lastMessage?: string;
  lastActivity: string;
  isLive: boolean;
  liveCallId?: string;
  settings: {
    allowMemberInvites: boolean;
    aiEnabled: boolean;
    voiceCallEnabled: boolean;
  };
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  // Invitation fields
  invitationToken?: string;
  invitationRole?: 'Editor' | 'Contributor' | 'Viewer';
  invitationExpiresAt?: string;
}

export interface CreateRoomData {
  name: string;
  emoji: string;
  description?: string;
  isPrivate?: boolean;
  members?: Array<{
    userId: string;
    role?: 'Editor' | 'Contributor' | 'Viewer';
  }>;
  settings?: {
    allowMemberInvites?: boolean;
    aiEnabled?: boolean;
    voiceCallEnabled?: boolean;
  };
  tags?: string[];
}

export interface UpdateRoomData {
  name?: string;
  emoji?: string;
  description?: string;
  isPrivate?: boolean;
  settings?: {
    allowMemberInvites?: boolean;
    aiEnabled?: boolean;
    voiceCallEnabled?: boolean;
  };
  tags?: string[];
}

export interface AddMemberData {
  userId: string;
  role?: 'Editor' | 'Contributor' | 'Viewer';
}

export interface InvitationData {
  invitationLink: string;
  token: string;
  role: string;
  expiresAt: string;
  roomName: string;
  roomEmoji: string;
}

export const roomApi = {
  // Get all rooms for current user
  getRooms: async (token: string, options?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.search) params.append('search', options.search);

    const response = await roomApiClient.get(`/rooms?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get single room by ID
  getRoom: async (token: string, roomId: string) => {
    const response = await roomApiClient.get(`/rooms/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Create new room
  createRoom: async (token: string, roomData: CreateRoomData) => {
    const response = await roomApiClient.post('/rooms', roomData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update room
  updateRoom: async (token: string, roomId: string, roomData: UpdateRoomData) => {
    const response = await roomApiClient.put(`/rooms/${roomId}`, roomData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Delete room (soft delete)
  deleteRoom: async (token: string, roomId: string) => {
    const response = await roomApiClient.delete(`/rooms/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Add member to room
  addMember: async (token: string, roomId: string, memberData: AddMemberData) => {
    const response = await roomApiClient.post(`/rooms/${roomId}/members`, memberData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update member role
  updateMemberRole: async (token: string, roomId: string, memberId: string, role: string) => {
    const response = await roomApiClient.put(`/rooms/${roomId}/members/${memberId}`, {
      role,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Remove member from room
  removeMember: async (token: string, roomId: string, memberId: string) => {
    const response = await roomApiClient.delete(`/rooms/${roomId}/members/${memberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Join room (for public rooms)
  joinRoom: async (token: string, roomId: string) => {
    const response = await roomApiClient.post(`/rooms/${roomId}/join`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Leave room
  leaveRoom: async (token: string, roomId: string) => {
    const response = await roomApiClient.post(`/rooms/${roomId}/leave`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Toggle AI features
  toggleAI: async (token: string, roomId: string, aiEnabled: boolean) => {
    const response = await roomApiClient.put(`/rooms/${roomId}/ai-toggle`, {
      aiEnabled,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Generate invitation link
  generateInvitation: async (token: string, roomId: string, options?: {
    role?: 'Editor' | 'Contributor' | 'Viewer';
    expiresInHours?: number;
  }) => {
    const response = await roomApiClient.post(`/rooms/${roomId}/generate-invitation`, options || {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Join room via invitation
  joinViaInvitation: async (token: string, roomId: string, invitationToken: string) => {
    const response = await roomApiClient.post(`/rooms/${roomId}/join-invitation`, {
      token: invitationToken,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default roomApi;
