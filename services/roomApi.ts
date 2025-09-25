import { roomAPI } from './api';

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
  createdAt: string;
  updatedAt: string;
}

export interface RoomListParams {
  page?: number;
  limit?: number;
  search?: string;
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
}

export interface UpdateRoomData {
  name?: string;
  emoji?: string;
  description?: string;
  isPrivate?: boolean;
}

export interface AddMemberData {
  userId: string;
  role?: 'Editor' | 'Contributor' | 'Viewer';
}

export interface UpdateMemberData {
  role: 'Editor' | 'Contributor' | 'Viewer';
}

export interface GenerateInvitationData {
  expiresIn?: number; // hours
  maxUses?: number;
}

export interface JoinInvitationData {
  invitationCode: string;
}

class RoomApiService {
  // Get all rooms for the current user
  async getRooms(params?: RoomListParams): Promise<{ status: string; data?: { rooms: Room[] } }> {
    return roomAPI.getAll(params);
  }

  // Get single room by ID
  async getRoomById(roomId: string): Promise<{ status: string; data?: { room: Room } }> {
    return roomAPI.getById(roomId);
  }

  // Create a new room
  async createRoom(roomData: CreateRoomData): Promise<{ status: string; data?: { room: Room } }> {
    return roomAPI.create(roomData);
  }

  // Update room
  async updateRoom(roomId: string, roomData: UpdateRoomData): Promise<{ status: string; data?: { room: Room } }> {
    return roomAPI.update(roomId, roomData);
  }

  // Delete room
  async deleteRoom(roomId: string): Promise<{ status: string; message?: string }> {
    return roomAPI.delete(roomId);
  }

  // Add member to room
  async addMember(roomId: string, memberData: AddMemberData): Promise<{ status: string; data?: { room: Room } }> {
    return roomAPI.addMember(roomId, memberData);
  }

  // Update member role
  async updateMember(roomId: string, memberId: string, memberData: UpdateMemberData): Promise<{ status: string; data?: { room: Room } }> {
    return roomAPI.updateMember(roomId, memberId, memberData);
  }

  // Remove member from room
  async removeMember(roomId: string, memberId: string): Promise<{ status: string; data?: { room: Room } }> {
    return roomAPI.removeMember(roomId, memberId);
  }

  // Join room
  async joinRoom(roomId: string): Promise<{ status: string; data?: { room: Room } }> {
    return roomAPI.join(roomId);
  }

  // Leave room
  async leaveRoom(roomId: string): Promise<{ status: string; message?: string }> {
    return roomAPI.leave(roomId);
  }

  // Toggle AI assistant for room
  async toggleAI(roomId: string, enabled: boolean): Promise<{ status: string; data?: { room: Room } }> {
    return roomAPI.toggleAI(roomId, enabled);
  }

  // Generate invitation for room
  async generateInvitation(roomId: string, invitationData?: GenerateInvitationData): Promise<{ status: string; data?: { invitationCode: string; expiresAt: string } }> {
    return roomAPI.generateInvitation(roomId, invitationData);
  }

  // Join room using invitation code
  async joinWithInvitation(roomId: string, invitationData: JoinInvitationData): Promise<{ status: string; data?: { room: Room } }> {
    return roomAPI.joinWithInvitation(roomId, invitationData);
  }
}

export const roomApi = new RoomApiService();
