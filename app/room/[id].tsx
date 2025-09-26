import MayaChat from '@/components/maya-chat';
import { ThemedView } from '@/components/themed-view';
import MayaTheme from '@/constants/maya-theme';
import { roomAPI } from '@/services/api';
import messageStorage from '@/services/messageStorage';
import socketService from '@/services/socketService';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'friend' | 'ai' | 'maya' | 'system';
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


// Helper function to format timestamp
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (messageDate.getTime() === today.getTime()) {
    // Today - show only time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    // Not today - show date and time
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr}, ${timeStr}`;
  }
};

const mockMessages: Message[] = [
  {
    id: '1',
    text: '@Maya Looking for some ethnic wear for the wedding',
    sender: 'user',
    senderName: 'You',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    timestamp: formatTimestamp(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
  },
  {
    id: '2',
    text: 'What\'s your Budget range?',
    sender: 'ai',
    senderName: 'Maya(AI)',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    timestamp: formatTimestamp(new Date(Date.now() - 1 * 60 * 60 * 1000)), // 1 hour ago
  },
  {
    id: '3',
    text: 'Around ₹5,000 would be perfect!',
    sender: 'user',
    senderName: 'You',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    timestamp: formatTimestamp(new Date(Date.now() - 30 * 60 * 1000)), // 30 minutes ago
  },
  {
    id: '4',
    text: 'I found some beautiful sarees in your budget! Here\'s a stunning red silk saree that would be perfect for the wedding.',
    sender: 'ai',
    senderName: 'Maya(AI)',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    timestamp: formatTimestamp(new Date(Date.now() - 15 * 60 * 1000)), // 15 minutes ago
    isProduct: true,
        productData: {
          name: 'Red Silk Saree with Golden Border',
          price: '₹4,999',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop',
          description: 'Elegant red silk saree with intricate golden border work, perfect for weddings and festive events. Made from luxurious silk with traditional zari weaving.',
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
    timestamp: formatTimestamp(new Date(Date.now() - 10 * 60 * 1000)), // 10 minutes ago
  },
  {
    id: '6',
    text: '++',
    sender: 'friend',
    senderName: 'Neyati',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    timestamp: formatTimestamp(new Date(Date.now() - 5 * 60 * 1000)), // 5 minutes ago
  },
  {
    id: '7',
    text: 'That saree is gorgeous! I love the golden border work',
    sender: 'friend',
    senderName: 'Priya',
    senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    timestamp: formatTimestamp(new Date(Date.now() - 3 * 60 * 1000)), // 3 minutes ago
  },
  {
    id: '8',
    text: 'I have a similar one from last year, it\'s really comfortable!',
    sender: 'friend',
    senderName: 'Sneha',
    senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    timestamp: formatTimestamp(new Date(Date.now() - 2 * 60 * 1000)), // 2 minutes ago
  },
  {
    id: '9',
    text: 'Great choice! This saree looks perfect for the occasion.',
    sender: 'friend',
    senderName: 'Ananya',
    senderAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
    timestamp: formatTimestamp(new Date(Date.now() - 1 * 60 * 1000)), // 1 minute ago
  },
  {
    id: '10',
    text: 'Thanks for the suggestions everyone!',
    sender: 'user',
    senderName: 'You',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    timestamp: formatTimestamp(new Date(Date.now() - 30 * 1000)), // 30 seconds ago
  },
];

// Mock room data that matches the rooms from index page
const mockRooms: Record<string, { name: string; memberCount: number; hasActiveSession?: boolean; sessionHost?: string }> = {
  '1': { name: 'College Freshers Party', memberCount: 12 },
  '2': { name: 'Wedding Shopping', memberCount: 8 },
  '3': { name: 'Family Wedding', memberCount: 25, hasActiveSession: true, sessionHost: 'Mom' },
  '4': { name: 'Friends Reunion', memberCount: 18, hasActiveSession: true, sessionHost: 'Sarah' },
  '5': { name: 'Work Conference', memberCount: 7 },
};


export default function RoomChatScreen() {
  const { id } = useLocalSearchParams();
  const roomId = id as string || '1'; // Default to room '1' if id is undefined
  const roomData = mockRooms[roomId] || mockRooms['1'];
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  
  // Load messages from storage
  const loadMessages = async () => {
    try {
      const storedMessages = await messageStorage.loadMessages(roomId);
      
      if (storedMessages.length > 0) {
        // Load saved messages
        setMessages(storedMessages);
        console.log(`📂 Loaded ${storedMessages.length} saved messages for room ${roomId}`);
      } else {
        // No saved messages, use initial messages based on room type
        const isExistingRoom = roomId && ['1', '2', '3', '4', '5'].includes(roomId);
        const initialMessages = isExistingRoom ? mockMessages : [
          // Welcome message for new rooms
          {
            id: 'welcome-1',
            text: 'Welcome to your new room! Start chatting with your friends.',
            sender: 'system' as 'user' | 'friend' | 'ai' | 'maya',
            senderName: 'System',
            senderAvatar: 'https://ui-avatars.com/api/?name=S&background=28A745&color=FFFFFF&size=150',
            timestamp: formatTimestamp(new Date()),
          }
        ];
        setMessages(initialMessages);
        
        // Save initial messages
        await messageStorage.saveMessages(roomId, initialMessages);
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      // Fallback to empty messages
      setMessages([]);
    }
  };
  
  // Fetch room data from API with better error handling
  const fetchRoomData = async () => {
    try {
      setLoading(true);
      
      // Validate that id exists before making API call
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid room ID');
      }
      
      const response = await roomAPI.getById(id);
      
      if (response.status === 'success') {
        setRoom(response.data.room);
      } else {
        throw new Error(response.message || 'Failed to fetch room data');
      }
      
    } catch (error) {
      console.error('Error fetching room data:', error);
      // Fallback to mock data for existing rooms, or create new room data
      const roomId = id as string || '1'; // Default to room '1' if id is undefined
      const mockRoomData = mockRooms[roomId];
      if (mockRoomData) {
        // Existing room with mock data
        setRoom({
          _id: roomId,
          name: mockRoomData.name,
          emoji: getRoomEmoji(roomId),
          members: generateMockMembers(mockRoomData.memberCount - 1),
          owner: { _id: '1', name: 'Room Owner', email: 'owner@example.com' },
          isPrivate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        // New room - create basic room data
        setRoom({
          _id: roomId,
          name: `Room ${roomId}`,
          emoji: '💬',
          members: [],
          owner: { _id: '1', name: 'Room Owner', email: 'owner@example.com' },
          isPrivate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
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
  
  // Initialize Socket.IO connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketService.initialize({
          onConnect: () => {
            console.log('✅ Socket connected');
            setSocketConnected(true);
            // Join the room when connected
            socketService.joinRoom(roomId);
          },
          onDisconnect: () => {
            console.log('❌ Socket disconnected');
            setSocketConnected(false);
          },
          onMessage: async (message) => {
            console.log('💬 Received real-time message:', message.text);
            const newMessage: Message = {
              id: message.id,
              text: message.text,
              sender: message.sender as 'user' | 'friend' | 'ai' | 'maya',
              senderName: message.senderName,
              senderAvatar: message.senderAvatar,
              timestamp: formatTimestamp(new Date(message.timestamp)),
              isProduct: message.messageType === 'product',
              productData: message.productData,
              reactions: message.reactions
            };
            
            setMessages(prev => [...prev, newMessage]);
            
            // Save incoming message to storage
            await messageStorage.addMessage(roomId, newMessage);
          },
          onTypingStart: (user) => {
            setTypingUsers(prev => {
              if (!prev.includes(user.userName)) {
                return [...prev, user.userName];
              }
              return prev;
            });
          },
          onTypingStop: (user) => {
            setTypingUsers(prev => prev.filter(name => name !== user.userName));
          },
          onUserJoined: (user) => {
            console.log('👋 User joined:', user.userName);
            // You can add a system message here if needed
          },
          onUserLeft: (user) => {
            console.log('👋 User left:', user.userName);
            // You can add a system message here if needed
          },
          onReactionUpdate: (data) => {
            console.log('👍 Reaction updated:', data);
            // Handle reaction updates
            setMessages(prev => prev.map(msg => {
              if (msg.id === data.messageId) {
                // Update reactions based on the data
                return {
                  ...msg,
                  reactions: {
                    ...msg.reactions,
                    thumbsUp: data.reactionType === 'thumbsUp' ? 
                      (msg.reactions?.thumbsUp || 0) + 1 : 
                      (msg.reactions?.thumbsUp || 0),
                    thumbsDown: data.reactionType === 'thumbsDown' ? 
                      (msg.reactions?.thumbsDown || 0) + 1 : 
                      (msg.reactions?.thumbsDown || 0)
                  }
                };
              }
              return msg;
            }));
          },
          onError: (error) => {
            console.error('❌ Socket error:', error);
          }
        });
      } catch (error) {
        console.error('❌ Failed to initialize socket:', error);
      }
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      socketService.leaveRoom(roomId);
      socketService.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    loadMessages();
    fetchRoomData();
  }, [id]);

  // Refresh room data when screen comes into focus (e.g., returning from settings)
  useFocusEffect(
    React.useCallback(() => {
      fetchRoomData();
    }, [id])
  );

  const sendMessage = async () => {
    if (inputText.trim()) {
      const now = new Date();
      const messageText = inputText.trim();
      
      // Create local message immediately for better UX
      const newMessage: Message = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: messageText,
        sender: 'user',
        senderName: 'You',
        senderAvatar: 'https://ui-avatars.com/api/?name=You&background=FF6B9D&color=FFFFFF&size=150',
        timestamp: formatTimestamp(now),
      };
      
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setInputText('');
      
      // Save message to storage
      await messageStorage.addMessage(roomId, newMessage);
      
      // Send message via Socket.IO for real-time delivery
      if (socketConnected) {
        socketService.sendMessage({
          text: messageText,
          sender: 'user',
          senderName: 'You',
          senderAvatar: 'https://ui-avatars.com/api/?name=You&background=FF6B9D&color=FFFFFF&size=150',
          roomId: roomId,
          messageType: 'text'
        });
      }
      
      // Check if message mentions Maya AI
      if (messageText.toLowerCase().includes('@maya') || messageText.toLowerCase().includes('@mayaai')) {
        setTimeout(async () => {
          const aiResponseTime = new Date();
          const aiResponse: Message = {
            id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: 'I found some beautiful options for you! Here\'s a stunning piece from Myntra\'s collection.',
            sender: 'ai',
            senderName: 'Maya(AI)',
            senderAvatar: 'https://ui-avatars.com/api/?name=AI&background=4A90E2&color=FFFFFF&size=150',
            timestamp: formatTimestamp(aiResponseTime),
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
          const updatedMessagesWithAI = [...messages, newMessage, aiResponse];
          setMessages(updatedMessagesWithAI);
          
          // Save AI response to storage
          await messageStorage.addMessage(roomId, aiResponse);
          
          // Broadcast AI response to all users in the room via Socket.IO
          if (socketConnected) {
            socketService.sendMessage({
              text: aiResponse.text,
              sender: 'ai',
              senderName: 'Maya(AI)',
              senderAvatar: 'https://ui-avatars.com/api/?name=AI&background=4A90E2&color=FFFFFF&size=150',
              roomId: roomId,
              messageType: 'product',
              productData: aiResponse.productData,
              reactions: aiResponse.reactions
            });
          }
        }, 1500);
      }
    }
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    switch (action) {
      case 'startSession':
        // Start a styling session
        router.push('/start-session');
        break;
      case 'joinSession':
        // Join an existing session
        router.push(`/join-session?roomId=${id}&sessionHost=${roomData?.sessionHost || 'Host'}`);
        break;
      case 'wardrobe':
        // Navigate to wardrobe
        router.push('/wardrobes');
        break;
      case 'roomSettings':
        // Navigate to room settings
        router.push(`/room/settings?id=${id}`);
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
            colors={['#E91E63', '#FF6B9D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.messageContainer, styles.userMessage]}
          >
            <View style={styles.messageContent}>
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
                        <Image 
                          source={require('@/assets/images/thumbs_up_icon.png')} 
                          style={[
                            styles.reactionIcon,
                            item.reactions.userThumbsUp && styles.reactionIconActive
                          ]}
                          resizeMode="contain"
                        />
                        <Text style={styles.reactionCount}>{item.reactions.thumbsUp}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.reactionButton,
                          item.reactions.userThumbsDown && styles.reactionButtonActive
                        ]}
                        onPress={() => handleReaction(item.id, 'thumbsDown')}
                      >
                        <Image 
                          source={require('@/assets/images/thumbs_down_icon.png')} 
                          style={[
                            styles.reactionIcon,
                            item.reactions.userThumbsDown && styles.reactionIconActive
                          ]}
                          resizeMode="contain"
                        />
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
              <Text style={styles.userTimestamp}>
                {item.timestamp}
              </Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.messageContainer, styles.otherMessage]}>
            <View style={styles.messageContent}>
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
                        <Image 
                          source={require('@/assets/images/thumbs_up_icon.png')} 
                          style={[
                            styles.reactionIcon,
                            item.reactions.userThumbsUp && styles.reactionIconActive
                          ]}
                          resizeMode="contain"
                        />
                        <Text style={styles.reactionCount}>{item.reactions.thumbsUp}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.reactionButton,
                          item.reactions.userThumbsDown && styles.reactionButtonActive
                        ]}
                        onPress={() => handleReaction(item.id, 'thumbsDown')}
                      >
                        <Image 
                          source={require('@/assets/images/thumbs_down_icon.png')} 
                          style={[
                            styles.reactionIcon,
                            item.reactions.userThumbsDown && styles.reactionIconActive
                          ]}
                          resizeMode="contain"
                        />
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
              <Text style={styles.otherTimestamp}>
                {item.timestamp}
              </Text>
            </View>
          </View>
        )}
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

  // Convert existing messages to Maya format
  const mayaMessages: Message[] = messages.map(msg => ({
    ...msg,
    sender: msg.sender === 'ai' ? 'maya' : msg.sender,
    senderName: msg.sender === 'ai' ? 'Maya(AI)' : msg.senderName,
    productData: msg.isProduct && msg.productData ? {
      ...msg.productData,
      images: [
        msg.productData.image,
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
      ]
    } : undefined,
  }));

  const handleSendMessage = async (text: string) => {
    const now = new Date();
    const messageText = text.trim();
    
    // Create local message immediately for better UX
    const newMessage: Message = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: messageText,
      sender: 'user',
      senderName: 'You',
      senderAvatar: 'https://ui-avatars.com/api/?name=You&background=FF6B9D&color=FFFFFF&size=150',
      timestamp: formatTimestamp(now),
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Save message to storage
    await messageStorage.addMessage(roomId, newMessage);
    
    // Send message via Socket.IO for real-time delivery
    if (socketConnected) {
      socketService.sendMessage({
        text: messageText,
        sender: 'user',
        senderName: 'You',
        senderAvatar: 'https://ui-avatars.com/api/?name=You&background=FF6B9D&color=FFFFFF&size=150',
        roomId: roomId,
        messageType: 'text'
      });
    }
    
    // Check if message mentions Maya AI
    if (messageText.toLowerCase().includes('@maya') || messageText.toLowerCase().includes('@mayaai')) {
      setTimeout(async () => {
        const aiResponseTime = new Date();
        const aiResponse: Message = {
          id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: 'I found some beautiful options for you! Here\'s a stunning piece from Myntra\'s collection.',
          sender: 'ai',
          senderName: 'Maya(AI)',
          senderAvatar: 'https://ui-avatars.com/api/?name=AI&background=4A90E2&color=FFFFFF&size=150',
          timestamp: formatTimestamp(aiResponseTime),
          isProduct: true,
          productData: {
            name: 'Stylish Sneakers',
            price: '₹3,999',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop',
            description: 'Step out in style with these stylish sneakers that offer both comfort and flair. Perfect for casual outings or workouts, they will keep you looking fresh and trendy.',
            images: [
              'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop',
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
              'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=500&fit=crop',
              'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop',
            ]
          },
          reactions: {
            thumbsUp: 0,
            thumbsDown: 0,
          },
        };
        const updatedMessagesWithAI = [...messages, newMessage, aiResponse];
        setMessages(updatedMessagesWithAI);
        
        // Save AI response to storage
        await messageStorage.addMessage(roomId, aiResponse);
        
        // Broadcast AI response to all users in the room via Socket.IO
        if (socketConnected) {
          socketService.sendMessage({
            text: aiResponse.text,
            sender: 'ai',
            senderName: 'Maya(AI)',
            senderAvatar: 'https://ui-avatars.com/api/?name=AI&background=4A90E2&color=FFFFFF&size=150',
            roomId: roomId,
            messageType: 'product',
            productData: aiResponse.productData,
            reactions: aiResponse.reactions
          });
        }
      }, 1500);
    }
  };

  const handleProductAction = (action: string, productData: any) => {
    console.log('Product action:', action, productData);
    // Handle product actions like "Ask More", "View Items", etc.
  };

  return (
    <>
      <MayaChat
        roomName={room ? room.name : 'Room'}
        onBack={() => router.back()}
        onMenuPress={() => setShowMenu(true)}
        messages={mayaMessages}
        onSendMessage={handleSendMessage}
        onProductAction={handleProductAction}
        typingUsers={typingUsers}
        socketConnected={socketConnected}
      />

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
              onPress={() => handleMenuAction(roomData?.hasActiveSession ? 'joinSession' : 'startSession')}
            >
              <View style={styles.menuIconContainer}>
                <Image 
                  source={require('@/assets/images/start_session_icon.png')} 
                  style={styles.menuIconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.menuText}>
                {roomData?.hasActiveSession ? `Join ${roomData.sessionHost}'s Session` : 'Start Session'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuAction('roomSettings')}
            >
              <View style={styles.menuIconContainer}>
                <Image 
                  source={require('@/assets/images/room_settings.png')} 
                  style={styles.menuIconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.menuText}>Room Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuAction('wardrobe')}
            >
              <View style={styles.menuIconContainer}>
                <Image 
                  source={require('@/assets/images/wardrobe_icon.png')} 
                  style={styles.menuIconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.menuText}>Wardrobe</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MayaTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: MayaTheme.colors.backgroundWhite,
    minHeight: 44,
    ...MayaTheme.shadows.sm,
  },
  backButtonContainer: {
    padding: 8,
    marginLeft: -8,
  },
  backButton: {
    fontSize: 28,
    color: '#1a1a1a',
    fontWeight: '300',
  },
  roomTitle: {
    fontSize: 16,
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
    backgroundColor: '#f8f9fa',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
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
    marginBottom: 3,
    marginLeft: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  messageContainer: {
    padding: 0,
    borderRadius: 16,
    maxWidth: '80%',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginLeft: '20%',
    backgroundColor: 'transparent',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    marginRight: '20%',
    borderWidth: 0,
  },
  messageContent: {
    padding: 12,
    position: 'relative',
  },
  userMessageText: {
    fontSize: 13,
    color: 'white',
    lineHeight: 18,
    marginBottom: 3,
    fontWeight: '400',
  },
  otherMessageText: {
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 18,
    marginBottom: 3,
    fontWeight: '400',
  },
  userTimestamp: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
    marginTop: 2,
    fontWeight: '400',
  },
  otherTimestamp: {
    fontSize: 10,
    color: '#8e8e93',
    alignSelf: 'flex-end',
    marginTop: 2,
    fontWeight: '400',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
    lineHeight: 16,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E91E63',
    letterSpacing: 0.3,
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
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91E63',
  },
  addToWardrobeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  showMoreBtn: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E91E63',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  showMoreText: {
    color: '#E91E63',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  reactions: {
    position: 'absolute',
    bottom: -12,
    right: 8,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  reactionButtonActive: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  reactionIcon: {
    width: 18,
    height: 18,
    opacity: 0.6,
    tintColor: '#1a1a1a',
  },
  reactionIconActive: {
    width: 18,
    height: 18,
    opacity: 1,
    tintColor: '#E91E63',
  },
  reactionCount: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAE8FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: '#4A4A4A',
    fontWeight: '300',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#EAE8FE',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#4A4A4A',
    maxHeight: 100,
    borderWidth: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B19CD9',
  },
  sendIcon: {
    width: 16,
    height: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 45,
    paddingRight: 25,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  menuIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconImage: {
    width: 16,
    height: 16,
  },
  menuText: {
    fontSize: 14,
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