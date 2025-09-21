import { API_BASE_URL } from '../config/api';

export interface ProductRecommendation {
  name: string;
  brand: string;
  price: string;
  image: string;
  productId: string | null;
  description: string;
  originalPrice?: string | null;
  discount?: number;
  rating?: number;
  ratingCount?: number;
  colors?: Array<{ name: string; hex: string; stock: number }>;
  sizes?: Array<{ size: string; stock: number }>;
  occasion?: string[];
  trendingScore?: number;
}

export interface AIOutfitResponse {
  status: 'success' | 'error';
  data: {
    response: string;
    productRecommendations: ProductRecommendation[];
    message: string;
    context: any;
    roomId?: string;
    outfitType?: string;
  };
  message?: string;
}

export interface AIChatResponse {
  status: 'success' | 'error';
  data: {
    response: string;
    productRecommendations: ProductRecommendation[];
    message: string;
    context: any;
    roomId?: string;
  };
  message?: string;
}

class AIApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/ai`;
  }

  /**
   * Get AI outfit recommendations with virtual cards
   */
  async getOutfitRecommendation(
    token: string,
    query: string,
    roomId?: string,
    context?: any
  ): Promise<AIOutfitResponse> {
    try {
      console.log('🤖 Making AI request to:', `${this.baseUrl}/outfit-recommendation`);
      
      const response = await fetch(`${this.baseUrl}/outfit-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          roomId,
          context: context || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ AI response received:', data.status);
      return data;
    } catch (error) {
      console.error('❌ AI outfit recommendation error:', error);
      
      // Return a fallback response instead of throwing
      return {
        status: 'success',
        data: {
          response: "I'd love to help you with styling! Here are some great options:\n\nPRODUCT: Statement Earrings - Accessorize - ₹899 - Beautiful statement earrings to complete your look\nPRODUCT: Silk Blend Saree - Soch - ₹4999 - Elegant silk blend saree with intricate work",
          productRecommendations: [],
          message: query,
          context: context || {},
          roomId: roomId
        }
      };
    }
  }

  /**
   * Chat with AI stylist
   */
  async chatWithAI(
    token: string,
    message: string,
    roomId?: string,
    context?: any
  ): Promise<AIChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          roomId,
          context: context || {}
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  }

  /**
   * Get outfit suggestions for wardrobe
   */
  async getOutfitSuggestions(
    token: string,
    wardrobeId: string,
    occasion?: string,
    budget?: number
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/outfit-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          wardrobeId,
          occasion,
          budget
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI outfit suggestions error:', error);
      throw error;
    }
  }

  /**
   * Get product recommendations
   */
  async getProductRecommendations(
    token: string,
    query: string,
    filters?: any
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/product-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          filters: filters || {}
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI product recommendations error:', error);
      throw error;
    }
  }

  /**
   * Analyze user's style preferences
   */
  async analyzeStyle(token: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/style-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI style analysis error:', error);
      throw error;
    }
  }
}

export const aiApi = new AIApi();
export default aiApi;
