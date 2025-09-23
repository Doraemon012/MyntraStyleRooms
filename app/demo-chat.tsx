import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AIStylistMessage from '../components/AIStylistMessage';
import UserMessage from '../components/UserMessage';

// Mock messages for different scenarios
const mockScenarios = {
  party: [
    {
      id: '1',
      sender: 'user',
      text: 'What should I wear for a party?',
      timestamp: '3:50 PM',
      reactions: {
        thumbsUp: 0, thumbsDown: 0, heart: 0, laugh: 0, wow: 0, sad: 0,
        userThumbsUp: false, userThumbsDown: false, userHeart: false,
        userLaugh: false, userWow: false, userSad: false,
      }
    },
    {
      id: '2',
      sender: 'ai',
      text: 'Perfect for party wear! Here are some stunning options! 🎉',
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
        thumbsUp: 2, thumbsDown: 0, heart: 1, laugh: 0, wow: 0, sad: 0,
        userThumbsUp: false, userThumbsDown: false, userHeart: false,
        userLaugh: false, userWow: false, userSad: false,
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
        thumbsUp: 1, thumbsDown: 0, heart: 0, laugh: 0, wow: 0, sad: 0,
        userThumbsUp: false, userThumbsDown: false, userHeart: false,
        userLaugh: false, userWow: false, userSad: false,
      }
    }
  ],
  sports: [
    {
      id: '1',
      sender: 'user',
      text: 'Recommend sports wear for gym',
      timestamp: '3:50 PM',
      reactions: {
        thumbsUp: 0, thumbsDown: 0, heart: 0, laugh: 0, wow: 0, sad: 0,
        userThumbsUp: false, userThumbsDown: false, userHeart: false,
        userLaugh: false, userWow: false, userSad: false,
      }
    },
    {
      id: '2',
      sender: 'ai',
      text: 'Great choice for active wear! Here\'s what I recommend for sports and fitness: 💪',
      timestamp: '3:50 PM',
      productData: {
        name: 'Performance T-Shirt',
        brand: 'Nike',
        price: '₹1,299',
        originalPrice: '₹1,999',
        discount: '35% OFF',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
        rating: '4.5',
        reviews: '156',
        description: 'Moisture-wicking athletic tee for workouts'
      },
      reactions: {
        thumbsUp: 3, thumbsDown: 0, heart: 0, laugh: 0, wow: 0, sad: 0,
        userThumbsUp: false, userThumbsDown: false, userHeart: false,
        userLaugh: false, userWow: false, userSad: false,
      }
    }
  ],
  office: [
    {
      id: '1',
      sender: 'user',
      text: 'Need office wear suggestions',
      timestamp: '3:50 PM',
      reactions: {
        thumbsUp: 0, thumbsDown: 0, heart: 0, laugh: 0, wow: 0, sad: 0,
        userThumbsUp: false, userThumbsDown: false, userHeart: false,
        userLaugh: false, userWow: false, userSad: false,
      }
    },
    {
      id: '2',
      sender: 'ai',
      text: 'For office wear, you want to look professional yet stylish! Here are some great options: 👔',
      timestamp: '3:50 PM',
      productData: {
        name: 'Formal Blazer',
        brand: 'H&M',
        price: '₹2,499',
        originalPrice: '₹3,999',
        discount: '38% OFF',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        rating: '4.6',
        reviews: '234',
        description: 'Classic blazer perfect for office'
      },
      reactions: {
        thumbsUp: 1, thumbsDown: 0, heart: 0, laugh: 0, wow: 0, sad: 0,
        userThumbsUp: false, userThumbsDown: false, userHeart: false,
        userLaugh: false, userWow: false, userSad: false,
      }
    }
  ]
};

export default function DemoChatScreen() {
  const [currentScenario, setCurrentScenario] = useState<keyof typeof mockScenarios>('party');
  const [messages, setMessages] = useState(mockScenarios[currentScenario]);

  const handleScenarioChange = (scenario: keyof typeof mockScenarios) => {
    setCurrentScenario(scenario);
    setMessages(mockScenarios[scenario]);
  };

  const handleReaction = (messageId: string, reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => {
    console.log('Reaction:', messageId, reactionType);
    // In a real app, this would update the message reactions
  };

  const handleAddToWardrobe = (productData: any) => {
    console.log('Add to wardrobe:', productData);
    // In a real app, this would add the product to user's wardrobe
  };

  const handleShowMore = (productData: any) => {
    console.log('Show more:', productData);
    // In a real app, this would show more product details
  };

  const renderMessage = ({ item }: { item: any }) => {
    if (item.sender === 'user') {
      return (
        <UserMessage
          message={item}
          onReaction={handleReaction}
        />
      );
    } else if (item.sender === 'ai') {
      return (
        <AIStylistMessage
          message={item}
          onReaction={handleReaction}
          onAddToWardrobe={handleAddToWardrobe}
          onShowMore={handleShowMore}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Stylist Demo</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Scenario Selector */}
      <View style={styles.scenarioSelector}>
        <TouchableOpacity 
          style={[styles.scenarioButton, currentScenario === 'party' && styles.activeScenario]}
          onPress={() => handleScenarioChange('party')}
        >
          <Text style={[styles.scenarioText, currentScenario === 'party' && styles.activeScenarioText]}>
            Party Wear
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.scenarioButton, currentScenario === 'sports' && styles.activeScenario]}
          onPress={() => handleScenarioChange('sports')}
        >
          <Text style={[styles.scenarioText, currentScenario === 'sports' && styles.activeScenarioText]}>
            Sports Wear
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.scenarioButton, currentScenario === 'office' && styles.activeScenario]}
          onPress={() => handleScenarioChange('office')}
        >
          <Text style={[styles.scenarioText, currentScenario === 'office' && styles.activeScenarioText]}>
            Office Wear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <View style={styles.chatArea}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContainer}
        />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          💡 This is a demo of the AI Stylist group chat feature. In a real conversation, 
          users can ask fashion questions and the AI will provide personalized recommendations!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1a1a1a',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  scenarioSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  scenarioButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  activeScenario: {
    backgroundColor: '#E91E63',
  },
  scenarioText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeScenarioText: {
    color: 'white',
  },
  chatArea: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 8,
  },
  infoBanner: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  infoText: {
    fontSize: 12,
    color: '#1976d2',
    textAlign: 'center',
    lineHeight: 16,
  },
});
