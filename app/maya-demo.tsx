import MayaChat from '@/components/maya-chat';
import MayaTheme from '@/constants/maya-theme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'maya' | 'friend';
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isProduct?: boolean;
  productData?: {
    name: string;
    price: string;
    image: string;
    description?: string;
    images?: string[];
  };
  reactions?: {
    thumbsUp: number;
    thumbsDown: number;
    userThumbsUp?: boolean;
    userThumbsDown?: boolean;
  };
}

const demoMessages: Message[] = [
  {
    id: '1',
    text: 'How can I assist you today?',
    sender: 'maya',
    senderName: 'Maya(AI)',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    timestamp: '2:30 PM',
  },
  {
    id: '2',
    text: 'Hi',
    sender: 'user',
    senderName: 'You',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    timestamp: '2:31 PM',
  },
  {
    id: '3',
    text: 'Sure! Here are some recommendations for you.',
    sender: 'maya',
    senderName: 'Maya(AI)',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    timestamp: '2:31 PM',
  },
  {
    id: '4',
    text: '',
    sender: 'maya',
    senderName: 'Maya(AI)',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    timestamp: '2:31 PM',
    isProduct: true,
    productData: {
      name: 'Stylish Sneakers',
      price: '₹3,999',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
      description: 'Step out in style with these stylish sneakers that offer both comfort and flair. Perfect for casual outings or workouts, they will keep you looking fresh and trendy.',
      images: [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
      ]
    },
    reactions: {
      thumbsUp: 2,
      thumbsDown: 0,
    },
  },
  {
    id: '5',
    text: 'Could you please tell me what gender options you are looking for?',
    sender: 'user',
    senderName: 'You',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    timestamp: '2:32 PM',
  },
  {
    id: '6',
    text: 'Here are more trendy options for you.',
    sender: 'maya',
    senderName: 'Maya(AI)',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    timestamp: '2:33 PM',
  },
  {
    id: '7',
    text: '',
    sender: 'maya',
    senderName: 'Maya(AI)',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    timestamp: '2:33 PM',
    isProduct: true,
    productData: {
      name: 'Chic Crossbody Bag',
      price: '₹2,499',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
      description: 'Stay stylish and hands-free with this chic crossbody bag. Its sleek design and practical size make it perfect for day-to-night transitions.',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
      ]
    },
    reactions: {
      thumbsUp: 1,
      thumbsDown: 0,
    },
  },
];

export default function MayaDemoScreen() {
  const [messages, setMessages] = useState<Message[]>(demoMessages);

  const handleSendMessage = (text: string) => {
    const now = new Date();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      senderName: 'You',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate Maya AI response
    if (text.toLowerCase().includes('@maya') || text.toLowerCase().includes('recommend')) {
      setTimeout(() => {
        const aiResponseTime = new Date();
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'I found some beautiful options for you! Here\'s a stunning piece from Myntra\'s collection.',
          sender: 'maya',
          senderName: 'Maya(AI)',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          timestamp: aiResponseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isProduct: true,
          productData: {
            name: 'Elegant Wall Art Piece',
            price: '₹1,999',
            image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=400&fit=crop',
            description: 'Transform your living space into a gallery with this elegant wall art piece. Its vibrant colors and unique design will add character to any room.',
            images: [
              'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=400&fit=crop',
              'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
              'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=400&fit=crop',
            ]
          },
          reactions: {
            thumbsUp: 0,
            thumbsDown: 0,
          },
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1500);
    }
  };

  const handleProductAction = (action: string, productData: any) => {
    console.log('Product action:', action, productData);
    
    if (action === 'ask_more') {
      const now = new Date();
      const askMoreResponse: Message = {
        id: Date.now().toString(),
        text: `Tell me more about what you're looking for in ${productData.name.toLowerCase()}. I can help you find similar items or suggest alternatives!`,
        sender: 'maya',
        senderName: 'Maya(AI)',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, askMoreResponse]);
    }
  };

  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  return (
    <View style={styles.container}>
      <MayaChat
        roomName="Maya"
        onBack={() => router.back()}
        onMenuPress={handleMenuPress}
        messages={messages}
        onSendMessage={handleSendMessage}
        onProductAction={handleProductAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MayaTheme.colors.background,
  },
});
