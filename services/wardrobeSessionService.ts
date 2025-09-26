import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WardrobeItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  addedAt: Date;
  addedBy?: string; // User who added it during session
}

export interface SessionWardrobeState {
  callId: string;
  selectedWardrobe: string | null;
  pendingItems: WardrobeItem[];
  confirmedItems: WardrobeItem[];
}

class WardrobeSessionService {
  private sessionState: SessionWardrobeState | null = null;

  async initializeSession(callId: string, wardrobeId?: string) {
    this.sessionState = {
      callId,
      selectedWardrobe: wardrobeId || null,
      pendingItems: [],
      confirmedItems: []
    };
  }

  async selectWardrobe(wardrobeId: string): Promise<boolean> {
    if (!this.sessionState) return false;

    try {
      // Validate wardrobe exists and user has access
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/wardrobes/${wardrobeId}`,
        {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        this.sessionState.selectedWardrobe = wardrobeId;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error selecting wardrobe:', error);
      return false;
    }
  }

  async addProductToSession(productId: string): Promise<boolean> {
    if (!this.sessionState || !this.sessionState.selectedWardrobe) {
      throw new Error('No wardrobe selected for session');
    }

    try {
      // Get product details
      const productResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/products/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          }
        }
      );

      if (!productResponse.ok) {
        throw new Error('Product not found');
      }

      const product = await productResponse.json();

      // Create wardrobe item
      const wardrobeItem: WardrobeItem = {
        id: `temp_${Date.now()}`, // Temporary ID
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        category: product.category,
        addedAt: new Date(),
        addedBy: 'current-user' // Should get from auth context
      };

      // Add to pending items
      this.sessionState.pendingItems.push(wardrobeItem);

      // Try to add to wardrobe immediately
      const success = await this.confirmPendingItem(wardrobeItem.id);
      
      return success;
    } catch (error) {
      console.error('Error adding product to session:', error);
      return false;
    }
  }

  async confirmPendingItem(itemId: string): Promise<boolean> {
    if (!this.sessionState || !this.sessionState.selectedWardrobe) return false;

    const itemIndex = this.sessionState.pendingItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    const item = this.sessionState.pendingItems[itemIndex];

    try {
      // Add to wardrobe via API
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/wardrobes/${this.sessionState.selectedWardrobe}/items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          },
          body: JSON.stringify({
            productId: item.productId,
            notes: `Added during live session ${this.sessionState.callId}`,
            tags: ['live-session']
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        // Update item with real ID
        item.id = result.data.item.id;
        
        // Move from pending to confirmed
        this.sessionState.pendingItems.splice(itemIndex, 1);
        this.sessionState.confirmedItems.push(item);

        // Notify other participants via call API
        await this.notifyParticipants('item-added', item);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error confirming wardrobe item:', error);
      return false;
    }
  }

  async removePendingItem(itemId: string): Promise<boolean> {
    if (!this.sessionState) return false;

    const itemIndex = this.sessionState.pendingItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    this.sessionState.pendingItems.splice(itemIndex, 1);
    return true;
  }

  async removeConfirmedItem(itemId: string): Promise<boolean> {
    if (!this.sessionState || !this.sessionState.selectedWardrobe) return false;

    const itemIndex = this.sessionState.confirmedItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    try {
      // Remove from wardrobe via API
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/wardrobes/${this.sessionState.selectedWardrobe}/items/${itemId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const item = this.sessionState.confirmedItems[itemIndex];
        this.sessionState.confirmedItems.splice(itemIndex, 1);

        // Notify other participants
        await this.notifyParticipants('item-removed', item);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error removing wardrobe item:', error);
      return false;
    }
  }

  private async notifyParticipants(action: 'item-added' | 'item-removed', item: WardrobeItem) {
    if (!this.sessionState) return;

    try {
      // Notify via call API
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/calls/${this.sessionState.callId}/wardrobe-update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          },
          body: JSON.stringify({
            action,
            item: {
              id: item.id,
              productId: item.productId,
              name: item.name,
              brand: item.brand,
              price: item.price,
              image: item.image,
              addedBy: item.addedBy
            },
            wardrobeId: this.sessionState.selectedWardrobe
          })
        }
      );
    } catch (error) {
      console.error('Error notifying participants:', error);
    }
  }

  async getUserWardrobes(): Promise<any[]> {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/wardrobes`,
        {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result.data.wardrobes || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching wardrobes:', error);
      return [];
    }
  }

  async addMultipleProducts(productIds: string[]): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [], failed: [] };

    for (const productId of productIds) {
      const success = await this.addProductToSession(productId);
      if (success) {
        results.success.push(productId);
      } else {
        results.failed.push(productId);
      }
    }

    return results;
  }

  getSessionState(): SessionWardrobeState | null {
    return this.sessionState ? { ...this.sessionState } : null;
  }

  getPendingItems(): WardrobeItem[] {
    return this.sessionState?.pendingItems || [];
  }

  getConfirmedItems(): WardrobeItem[] {
    return this.sessionState?.confirmedItems || [];
  }

  getAllSessionItems(): WardrobeItem[] {
    if (!this.sessionState) return [];
    return [...this.sessionState.pendingItems, ...this.sessionState.confirmedItems];
  }

  getSelectedWardrobe(): string | null {
    return this.sessionState?.selectedWardrobe || null;
  }

  isItemInSession(productId: string): boolean {
    if (!this.sessionState) return false;
    
    return this.getAllSessionItems().some(item => item.productId === productId);
  }

  async finalizeLiveSession(): Promise<{ totalItems: number, wardrobeId: string | null }> {
    if (!this.sessionState) {
      return { totalItems: 0, wardrobeId: null };
    }

    const totalItems = this.sessionState.confirmedItems.length;
    const wardrobeId = this.sessionState.selectedWardrobe;

    // Clear session state
    this.sessionState = null;

    return { totalItems, wardrobeId };
  }

  cleanup() {
    this.sessionState = null;
  }
}

export const wardrobeSessionService = new WardrobeSessionService();
export default wardrobeSessionService;

