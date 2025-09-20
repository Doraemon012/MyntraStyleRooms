import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'maya' | 'friend' | 'ai';
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

interface MayaChatProps {
  roomName?: string;
  onBack?: () => void;
  onMenuPress?: () => void;
  messages?: Message[];
  onSendMessage?: (text: string) => void;
  onProductAction?: (action: string, productData: any) => void;
}

const MayaChat: React.FC<MayaChatProps> = ({
  roomName = "Maya",
  onBack,
  onMenuPress,
  messages = [],
  onSendMessage,
  onProductAction,
}) => {
  const [inputText, setInputText] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  const mayaAvatar = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face';

  const handleSendMessage = () => {
    if (inputText.trim() && onSendMessage) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleProductAction = (action: string, productData: any) => {
    if (onProductAction) {
      onProductAction(action, productData);
    }
    if (action === 'view_items') {
      setSelectedProduct(productData);
      setShowProductModal(true);
    }
  };

  const renderProductCard = (productData: any, isUserMessage: boolean = false) => (
    <View style={[styles.productCard, isUserMessage && styles.userProductCard]}>
      {/* Main Product Image */}
      <View style={styles.productImageContainer}>
        <Image source={{ uri: productData.image }} style={styles.mainProductImage} />
        
        {/* Small product images grid */}
        {productData.images && productData.images.length > 0 && (
          <View style={styles.productImagesGrid}>
            {productData.images.slice(0, 4).map((img: string, index: number) => (
              <Image key={index} source={{ uri: img }} style={styles.smallProductImage} />
            ))}
            {productData.images.length > 4 && (
              <TouchableOpacity
                style={styles.viewItemsButton}
                onPress={() => handleProductAction('view_items', productData)}
              >
                <Text style={styles.viewItemsText}>View Items</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <View style={styles.productTitleRow}>
          <Text style={styles.productTitle}>{productData.name}</Text>
          <TouchableOpacity
            style={styles.askMoreButton}
            onPress={() => handleProductAction('ask_more', productData)}
          >
            <Text style={styles.askMoreText}>Ask More</Text>
          </TouchableOpacity>
        </View>
        
        {productData.description && (
          <Text style={styles.productDescription}>{productData.description}</Text>
        )}
        
        {productData.price && (
          <Text style={styles.productPrice}>{productData.price}</Text>
        )}
      </View>

      {/* Reactions */}
      {productData.reactions && (
        <View style={styles.reactionsContainer}>
          <TouchableOpacity style={styles.reactionButton}>
            <Text style={styles.reactionEmoji}>👍</Text>
            <Text style={styles.reactionCount}>{productData.reactions.thumbsUp || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionButton}>
            <Text style={styles.reactionEmoji}>👎</Text>
            <Text style={styles.reactionCount}>{productData.reactions.thumbsDown || 0}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender === 'user';
    const isMayaMessage = item.sender === 'maya' || item.sender === 'ai';

    return (
      <View style={styles.messageWrapper}>
        {/* Sender Info for non-user messages */}
        {!isUserMessage && (
          <View style={styles.messageHeader}>
            <Image 
              source={{ uri: item.senderAvatar || mayaAvatar }} 
              style={styles.avatar} 
            />
            <Text style={styles.senderName}>{item.senderName}</Text>
          </View>
        )}

        {/* Message Content */}
        <View style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessage : styles.otherMessage
        ]}>
          {item.isProduct && item.productData ? (
            renderProductCard(item.productData, isUserMessage)
          ) : (
            <Text style={[
              styles.messageText,
              isUserMessage ? styles.userMessageText : styles.otherMessageText
            ]}>
              {item.text}
            </Text>
          )}
          
          <Text style={[
            styles.timestamp,
            isUserMessage ? styles.userTimestamp : styles.otherTimestamp
          ]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{roomName}</Text>
            <Text style={styles.headerSubtitle}>Your ChatGPT powered assistant</Text>
          </View>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type here..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>✈</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>
            AI chat: Risk of inaccurate results. Don't share personal info.
          </Text>
        </KeyboardAvoidingView>

        {/* Product Modal */}
        <Modal
          visible={showProductModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowProductModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.productModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Product Details</Text>
                <TouchableOpacity onPress={() => setShowProductModal(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {selectedProduct && (
                <ScrollView style={styles.modalContent}>
                  <Image source={{ uri: selectedProduct.image }} style={styles.modalProductImage} />
                  <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                  <Text style={styles.modalProductPrice}>{selectedProduct.price}</Text>
                  {selectedProduct.description && (
                    <Text style={styles.modalProductDescription}>{selectedProduct.description}</Text>
                  )}
                  
                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <View style={styles.modalImagesGrid}>
                      {selectedProduct.images.map((img: string, index: number) => (
                        <Image key={index} source={{ uri: img }} style={styles.modalSmallImage} />
                      ))}
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

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
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
    fontWeight: '300',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageWrapper: {
    marginVertical: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  messageContainer: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E8E0FE',
    marginLeft: '15%',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    marginRight: '15%',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#1a1a1a',
  },
  otherMessageText: {
    color: '#1a1a1a',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  userTimestamp: {
    color: '#666',
  },
  otherTimestamp: {
    color: '#999',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  userProductCard: {
    backgroundColor: '#f8f9fa',
  },
  productImageContainer: {
    position: 'relative',
  },
  mainProductImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  productImagesGrid: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 80,
  },
  smallProductImage: {
    width: 36,
    height: 36,
    borderRadius: 6,
    margin: 1,
    resizeMode: 'cover',
  },
  viewItemsButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  viewItemsText: {
    fontSize: 8,
    color: '#333',
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  askMoreButton: {
    backgroundColor: '#E8E0FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  askMoreText: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  productDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E91E63',
  },
  reactionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 12,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  reactionEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E0FE',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    maxHeight: 100,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8E0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  disclaimer: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: screenWidth * 0.9,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  modalContent: {
    padding: 16,
  },
  modalProductImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 12,
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalProductPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E91E63',
    marginBottom: 12,
  },
  modalProductDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalSmallImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});

export default MayaChat;
