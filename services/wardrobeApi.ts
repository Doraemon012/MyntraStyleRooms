import { API_BASE_URL } from '../config/api';

export interface WardrobeItem {
  _id: string;
  wardrobeId: string;
  productId: string;
  productData: any;
  addedAt: Date;
  isActive: boolean;
  notes?: string;
}

export interface Wardrobe {
  _id: string;
  name: string;
  description?: string;
  occasionType: string;
  owner: {
    _id: string;
    name: string;
  };
  members: Array<{
    userId: {
      _id: string;
      name: string;
    };
    role: string;
  }>;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToWardrobeResponse {
  status: 'success' | 'error';
  data?: {
    wardrobeItem: WardrobeItem;
  };
  message?: string;
}

export interface GetWardrobesResponse {
  status: 'success' | 'error';
  data?: {
    wardrobes: Wardrobe[];
  };
  message?: string;
}

class WardrobeApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/wardrobes`;
  }

  /**
   * Get user's wardrobes
   */
  async getWardrobes(token: string): Promise<GetWardrobesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
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
   * Add product to wardrobe
   */
  async addToWardrobe(
    token: string,
    wardrobeId: string,
    productData: any,
    notes?: string
  ): Promise<AddToWardrobeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${wardrobeId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productData,
          notes: notes || ''
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
   * Get wardrobe items
   */
  async getWardrobeItems(
    token: string,
    wardrobeId: string,
    options?: {
      page?: number;
      limit?: number;
      category?: string;
    }
  ): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.page) queryParams.append('page', options.page.toString());
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.category) queryParams.append('category', options.category);

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
   * Create new wardrobe
   */
  async createWardrobe(
    token: string,
    wardrobeData: {
      name: string;
      description?: string;
      occasionType: string;
    }
  ): Promise<any> {
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
   * Remove item from wardrobe
   */
  async removeFromWardrobe(
    token: string,
    wardrobeId: string,
    itemId: string
  ): Promise<any> {
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
}

export const wardrobeApi = new WardrobeApi();
export default wardrobeApi;


