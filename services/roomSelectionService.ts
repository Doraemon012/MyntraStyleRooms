import { roomAPI } from './api';

export interface Room {
  _id: string;
  name: string;
  description?: string;
  emoji?: string;
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

export interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  category: string;
  rating: number;
  discountPercentage?: number;
  isNew?: boolean;
  isTrending?: boolean;
}

class RoomSelectionService {
  private static instance: RoomSelectionService;
  private rooms: Room[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): RoomSelectionService {
    if (!RoomSelectionService.instance) {
      RoomSelectionService.instance = new RoomSelectionService();
    }
    return RoomSelectionService.instance;
  }

  // Fetch rooms from API
  async fetchRooms(): Promise<Room[]> {
    try {
      const now = Date.now();
      
      // Return cached data if it's still fresh
      if (this.rooms.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
        console.log('📂 Using cached rooms data');
        return this.rooms;
      }

      console.log('🌐 Fetching rooms from API...');
      const response = await roomAPI.getAll();
      
      if (response.status === 'success') {
        this.rooms = response.data.rooms;
        this.lastFetch = now;
        console.log(`✅ Loaded ${this.rooms.length} rooms`);
        return this.rooms;
      } else {
        throw new Error(response.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
      
      // Return mock rooms as fallback
      const mockRooms: Room[] = [
        {
          _id: '1',
          name: 'College Freshers Party',
          emoji: '🎉',
          isPrivate: false,
          owner: { _id: '1', name: 'Room Owner', email: 'owner@example.com' },
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          name: 'Wedding Shopping',
          emoji: '👰',
          isPrivate: false,
          owner: { _id: '1', name: 'Room Owner', email: 'owner@example.com' },
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '3',
          name: 'Family Wedding',
          emoji: '👗',
          isPrivate: false,
          owner: { _id: '1', name: 'Room Owner', email: 'owner@example.com' },
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '4',
          name: 'Friends Reunion',
          emoji: '🌟',
          isPrivate: false,
          owner: { _id: '1', name: 'Room Owner', email: 'owner@example.com' },
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '5',
          name: 'Work Conference',
          emoji: '💼',
          isPrivate: false,
          owner: { _id: '1', name: 'Room Owner', email: 'owner@example.com' },
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      
      this.rooms = mockRooms;
      this.lastFetch = now;
      return mockRooms;
    }
  }

  // Get rooms for selection
  async getRoomsForSelection(): Promise<Room[]> {
    return await this.fetchRooms();
  }

  // Clear cache (useful for refreshing data)
  clearCache(): void {
    this.rooms = [];
    this.lastFetch = 0;
    console.log('🗑️ Cleared rooms cache');
  }

  // Get room by ID
  getRoomById(roomId: string): Room | undefined {
    return this.rooms.find(room => room._id === roomId);
  }

  // Get room count
  getRoomCount(): number {
    return this.rooms.length;
  }
}

export const roomSelectionService = RoomSelectionService.getInstance();
export default roomSelectionService;
