import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'friend' | 'ai';
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isProduct?: boolean;
  productData?: {
    name: string;
    price: string;
    image: string;
    description?: string;
  };
  reactions?: {
    thumbsUp: number;
    thumbsDown: number;
    userThumbsUp?: boolean;
    userThumbsDown?: boolean;
  };
}

interface Room {
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


const mockMessages: Message[] = [
  {
    id: '1',
    text: '@Maya Looking for some ethnic wear for the wedding',
    sender: 'user',
    senderName: 'You',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    text: 'What\'s your Budget range?',
    sender: 'ai',
    senderName: 'Maya(AI)',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    timestamp: '11:25',

  },
  {
    id: '3',
    text: 'Around ₹5,000 would be perfect!',
    sender: 'user',
    senderName: 'You',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    timestamp: '10:30 AM',
  },
  {
    id: '4',
    text: 'I found some beautiful sarees in your budget! Here\'s a stunning red silk saree that would be perfect for the wedding.',
    sender: 'ai',
    senderName: 'Maya(AI)',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    timestamp: '11:25',
    isProduct: true,
    productData: {
      name: 'Red Silk Saree with Golden Border',
      price: '₹4,999',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&crop=face',
      description: 'Elegant red silk saree with intricate golden border work',
    },
    reactions: {
      thumbsUp: 2,
      thumbsDown: 2,
      userThumbsUp: false,
      userThumbsDown: false,
    },
  },
  {
    id: '5',
    text: 'I think it would look good on you',
    sender: 'friend',
    senderName: 'Richa',
    senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    timestamp: '11:25',
  },
  {
    id: '6',
    text: '++',
    sender: 'friend',
    senderName: 'Neyati',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    timestamp: '11:25',
  },
];

// Mock room data that matches the rooms from index page
const mockRooms: Record<string, { name: string; memberCount: number }> = {
  '1': { name: 'College Freshers Party', memberCount: 12 },
  '2': { name: 'Wedding Shopping', memberCount: 8 },
  '3': { name: 'Family Wedding', memberCount: 25 },
  '4': { name: 'Friends Reunion', memberCount: 18 },
  '5': { name: 'Work Conference', memberCount: 7 },
};


export default function RoomChatScreen() {
  const { id } = useLocalSearchParams();
  const roomData = mockRooms[id as string] || mockRooms['1'];
  
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  
  // Fetch room data from API with better error handling
  const fetchRoomData = async () => {
    try {
      setLoading(true);
      
      // For development, we'll use mock data directly to avoid network errors
      // In production, you would uncomment the API call below
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use mock data directly for now
      const mockRoomData = mockRooms[id as string];
      if (mockRoomData) {
        setRoom({
          _id: id as string,
          name: mockRoomData.name,
          emoji: getRoomEmoji(id as string),
          members: generateMockMembers(mockRoomData.memberCount - 1),
          owner: { _id: '1', name: 'Room Owner', email: 'owner@example.com' },
          isPrivate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        setRoom(null);
      }
      
      /* 
      // Uncomment this section when your backend is running
      const API_BASE_URL = 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authToken}` // Add when auth is implemented
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoom(data.data.room);
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
      */
      
    } catch (error) {
      console.log('Using mock data for room:', id);
      // Fallback to mock data
      const mockRoomData = mockRooms[id as string];
      if (mockRoomData) {
        setRoom({
          _id: id as string,
          name: mockRoomData.name,
          emoji: getRoomEmoji(id as string),
          members: generateMockMembers(mockRoomData.memberCount - 1),
          owner: { _id: '1', name: 'Room Owner', email: 'owner@example.com' },
          isPrivate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        setRoom(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get room emoji based on ID
  const getRoomEmoji = (roomId: string): string => {
    const emojiMap: Record<string, string> = {
      '1': '🎉',
      '2': '👰',
      '3': '👗',
      '4': '🌟',
      '5': '💼',
    };
    return emojiMap[roomId] || '👗';
  };
  
  // Helper function to generate mock members
  const generateMockMembers = (count: number) => {
    const mockNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    return Array.from({ length: Math.min(count, mockNames.length) }, (_, index) => ({
      userId: {
        _id: `member_${index + 1}`,
        name: mockNames[index] || `Member ${index + 1}`,
        email: `${mockNames[index]?.toLowerCase() || `member${index + 1}`}@example.com`,
        profileImage: undefined,
      },
      role: 'Contributor' as const,
      joinedAt: new Date().toISOString(),
    }));
  };
  
  useEffect(() => {
    fetchRoomData();
  }, [id]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: 'user',
        senderName: 'You',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Check if message mentions Maya AI
      if (inputText.toLowerCase().includes('@maya') || inputText.toLowerCase().includes('@mayaai')) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
            text: 'I found some beautiful options for you! Here\'s a stunning piece from Myntra\'s collection.',
          sender: 'ai',
            senderName: 'Maya(AI)',
            senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isProduct: true,
            productData: {
              name: 'Designer Ethnic Wear',
              price: '₹3,999',
              image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=400&fit=crop&crop=face',
              description: 'Beautiful ethnic wear perfect for special occasions',
            },
            reactions: {
              thumbsUp: 0,
              thumbsDown: 0,
            },
        };
        setMessages(prev => [...prev, aiResponse]);
        }, 1500);
      }
    }
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    switch (action) {
      case 'addMembers':
        // Navigate to add members screen
        break;
      case 'startSession':
        // Start a styling session
        break;
      case 'wardrobe':
        // Navigate to wardrobe
        router.push('/wardrobes');
        break;
      case 'roomSettings':
        // Navigate to room settings
        break;
    }
  };

  const handleReaction = (messageId: string, reactionType: 'thumbsUp' | 'thumbsDown') => {
    setMessages(prevMessages => 
      prevMessages.map(message => {
        if (message.id === messageId && message.reactions) {
          const currentReactions = message.reactions;
          let newThumbsUp = currentReactions.thumbsUp;
          let newThumbsDown = currentReactions.thumbsDown;
          let newUserThumbsUp = currentReactions.userThumbsUp || false;
          let newUserThumbsDown = currentReactions.userThumbsDown || false;

          if (reactionType === 'thumbsUp') {
            if (newUserThumbsUp) {
              // User is unliking
              newThumbsUp = Math.max(0, newThumbsUp - 1);
              newUserThumbsUp = false;
            } else {
              // User is liking
              newThumbsUp += 1;
              newUserThumbsUp = true;
              // If user was disliking, remove dislike
              if (newUserThumbsDown) {
                newThumbsDown = Math.max(0, newThumbsDown - 1);
                newUserThumbsDown = false;
              }
            }
          } else if (reactionType === 'thumbsDown') {
            if (newUserThumbsDown) {
              // User is undisliking
              newThumbsDown = Math.max(0, newThumbsDown - 1);
              newUserThumbsDown = false;
            } else {
              // User is disliking
              newThumbsDown += 1;
              newUserThumbsDown = true;
              // If user was liking, remove like
              if (newUserThumbsUp) {
                newThumbsUp = Math.max(0, newThumbsUp - 1);
                newUserThumbsUp = false;
              }
            }
          }

          return {
            ...message,
            reactions: {
              thumbsUp: newThumbsUp,
              thumbsDown: newThumbsDown,
              userThumbsUp: newUserThumbsUp,
              userThumbsDown: newUserThumbsDown,
            }
          };
        }
        return message;
      })
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender === 'user';
    
    return (
      <View style={styles.messageWrapper}>
        {!isUserMessage && (
          <View style={styles.messageHeader}>
            <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />

        <Text style={styles.senderName}>{item.senderName}</Text>
          </View>
      )}
      
        {isUserMessage ? (
          <LinearGradient
            colors={['#E91E63', '#FF6B9D', '#FF8A9B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.messageContainer, styles.userMessage]}
          >
      {item.isProduct && item.productData ? (
        <View style={styles.productCard}>
                <Image source={{ uri: item.productData.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.productData.name}</Text>
                  <Text style={styles.productPrice}>{item.productData.price}</Text>
                </View>
                <View style={styles.productActions}>
                  <LinearGradient
                    colors={['#E91E63', '#FF6B9D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addToWardrobeBtn}
                  >
                    <TouchableOpacity style={styles.addToWardrobeBtnInner}>
                      <Text style={styles.addToWardrobeText}>Add to Wardrobe</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                  <TouchableOpacity style={styles.showMoreBtn}>
                    <Text style={styles.showMoreText}>Show more options</Text>
                  </TouchableOpacity>
                </View>
                {item.reactions && (
                  <View style={styles.reactions}>
                    <TouchableOpacity 
                      style={[
                        styles.reactionButton,
                        item.reactions.userThumbsUp && styles.reactionButtonActive
                      ]}
                      onPress={() => handleReaction(item.id, 'thumbsUp')}
                    >
                      <Text style={[
                        styles.reactionIcon,
                        item.reactions.userThumbsUp && styles.reactionIconActive
                      ]}>
                        👍
                      </Text>
                      <Text style={styles.reactionCount}>{item.reactions.thumbsUp}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.reactionButton,
                        item.reactions.userThumbsDown && styles.reactionButtonActive
                      ]}
                      onPress={() => handleReaction(item.id, 'thumbsDown')}
                    >
                      <Text style={[
                        styles.reactionIcon,
                        item.reactions.userThumbsDown && styles.reactionIconActive
                      ]}>
                        👎
                      </Text>
                      <Text style={styles.reactionCount}>{item.reactions.thumbsDown}</Text>
                    </TouchableOpacity>
                  </View>
                )}
          </View>
            ) : (
              <Text style={styles.userMessageText}>
                {item.text}
              </Text>
            )}
          </LinearGradient>
        ) : (
          <View style={[styles.messageContainer, styles.otherMessage]}>
            {item.isProduct && item.productData ? (
              <View style={styles.productCard}>
                <Image source={{ uri: item.productData.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.productData.name}</Text>
            <Text style={styles.productPrice}>{item.productData.price}</Text>
          </View>
                <View style={styles.productActions}>
                  <LinearGradient
                    colors={['#E91E63', '#FF6B9D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addToWardrobeBtn}
                  >
                    <TouchableOpacity style={styles.addToWardrobeBtnInner}>
            <Text style={styles.addToWardrobeText}>Add to Wardrobe</Text>
          </TouchableOpacity>
                  </LinearGradient>
                  <TouchableOpacity style={styles.showMoreBtn}>
                    <Text style={styles.showMoreText}>Show more options</Text>
                  </TouchableOpacity>
                </View>
                {item.reactions && (
                  <View style={styles.reactions}>
                    <TouchableOpacity 
                      style={[
                        styles.reactionButton,
                        item.reactions.userThumbsUp && styles.reactionButtonActive
                      ]}
                      onPress={() => handleReaction(item.id, 'thumbsUp')}
                    >
                      <Text style={[
                        styles.reactionIcon,
                        item.reactions.userThumbsUp && styles.reactionIconActive
                      ]}>
                        👍
                      </Text>
                      <Text style={styles.reactionCount}>{item.reactions.thumbsUp}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.reactionButton,
                        item.reactions.userThumbsDown && styles.reactionButtonActive
                      ]}
                      onPress={() => handleReaction(item.id, 'thumbsDown')}
                    >
                      <Text style={[
                        styles.reactionIcon,
                        item.reactions.userThumbsDown && styles.reactionIconActive
                      ]}>
                        👎
                      </Text>
                      <Text style={styles.reactionCount}>{item.reactions.thumbsDown}</Text>
                    </TouchableOpacity>
                  </View>
                )}
        </View>
      ) : (
              <Text style={styles.otherMessageText}>
                {item.text}
              </Text>
            )}
          </View>
        )}
        
        <Text style={[
          styles.timestamp,
          isUserMessage ? styles.userTimestamp : styles.otherTimestamp
        ]}>
          {item.timestamp}
        </Text>
    </View>

  );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff6b6b" />
            <Text style={styles.loadingText}>Loading room...</Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!room) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Room not found</Text>
            <TouchableOpacity style={styles.backButtonStyle} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
           <Text style={styles.roomTitle}>
             {room ? room.name : 'Room'}
           </Text>
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Text style={styles.menuButton}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <View style={styles.chatArea}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
        </View>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message here..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>✈️</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        {/* Menu Modal */}
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.menuContainer}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuAction('addMembers')}
              >
                <Text style={styles.menuIcon}>👥</Text>
                <Text style={styles.menuText}>Add Members</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuAction('startSession')}
              >
                <Text style={styles.menuIcon}>⏱️</Text>
                <Text style={styles.menuText}>Start Session</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuAction('wardrobe')}
              >
                <Text style={styles.menuIcon}>🗄️</Text>
                <Text style={styles.menuText}>Wardrobe</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuAction('roomSettings')}
              >
                <Text style={styles.menuIcon}>⚙️</Text>
                <Text style={styles.menuText}>Room Settings</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </View>

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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  menuButton: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    paddingBottom: 16,
  },
  messageWrapper: {
    marginVertical: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    marginLeft: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  messageContainer: {
    padding: 8,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginLeft: '15%',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    marginRight: '15%',
  },
  userMessageText: {
    fontSize: 13,
    color: 'white',
    lineHeight: 18,
  },
  otherMessageText: {
    fontSize: 13,
    color: '#000',
    lineHeight: 18,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  userTimestamp: {
    alignSelf: 'flex-end',
    marginRight: '15%',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherTimestamp: {
    alignSelf: 'flex-start',
    marginLeft: 6,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  productActions: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 6,
  },
  addToWardrobeBtn: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  addToWardrobeBtnInner: {
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToWardrobeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  showMoreBtn: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E91E63',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  showMoreText: {
    color: '#E91E63',
    fontSize: 11,
    fontWeight: '600',
  },
  reactions: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 6,
    gap: 12,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: 'transparent',
  },
  reactionButtonActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  reactionIcon: {
    fontSize: 12,
  },
  reactionIconActive: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    gap: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#000',
    maxHeight: 80,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  wardrobeModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  selectedProductInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectedProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  selectedProductPrice: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  wardrobeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  wardrobeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  wardrobeInfo: {
    flex: 1,
  },
  wardrobeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  wardrobeCount: {
    fontSize: 12,
    color: '#666',
  },
  addIcon: {
    fontSize: 20,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  createNewWardrobe: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    marginTop: 8,
  },
  createNewText: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  reactionModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    minWidth: 280,
  },
  reactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  reactionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  reactionOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  reactionEmojiLarge: {
    fontSize: 24,
  },
  backButtonStyle: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
});