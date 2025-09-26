import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'friend' | 'ai' | 'maya' | 'system';
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isProduct?: boolean;
  productData?: any;
  reactions?: {
    thumbsUp: number;
    thumbsDown: number;
    userThumbsUp?: boolean;
    userThumbsDown?: boolean;
  };
}

class MessageStorage {
  private static instance: MessageStorage;
  private messages: Map<string, Message[]> = new Map();

  static getInstance(): MessageStorage {
    if (!MessageStorage.instance) {
      MessageStorage.instance = new MessageStorage();
    }
    return MessageStorage.instance;
  }

  // Save messages for a specific room
  async saveMessages(roomId: string, messages: Message[]): Promise<void> {
    try {
      const key = `messages_${roomId}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
      this.messages.set(roomId, messages);
      console.log(`💾 Saved ${messages.length} messages for room ${roomId}`);
    } catch (error) {
      console.error('❌ Error saving messages:', error);
    }
  }

  // Load messages for a specific room
  async loadMessages(roomId: string): Promise<Message[]> {
    try {
      const key = `messages_${roomId}`;
      const stored = await AsyncStorage.getItem(key);
      
      if (stored) {
        const messages = JSON.parse(stored);
        this.messages.set(roomId, messages);
        console.log(`📂 Loaded ${messages.length} messages for room ${roomId}`);
        return messages;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      return [];
    }
  }

  // Add a new message to a room
  async addMessage(roomId: string, message: Message): Promise<void> {
    try {
      const currentMessages = await this.loadMessages(roomId);
      const updatedMessages = [...currentMessages, message];
      await this.saveMessages(roomId, updatedMessages);
    } catch (error) {
      console.error('❌ Error adding message:', error);
    }
  }

  // Update a message (for reactions, etc.)
  async updateMessage(roomId: string, messageId: string, updates: Partial<Message>): Promise<void> {
    try {
      const currentMessages = await this.loadMessages(roomId);
      const updatedMessages = currentMessages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      await this.saveMessages(roomId, updatedMessages);
    } catch (error) {
      console.error('❌ Error updating message:', error);
    }
  }

  // Clear messages for a room
  async clearMessages(roomId: string): Promise<void> {
    try {
      const key = `messages_${roomId}`;
      await AsyncStorage.removeItem(key);
      this.messages.delete(roomId);
      console.log(`🗑️ Cleared messages for room ${roomId}`);
    } catch (error) {
      console.error('❌ Error clearing messages:', error);
    }
  }

  // Get message count for a room
  async getMessageCount(roomId: string): Promise<number> {
    try {
      const messages = await this.loadMessages(roomId);
      return messages.length;
    } catch (error) {
      console.error('❌ Error getting message count:', error);
      return 0;
    }
  }

  // Get all room IDs that have messages
  async getAllRoomIds(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const messageKeys = keys.filter(key => key.startsWith('messages_'));
      return messageKeys.map(key => key.replace('messages_', ''));
    } catch (error) {
      console.error('❌ Error getting room IDs:', error);
      return [];
    }
  }
}

export const messageStorage = MessageStorage.getInstance();
export default messageStorage;
