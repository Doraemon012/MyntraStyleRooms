import React from 'react';
import { StyleSheet, View } from 'react-native';
import AIStylistMessage from './AIStylistMessage';
import UserMessage from './UserMessage';

// Mock data for demo purposes
const mockMessages = [
  {
    id: '1',
    sender: 'user',
    text: 'Help me with ethnic styling',
    timestamp: '3:50 PM',
    reactions: {
      thumbsUp: 0,
      thumbsDown: 0,
      heart: 0,
      laugh: 0,
      wow: 0,
      sad: 0,
      userThumbsUp: false,
      userThumbsDown: false,
      userHeart: false,
      userLaugh: false,
      userWow: false,
      userSad: false,
    }
  },
  {
    id: '2',
    sender: 'ai',
    text: 'Perfect for ethnic wear! Here are some stunning options! 🎉',
    timestamp: '3:50 PM',
    productData: {
      name: 'Designer Banarasi Saree',
      brand: 'Manyavar',
      price: '₹8999',
      originalPrice: '₹12999',
      discount: '31% OFF',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
      rating: '4.7',
      reviews: '89',
      description: 'Luxurious Banarasi saree with intricate zari work'
    },
    reactions: {
      thumbsUp: 2,
      thumbsDown: 0,
      heart: 1,
      laugh: 0,
      wow: 0,
      sad: 0,
      userThumbsUp: false,
      userThumbsDown: false,
      userHeart: false,
      userLaugh: false,
      userWow: false,
      userSad: false,
    }
  },
  {
    id: '3',
    sender: 'ai',
    text: '',
    timestamp: '3:50 PM',
    productData: {
      name: 'Silk Blend Saree',
      brand: 'Soch',
      price: '₹4999',
      originalPrice: '₹6999',
      discount: '29% OFF',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      rating: '4.6',
      reviews: '145',
      description: 'Elegant silk blend saree with intricate work perfect for weddings and festivals'
    },
    reactions: {
      thumbsUp: 1,
      thumbsDown: 0,
      heart: 0,
      laugh: 0,
      wow: 0,
      sad: 0,
      userThumbsUp: false,
      userThumbsDown: false,
      userHeart: false,
      userLaugh: false,
      userWow: false,
      userSad: false,
    }
  }
];

interface MockChatDemoProps {
  onReaction: (messageId: string, reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => void;
  onAddToWardrobe: (productData: any) => void;
  onShowMore: (productData: any) => void;
}

export default function MockChatDemo({ onReaction, onAddToWardrobe, onShowMore }: MockChatDemoProps) {
  return (
    <View style={styles.container}>
      {mockMessages.map((message) => {
        if (message.sender === 'user') {
          return (
            <UserMessage
              key={message.id}
              message={message}
              onReaction={onReaction}
            />
          );
        } else if (message.sender === 'ai') {
          return (
            <AIStylistMessage
              key={message.id}
              message={message}
              onReaction={onReaction}
              onAddToWardrobe={onAddToWardrobe}
              onShowMore={onShowMore}
            />
          );
        }
        return null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
