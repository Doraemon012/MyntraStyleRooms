import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { useAuth } from '../../contexts/auth-context';
import { useRoom } from '../../contexts/room-context';
import { useSocket } from '../../contexts/socket-context';
import { Message, messageApi } from '../../services/messageApi';
import { Room } from '../../services/roomApi';

// Using Message interface from messageApi service


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

// Helper function to convert API message to display format
const convertApiMessageToDisplay = (apiMessage: Message, currentUserId: string): any => {
  const isUserMessage = apiMessage.senderId?._id === currentUserId;
  const isSystemMessage = apiMessage.senderType === 'system';
  
  return {
    id: apiMessage._id,
    text: apiMessage.text || '',
    sender: isUserMessage ? 'user' : 'friend',
    senderName: isUserMessage ? 'You' : (isSystemMessage ? 'System' : apiMessage.senderId?.name || 'Unknown'),
    senderAvatar: apiMessage.senderId?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    timestamp: formatTimestamp(new Date(apiMessage.timestamp)),
    isProduct: apiMessage.messageType === 'product',
    productData: apiMessage.productData,
    reactions: {
      thumbsUp: apiMessage.reactions?.filter(r => r.type === 'like').length || 0,
      thumbsDown: apiMessage.reactions?.filter(r => r.type === 'angry').length || 0,
      heart: apiMessage.reactions?.filter(r => r.type === 'love').length || 0,
      laugh: apiMessage.reactions?.filter(r => r.type === 'laugh').length || 0,
      wow: apiMessage.reactions?.filter(r => r.type === 'wow').length || 0,
      sad: apiMessage.reactions?.filter(r => r.type === 'sad').length || 0,
      userThumbsUp: apiMessage.reactions?.some(r => r.userId === currentUserId && r.type === 'like') || false,
      userThumbsDown: apiMessage.reactions?.some(r => r.userId === currentUserId && r.type === 'angry') || false,
      userHeart: apiMessage.reactions?.some(r => r.userId === currentUserId && r.type === 'love') || false,
      userLaugh: apiMessage.reactions?.some(r => r.userId === currentUserId && r.type === 'laugh') || false,
      userWow: apiMessage.reactions?.some(r => r.userId === currentUserId && r.type === 'wow') || false,
      userSad: apiMessage.reactions?.some(r => r.userId === currentUserId && r.type === 'sad') || false,
    },
  };
};


export default function RoomChatScreen() {
  const { id } = useLocalSearchParams();
  
  // Get real data from contexts
  const { user, token, logout } = useAuth();
  const { rooms: allRooms, getRoom, refreshRoom } = useRoom();
  const { socket, isConnected, joinRoom, leaveRoom, onNewMessage, onMessageEdited, onMessageDeleted, onMessageReaction, onTypingStart, onTypingStop, emitTypingStart, emitTypingStop, offEvent } = useSocket();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Check if user has permission to edit room settings
  const canEditRoom = (): boolean => {
    if (!user || !room) return false;
    
    // Check if user is the room owner
    if (room.owner._id === user._id) {
      return true;
    }
    
    // Check if user has Editor role
    const userMember = room.members.find(member => member.userId._id === user._id);
    return userMember?.role === 'Editor';
  };
  
  // Fetch room data from real API
  const fetchRoomData = async () => {
    try {
      setLoading(true);
      console.log('🏠 RoomChatScreen: Fetching room from Myntra Fashion database:', id);
      
      if (!token || !user) {
        console.error('No authentication token or user');
        setRoom(null);
        return;
      }

      // Try to get room from context first (if already loaded)
      const existingRoom = allRooms.find(r => r._id === id);
      if (existingRoom) {
        console.log('✅ Room found in context:', existingRoom.name);
        setRoom(existingRoom);
        return;
      }

      // If not in context, fetch from API
      console.log('🔄 Fetching room from API...');
      const roomData = await getRoom(id as string);
      console.log('✅ Room fetched from API:', roomData.name);
      setRoom(roomData);
      
    } catch (error: any) {
      console.error('❌ Failed to fetch room:', error);
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for the room with retry logic
  const fetchMessages = async (retryCount = 0) => {
    try {
      if (!token || !user || !id || isLoadingMessages) {
        console.error('Missing required data for fetching messages or already loading');
        return;
      }

      setIsLoadingMessages(true);
      console.log(`💬 Fetching messages for room: ${id} (attempt ${retryCount + 1})`);
      const response = await messageApi.getMessages(token, id as string, {
        page: 1,
        limit: 50
      });

      if (response.status === 'success') {
        const displayMessages = response.data.messages.map(msg => 
          convertApiMessageToDisplay(msg, user._id)
        );
        setMessages(displayMessages);
        console.log('✅ Messages loaded:', displayMessages.length);
      } else {
        console.error('❌ Failed to fetch messages:', response.message);
        if (retryCount < 2) {
          console.log('🔄 Retrying message fetch...');
          setTimeout(() => fetchMessages(retryCount + 1), 1000);
        } else {
          Alert.alert('Error', 'Failed to load messages after multiple attempts.');
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching messages:', error);
      
      if (retryCount < 2) {
        console.log('🔄 Retrying message fetch due to error...');
        setTimeout(() => fetchMessages(retryCount + 1), 1000);
      } else {
        Alert.alert('Error', 'Failed to load messages. Please check your connection and try again.');
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };
  
  // No more mock helper functions - using real data from database
  
  useEffect(() => {
    fetchRoomData();
  }, [id]);

  // Fetch messages when room is loaded
  useEffect(() => {
    if (room && token && user && !isLoadingMessages && messages.length === 0) {
      fetchMessages();
    }
  }, [room, token, user, isLoadingMessages, messages.length]);


  // Socket.io real-time messaging
  useEffect(() => {
    if (!socket || !isConnected || !room || !user) return;

    console.log('🔌 Setting up Socket.io listeners for room:', room._id);
    
    // Join the room
    joinRoom(room._id);

    // Listen for new messages
    const handleNewMessage = (data: any) => {
      console.log('📨 New message received:', data);
      if (data.roomId === room._id) {
        const newMessage = convertApiMessageToDisplay(data.message, user._id);
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
        
        // Scroll to bottom immediately when new message arrives
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    };

    // Listen for message edits
    const handleMessageEdited = (data: any) => {
      console.log('✏️ Message edited:', data);
      if (data.roomId === room._id) {
        const updatedMessage = convertApiMessageToDisplay(data.message, user._id);
        setMessages(prev => 
          prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
        );
      }
    };

    // Listen for message deletions
    const handleMessageDeleted = (data: any) => {
      console.log('🗑️ Message deleted:', data);
      if (data.roomId === room._id) {
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
      }
    };

    // Listen for message reactions
    const handleMessageReaction = (data: any) => {
      console.log('👍 Message reaction:', data);
      if (data.roomId === room._id) {
        const updatedMessage = convertApiMessageToDisplay(data.message, user._id);
        setMessages(prev => 
          prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
        );
      }
    };

    // Listen for typing indicators
    const handleTypingStart = (data: any) => {
      if (data.roomId === room._id && data.userId !== user._id) {
        setTypingUsers(prev => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });
      }
    };

    const handleTypingStop = (data: any) => {
      if (data.roomId === room._id && data.userId !== user._id) {
        setTypingUsers(prev => prev.filter(name => name !== data.userName));
      }
    };

    // Set up event listeners
    onNewMessage(handleNewMessage);
    onMessageEdited(handleMessageEdited);
    onMessageDeleted(handleMessageDeleted);
    onMessageReaction(handleMessageReaction);
    onTypingStart(handleTypingStart);
    onTypingStop(handleTypingStop);

    // Cleanup function
    return () => {
      console.log('🔌 Cleaning up Socket.io listeners');
      leaveRoom(room._id);
      offEvent('new-message');
      offEvent('message-edited');
      offEvent('message-deleted');
      offEvent('message-reaction');
      offEvent('typing-start');
      offEvent('typing-stop');
    };
  }, [socket, isConnected, room, user, joinRoom, leaveRoom, onNewMessage, onMessageEdited, onMessageDeleted, onMessageReaction, onTypingStart, onTypingStop, offEvent]);

  // Cleanup typing indicators on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && room) {
        emitTypingStop(room._id);
      }
    };
  }, [isTyping, room, emitTypingStop]);

  // Handle typing indicators
  const handleTextChange = (text: string) => {
    setInputText(text);
    
    if (!room || !isConnected) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Start typing indicator if not already typing
    if (!isTyping && text.trim().length > 0) {
      setIsTyping(true);
      emitTypingStart(room._id);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        emitTypingStop(room._id);
      }
    }, 1000);
  };

  // Handle message reactions
  const handleReaction = async (messageId: string, reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => {
    if (!token) return;
    
    try {
      await messageApi.addReaction(token, messageId, reactionType);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };


  // Refresh room data when screen comes into focus (e.g., returning from settings)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Room screen focused - refreshing room data...');
      if (id && token && user && !loading) { // Prevent multiple simultaneous calls
        refreshRoom(id as string).then(updatedRoom => {
          console.log('✅ Room refreshed:', updatedRoom.name);
          setRoom(updatedRoom);
        }).catch(error => {
          console.error('❌ Failed to refresh room:', error);
          // Only fallback if room is not already loaded
          if (!room) {
            fetchRoomData();
          }
        });
      }
    }, [id, token, user, refreshRoom, loading, room])
  );

  const sendMessage = async () => {
    if (!inputText.trim() || !token || !user || !id || sendingMessage) {
      return;
    }

    try {
      setSendingMessage(true);
      const messageText = inputText.trim();
      
      console.log('📤 Sending message:', messageText);
      
      // Send message to API
      const response = await messageApi.sendMessage(token, id as string, {
        text: messageText,
        messageType: 'text'
      });

      if (response.status === 'success') {
        // Don't add message to local state here - let Socket.io handle it
        // This prevents duplicate messages when Socket.io broadcasts
        setInputText('');
        
        // Stop typing indicator
        if (isTyping) {
          setIsTyping(false);
          emitTypingStop(id as string);
        }
        
        // Clear typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Scroll to bottom immediately for faster UX
        flatListRef.current?.scrollToEnd({ animated: true });
        
        console.log('✅ Message sent successfully');
      } else {
        console.error('❌ Failed to send message:', response.message);
        Alert.alert('Error', response.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      
      // Show specific error messages
      if (error.code === 'ECONNABORTED') {
        Alert.alert('Error', 'Message sending timed out. Please check your connection.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        Alert.alert('Error', 'Cannot connect to server. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        Alert.alert('Error', 'Session expired. Please log in again.');
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    switch (action) {
      case 'startSession':
        // Start a styling session
        router.push('/start-session');
        break;
      case 'wardrobe':
        // Navigate to wardrobe
        router.push('/wardrobes');
        break;
      case 'roomSettings':
        // Navigate to room settings
        router.push(`/room/settings?id=${id}`);
        break;
      case 'logout':
        // Logout user
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Logout',
              style: 'destructive',
              onPress: async () => {
                try {
                  await logout();
                } catch (error) {
                  Alert.alert('Error', 'Failed to logout. Please try again.');
                }
              },
            },
          ]
        );
        break;
    }
  };


  const renderMessage = ({ item }: { item: any }) => {
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
                      <TouchableOpacity 
                        style={styles.addToWardrobeBtnInner}
                        onPress={() => console.log('Add to wardrobe:', item.productData)}
                      >
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
                        onPress={() => handleReaction(item.id, 'like')}
                      >
                        <Text style={styles.reactionEmoji}>👍</Text>
                        <Text style={styles.reactionCount}>{item.reactions.thumbsUp}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.reactionButton,
                          item.reactions.userHeart && styles.reactionButtonActive
                        ]}
                        onPress={() => handleReaction(item.id, 'love')}
                      >
                        <Text style={styles.reactionEmoji}>❤️</Text>
                        <Text style={styles.reactionCount}>{item.reactions.heart}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.reactionButton,
                          item.reactions.userLaugh && styles.reactionButtonActive
                        ]}
                        onPress={() => handleReaction(item.id, 'laugh')}
                      >
                        <Text style={styles.reactionEmoji}>😂</Text>
                        <Text style={styles.reactionCount}>{item.reactions.laugh}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.reactionButton,
                          item.reactions.userWow && styles.reactionButtonActive
                        ]}
                        onPress={() => handleReaction(item.id, 'wow')}
                      >
                        <Text style={styles.reactionEmoji}>😮</Text>
                        <Text style={styles.reactionCount}>{item.reactions.wow}</Text>
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
                      <TouchableOpacity 
                        style={styles.addToWardrobeBtnInner}
                        onPress={() => console.log('Add to wardrobe:', item.productData)}
                      >
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
                        onPress={() => handleReaction(item.id, 'like')}
                      >
                        <Text style={styles.reactionEmoji}>👍</Text>
                        <Text style={styles.reactionCount}>{item.reactions.thumbsUp}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.reactionButton,
                          item.reactions.userHeart && styles.reactionButtonActive
                        ]}
                        onPress={() => handleReaction(item.id, 'love')}
                      >
                        <Text style={styles.reactionEmoji}>❤️</Text>
                        <Text style={styles.reactionCount}>{item.reactions.heart}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.reactionButton,
                          item.reactions.userLaugh && styles.reactionButtonActive
                        ]}
                        onPress={() => handleReaction(item.id, 'laugh')}
                      >
                        <Text style={styles.reactionEmoji}>😂</Text>
                        <Text style={styles.reactionCount}>{item.reactions.laugh}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.reactionButton,
                          item.reactions.userWow && styles.reactionButtonActive
                        ]}
                        onPress={() => handleReaction(item.id, 'wow')}
                      >
                        <Text style={styles.reactionEmoji}>😮</Text>
                        <Text style={styles.reactionCount}>{item.reactions.wow}</Text>
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
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Loading room from Myntra Fashion database...</Text>
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
            <Text style={styles.databaseIndicator}>
              📊 Connected to Myntra Fashion Database
            </Text>
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
            <Text style={styles.backButton}>‹</Text>
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
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>
              {typingUsers.length === 1 
                ? `${typingUsers[0]} is typing...` 
                : `${typingUsers.length} people are typing...`
              }
            </Text>
            <View style={styles.typingDots}>
              <View style={[styles.typingDot, styles.typingDot1]} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
            </View>
          </View>
        )}
        </View>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={styles.inputContainer}
        >
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder="Type your message here..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, sendingMessage && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={sendingMessage || !inputText.trim()}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="#E91E63" />
            ) : (
              <Image 
                source={require('@/assets/images/send_icon.png')} 
                style={styles.sendIcon}
                resizeMode="contain"
              />
            )}
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
                onPress={() => handleMenuAction('startSession')}
              >
                <View style={styles.menuIconContainer}>
                  <Image 
                    source={require('@/assets/images/start_session_icon.png')} 
                    style={styles.menuIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.menuText}>Start Session</Text>
              </TouchableOpacity>
              {canEditRoom() && (
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
              )}
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
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuAction('logout')}
              >
                <View style={styles.menuIconContainer}>
                  <Text style={styles.menuIconText}>🚪</Text>
                </View>
                <Text style={styles.menuText}>Logout</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    minHeight: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
  sendButtonDisabled: {
    opacity: 0.5,
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
  menuIconText: {
    fontSize: 16,
    color: '#000',
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
  databaseIndicator: {
    fontSize: 12,
    color: '#E91E63',
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: '#ffe6f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  typingDot1: {
    animationDelay: '0s',
  },
  typingDot2: {
    animationDelay: '0.2s',
  },
  typingDot3: {
    animationDelay: '0.4s',
  },
  reactionEmoji: {
    fontSize: 16,
  },
});