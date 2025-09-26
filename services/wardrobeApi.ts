// Import API_BASE_URL from the network utilities
import { getApiBaseUrl } from '../utils/networkUtils';

const API_BASE_URL = getApiBaseUrl();

export interface WardrobeItem {
  _id: string;
  wardrobeId: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
    category: string;
    description?: string;
  };
  addedBy: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  addedAt: Date;
  isPurchased: boolean;
  purchasedBy?: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  purchasedAt?: Date;
  reactions: Array<{
    userId: string;
    type: 'like' | 'love' | 'dislike';
    createdAt: Date;
  }>;
  notes?: string;
  customTags?: string[];
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  reactionCounts?: {
    like: number;
    love: number;
    dislike: number;
  };
}

export interface Wardrobe {
  _id: string;
  name: string;
  emoji: string;
  description?: string;
  occasionType: string;
  roomId: string;
  budgetRange: {
    min: number;
    max: number;
  };
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
    joinedAt: Date;
  }>;
  itemCount: number;
  lastUpdated: Date;
  settings: {
    allowMemberInvites: boolean;
    aiSuggestionsEnabled: boolean;
    autoOutfitGeneration: boolean;
  };
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  memberCount?: number;
}

export interface AddToWardrobeResponse {
  status: 'success' | 'error';
  data?: {
    item: WardrobeItem;
  };
  message?: string;
}

export interface GetWardrobesResponse {
  status: 'success' | 'error';
  data?: {
    wardrobes: Wardrobe[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalWardrobes: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

export interface GetWardrobeItemsResponse {
  status: 'success' | 'error';
  data?: {
    items: WardrobeItem[];
    pagination?: {
      currentPage: number;
      limit: number;
      hasMore: boolean;
    };
  };
  message?: string;
}

export interface WardrobeStats {
  totalWardrobes: number;
  ownedWardrobes: number;
  totalItems: number;
  avgItemsPerWardrobe: number;
}

class WardrobeApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/wardrobes`;
  }

  /**
   * Get user's wardrobes
   */
  async getWardrobes(
    token: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      occasionType?: string;
      roomId?: string;
    }
  ): Promise<GetWardrobesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.page) queryParams.append('page', options.page.toString());
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.search) queryParams.append('search', options.search);
      if (options?.occasionType) queryParams.append('occasionType', options.occasionType);
      if (options?.roomId) queryParams.append('roomId', options.roomId);

      const response = await fetch(`${this.baseUrl}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get wardrobes error:', error);
      throw error;
    }
  }

  /**
   * Get wardrobe statistics
   */
  async getWardrobeStats(token: string): Promise<{ status: string; data?: { stats: WardrobeStats } }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get wardrobe stats error:', error);
      throw error;
    }
  }

  /**
   * Get single wardrobe by ID
   */
  async getWardrobe(token: string, wardrobeId: string): Promise<{ status: string; data?: { wardrobe: Wardrobe; userRole: string } }> {
    try {
      const response = await fetch(`${this.baseUrl}/${wardrobeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get wardrobe error:', error);
      throw error;
    }
  }

  /**
   * Get wardrobe by ID (alias for getWardrobe)
   */
  async getWardrobeById(token: string, wardrobeId: string): Promise<{ status: string; data?: { wardrobe: Wardrobe; userRole: string } }> {
    return this.getWardrobe(token, wardrobeId);
  }

  /**
   * Create new wardrobe
   */
  async createWardrobe(
    token: string,
    wardrobeData: {
      name: string;
      emoji: string;
      description?: string;
      occasionType?: string;
      budgetRange?: { min: number; max: number };
      isPrivate?: boolean;
      roomId?: string;
      members?: Array<{ userId: string; role?: string }>;
    }
  ): Promise<{ status: string; data?: { wardrobe: Wardrobe }; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(wardrobeData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create wardrobe error:', error);
      throw error;
    }
  }

  /**
   * Update wardrobe
   */
  async updateWardrobe(
    token: string,
    wardrobeId: string,
    updateData: {
      name?: string;
      emoji?: string;
      description?: string;
      occasionType?: string;
      budgetRange?: { min: number; max: number };
      isPrivate?: boolean;
      settings?: {
        allowMemberInvites?: boolean;
        aiSuggestionsEnabled?: boolean;
        autoOutfitGeneration?: boolean;
      };
    }
  ): Promise<{ status: string; data?: { wardrobe: Wardrobe }; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${wardrobeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update wardrobe error:', error);
      throw error;
    }
  }

  /**
   * Delete wardrobe
   */
  async deleteWardrobe(token: string, wardrobeId: string): Promise<{ status: string; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${wardrobeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete wardrobe error:', error);
      throw error;
    }
  }

  /**
   * Get wardrobe items
   */
  async getWardrobeItems(
    token: string,
    wardrobeId: string,
    options?: {
      page?: number;
      limit?: number;
      category?: string;
      isPurchased?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<GetWardrobeItemsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.page) queryParams.append('page', options.page.toString());
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.category) queryParams.append('category', options.category);
      if (options?.isPurchased !== undefined) queryParams.append('isPurchased', options.isPurchased.toString());
      if (options?.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options?.sortOrder) queryParams.append('sortOrder', options.sortOrder);

      const response = await fetch(`${this.baseUrl}/${wardrobeId}/items?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get wardrobe items error:', error);
      throw error;
    }
  }

  /**
   * Add product to wardrobe
   */
  async addToWardrobe(
    token: string,
    wardrobeId: string,
    productId: string,
    options?: {
      notes?: string;
      customTags?: string[];
      priority?: 'low' | 'medium' | 'high';
    }
  ): Promise<AddToWardrobeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${wardrobeId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          notes: options?.notes || '',
          customTags: options?.customTags || [],
          priority: options?.priority || 'medium'
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Add to wardrobe error:', error);
      throw error;
    }
  }

  /**
   * Remove item from wardrobe
   */
  async removeFromWardrobe(
    token: string,
    wardrobeId: string,
    itemId: string
  ): Promise<{ status: string; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${wardrobeId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Remove from wardrobe error:', error);
      throw error;
    }
  }

  /**
   * Add reaction to wardrobe item
   */
  async addReaction(
    token: string,
    wardrobeId: string,
    itemId: string,
    reactionType: 'like' | 'love' | 'dislike'
  ): Promise<{ status: string; data?: { item: WardrobeItem }; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${wardrobeId}/items/${itemId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: reactionType
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Add reaction error:', error);
      throw error;
    }
  }

  /**
   * Mark item as purchased
   */
  async markAsPurchased(
    token: string,
    wardrobeId: string,
    itemId: string
  ): Promise<{ status: string; data?: { item: WardrobeItem }; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${wardrobeId}/items/${itemId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Mark as purchased error:', error);
      throw error;
    }
  }

  /**
   * Add member to wardrobe
   */
  async addMember(
    token: string,
    wardrobeId: string,
    userId: string,
    role: 'Editor' | 'Contributor' | 'Viewer' = 'Contributor'
  ): Promise<{ status: string; data?: { wardrobe: Wardrobe }; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${wardrobeId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          role
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Add member error:', error);
      throw error;
    }
  }
}

export const wardrobeApi = new WardrobeApi();
export default wardrobeApi;


