import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
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
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hey! Looking for some ethnic wear for the wedding',
    sender: 'user',
    senderName: 'You',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    text: 'What\'s your budget range?',
    sender: 'friend',
    senderName: 'Priya',
    timestamp: '10:31 AM',
  },
  {
    id: '3',
    text: 'Around ₹5000 would be perfect',
    sender: 'user',
    senderName: 'You',
    timestamp: '10:32 AM',
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
  },
];

export default function RoomChatScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: 'user',
        senderName: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Great choice! Let me find some matching accessories for that.',
          sender: 'ai',
          senderName: 'AI Stylist',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.otherMessage,
      ]}
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
          <TouchableOpacity style={styles.addToWardrobeBtn}>
            <Text style={styles.addToWardrobeText}>Add to Wardrobe</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.messageText}>{item.text}</Text>
      )}
      
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <View style={styles.roomInfo}>
            <ThemedText style={styles.roomName}>College Freshers 🎉</ThemedText>
            <Text style={styles.memberCount}>3 members</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => router.push(`/call/${id}`)}
          >
            <Text style={styles.callButtonText}>📞 Call</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    fontSize: 24,
    color: '#ff6b6b',
  },
  roomInfo: {
    flex: 1,
    alignItems: 'center',
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 12,
    color: '#666',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  callButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});