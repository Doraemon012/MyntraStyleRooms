import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'friend' | 'ai';
  senderName: string;
  timestamp: string;
  isProduct?: boolean;
  productData?: {
    name: string;
    price: string;
    image: string;
  };
  reactions?: { userId: string; type: string; emoji: string }[];
}

interface Wardrobe {
  id: string;
  name: string;
  emoji: string;
  itemCount: number;
}

interface Room {
  id: string;
  name: string;
  emoji: string;
  description: string;
  memberCount: number;
}

const mockRooms: { [key: string]: Room } = {
  '1': { id: '1', name: 'Family Wedding', emoji: '👰', description: 'Planning outfits for the family wedding ceremony', memberCount: 5 },
  '2': { id: '2', name: 'College Freshers', emoji: '🎉', description: 'Fresh looks for college parties and events', memberCount: 3 },
  '3': { id: '3', name: 'Saturday Party', emoji: '🔥', description: 'Weekend party vibes and styling', memberCount: 4 },
};

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hey! Looking for some ethnic wear for the wedding',
    sender: 'user',
    senderName: 'You',
    timestamp: '10:30 AM',
    reactions: [],
  },
  {
    id: '2',
    text: 'What\'s your budget range?',
    sender: 'friend',
    senderName: 'Priya',
    timestamp: '10:31 AM',
    reactions: [],
  },
  {
    id: '3',
    text: 'Around ₹5000 would be perfect',
    sender: 'user',
    senderName: 'You',
    timestamp: '10:32 AM',
    reactions: [],
  },
  {
    id: '4',
    text: 'I found some beautiful sarees in your budget! Here\'s a stunning red silk saree that would be perfect for the wedding.',
    sender: 'ai',
    senderName: 'AI Stylist',
    timestamp: '10:33 AM',
    isProduct: true,
    productData: {
      name: 'Red Silk Saree with Golden Border',
      price: '₹4,999',
      image: 'https://via.placeholder.com/150x200/ff6b6b/ffffff?text=Saree',
    },
    reactions: [
      { userId: 'user1', type: 'love', emoji: '❤️' },
      { userId: 'user2', type: 'like', emoji: '👍' },
    ],
  },
];

const mockWardrobes: Wardrobe[] = [
  { id: '1', name: 'Family Wedding', emoji: '👰', itemCount: 12 },
  { id: '2', name: 'Office Formals', emoji: '💼', itemCount: 8 },
  { id: '3', name: 'Weekend Casuals', emoji: '🌟', itemCount: 15 },
];

const reactionEmojis = ['👍', '❤️', '😍', '🔥', '👎', '😊'];

export default function RoomChatScreen() {
  const { id } = useLocalSearchParams();
  const roomData = mockRooms[id as string] || mockRooms['1'];
  
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showWardrobeModal, setShowWardrobeModal] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: 'user',
        senderName: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: [],
      };
      
      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Check if message mentions bot
      if (inputText.toLowerCase().includes('@bot')) {
        setTimeout(() => {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Hi! I\'m here to help you with fashion recommendations. What are you looking for?',
            sender: 'ai',
            senderName: 'AI Stylist',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: [],
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 1000);
      }
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        const existingReaction = message.reactions?.find(r => r.userId === 'currentUser');
        let newReactions = message.reactions?.filter(r => r.userId !== 'currentUser') || [];
        
        if (!existingReaction || existingReaction.emoji !== emoji) {
          newReactions.push({ userId: 'currentUser', type: 'reaction', emoji });
        }
        
        return { ...message, reactions: newReactions };
      }
      return message;
    }));
    setShowReactionModal(false);
  };

  const addToWardrobe = (wardrobeId: string) => {
    if (selectedProduct) {
      Alert.alert('Success', `Added "${selectedProduct.name}" to wardrobe!`);
      setShowWardrobeModal(false);
      setSelectedProduct(null);
    }
  };

  const openAddToWardrobeModal = (productData: any) => {
    setSelectedProduct(productData);
    setShowWardrobeModal(true);
  };

  const openReactionModal = (messageId: string) => {
    setSelectedMessageId(messageId);
    setShowReactionModal(true);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.otherMessage,
      ]}
      onLongPress={() => item.isProduct && openReactionModal(item.id)}
    >
      {item.sender !== 'user' && (
        <Text style={styles.senderName}>{item.senderName}</Text>
      )}
      
      {item.isProduct && item.productData ? (
        <View style={styles.productCard}>
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.productImageText}>👗</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.productData.name}</Text>
            <Text style={styles.productPrice}>{item.productData.price}</Text>
          </View>
          <TouchableOpacity 
            style={styles.addToWardrobeBtn}
            onPress={() => openAddToWardrobeModal(item.productData)}
          >
            <Text style={styles.addToWardrobeText}>Add to Wardrobe</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={[
          styles.messageText,
          item.sender === 'user' && styles.userMessageText
        ]}>{item.text}</Text>
      )}
      
      {item.reactions && item.reactions.length > 0 && (
        <View style={styles.reactionsContainer}>
          {item.reactions.map((reaction, index) => (
            <View key={index} style={styles.reactionBubble}>
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text style={styles.reactionCount}>1</Text>
            </View>
          ))}
        </View>
      )}
      
      <Text style={[
        styles.timestamp,
        item.sender === 'user' && styles.userTimestamp
      ]}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  const MenuModal = () => (
    <Modal
      visible={showMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMenu(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        onPress={() => setShowMenu(false)}
      >
        <View style={styles.menuModal}>
          <TouchableOpacity style={styles.menuItem} onPress={() => {
            setShowMenu(false);
            // Navigate to add members
          }}>
            <Text style={styles.menuIcon}>👥</Text>
            <Text style={styles.menuText}>Add Members</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => {
            setShowMenu(false);
            router.push(`/call/${id}`);
          }}>
            <Text style={styles.menuIcon}>📞</Text>
            <Text style={styles.menuText}>Start Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => {
            setShowMenu(false);
            router.push(`/wardrobe/${id}`);
          }}>
            <Text style={styles.menuIcon}>👗</Text>
            <Text style={styles.menuText}>Wardrobe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => {
            setShowMenu(false);
            // Navigate to room settings
          }}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Room Settings</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const WardrobeModal = () => (
    <Modal
      visible={showWardrobeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowWardrobeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.wardrobeModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add to Wardrobe</Text>
            <TouchableOpacity onPress={() => setShowWardrobeModal(false)}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>
          
          {selectedProduct && (
            <View style={styles.selectedProductInfo}>
              <Text style={styles.selectedProductName}>{selectedProduct.name}</Text>
              <Text style={styles.selectedProductPrice}>{selectedProduct.price}</Text>
            </View>
          )}
          
          <Text style={styles.sectionTitle}>Select Wardrobe:</Text>
          
          {mockWardrobes.map((wardrobe) => (
            <TouchableOpacity
              key={wardrobe.id}
              style={styles.wardrobeOption}
              onPress={() => addToWardrobe(wardrobe.id)}
            >
              <Text style={styles.wardrobeEmoji}>{wardrobe.emoji}</Text>
              <View style={styles.wardrobeInfo}>
                <Text style={styles.wardrobeName}>{wardrobe.name}</Text>
                <Text style={styles.wardrobeCount}>{wardrobe.itemCount} items</Text>
              </View>
              <Text style={styles.addIcon}>+</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.createNewWardrobe}>
            <Text style={styles.createNewText}>+ Create New Wardrobe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const ReactionModal = () => (
    <Modal
      visible={showReactionModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowReactionModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        onPress={() => setShowReactionModal(false)}
      >
        <View style={styles.reactionModal}>
          <Text style={styles.reactionTitle}>React to this outfit</Text>
          <View style={styles.reactionGrid}>
            {reactionEmojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reactionOption}
                onPress={() => addReaction(selectedMessageId, emoji)}
              >
                <Text style={styles.reactionEmojiLarge}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar style="dark" backgroundColor="white" />
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container} edges={['top']}>
          {/* Custom Header with Room Info and Menu */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.roomInfoContainer}>
              <View style={styles.roomMainInfo}>
                <Text style={styles.roomEmoji}>{roomData.emoji}</Text>
                <View style={styles.roomTextInfo}>
                  <ThemedText style={styles.roomName}>{roomData.name}</ThemedText>
                  <Text style={styles.roomDescription}>{roomData.description}</Text>
                  <Text style={styles.memberCount}>{roomData.memberCount} members</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowMenu(true)}
            >
              <Text style={styles.menuButtonText}>⋯</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            keyboardShouldPersistTaps="handled"
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message... (mention @bot for AI help)"
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>

          <MenuModal />
          <WardrobeModal />
          <ReactionModal />
        </SafeAreaView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    minHeight: 80,
  },
  backButtonContainer: {
    padding: 4,
  },
  backButton: {
    fontSize: 24,
    color: '#ff6b6b',
  },
  roomInfoContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  roomMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  roomEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  roomTextInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  roomDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 16,
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  menuButtonText: {
    fontSize: 20,
    color: '#666',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff6b6b',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  productCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
  },
  productImagePlaceholder: {
    width: 60,
    height: 80,
    backgroundColor: '#e1e5e9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImageText: {
    fontSize: 24,
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  addToWardrobeBtn: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addToWardrobeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  reactionEmoji: {
    fontSize: 12,
    marginRight: 2,
  },
  reactionCount: {
    fontSize: 10,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    maxHeight: 120,
    minHeight: 44,
    fontSize: 16,
    color: '#1a1a1a',
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#1a1a1a',
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
});