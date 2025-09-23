import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AIStylistMessageProps {
  message: {
    id: string;
    text: string;
    timestamp: string;
    productData?: {
      name: string;
      brand: string;
      price: string;
      originalPrice?: string;
      discount?: string;
      image: string;
      rating?: string;
      reviews?: string;
      description?: string;
      productId?: string;
    };
    reactions?: {
      thumbsUp: number;
      thumbsDown: number;
      heart: number;
      laugh: number;
      wow: number;
      sad: number;
      userThumbsUp: boolean;
      userThumbsDown: boolean;
      userHeart: boolean;
      userLaugh: boolean;
      userWow: boolean;
      userSad: boolean;
    };
  };
  onReaction: (messageId: string, reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => void;
  onAddToWardrobe: (productData: any) => void;
  onShowMore: (productData: any) => void;
}

export default function AIStylistMessage({ 
  message, 
  onReaction, 
  onAddToWardrobe, 
  onShowMore 
}: AIStylistMessageProps) {
  const handleReaction = (reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => {
    onReaction(message.id, reactionType);
  };

  const handleAddToWardrobe = () => {
    if (message.productData) {
      onAddToWardrobe(message.productData);
    }
  };

  const handleShowMore = () => {
    if (message.productData) {
      onShowMore(message.productData);
    }
  };

  return (
    <View style={styles.messageWrapper}>
      {/* AI Stylist Header */}
      <View style={styles.messageHeader}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=150&h=150&fit=crop&crop=face' }} 
          style={styles.avatar} 
        />
        <Text style={styles.aiSenderName}>AI Stylist</Text>
      </View>

      {/* Message Container */}
      <LinearGradient
        colors={['#3B82F6', '#60A5FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.messageContainer}
      >
        <View style={styles.messageContent}>
          {/* Message Text */}
          <Text style={styles.aiMessageText}>
            {message.text}
          </Text>

          {/* Product Card */}
          {message.productData && (
            <View style={styles.productCard}>
              <Image 
                source={{ uri: message.productData.image }} 
                style={styles.productImage}
                resizeMode="cover"
              />
              
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{message.productData.name}</Text>
                <Text style={styles.productBrand}>{message.productData.brand}</Text>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>{message.productData.price}</Text>
                  {message.productData.originalPrice && (
                    <Text style={styles.originalPrice}>{message.productData.originalPrice}</Text>
                  )}
                  {message.productData.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{message.productData.discount}</Text>
                    </View>
                  )}
                </View>

                {(message.productData.rating || message.productData.reviews) && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.rating}>
                      {message.productData.rating} ({message.productData.reviews})
                    </Text>
                  </View>
                )}

                {message.productData.description && (
                  <Text style={styles.productDescription}>
                    {message.productData.description}
                  </Text>
                )}

                <TouchableOpacity 
                  style={styles.addToWardrobeBtn}
                  onPress={handleAddToWardrobe}
                >
                  <Text style={styles.addToWardrobeText}>Add to Wardrobe</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Timestamp */}
          <Text style={styles.aiTimestamp}>
            {message.timestamp}
          </Text>
        </View>
      </LinearGradient>

      {/* Reactions */}
      {message.reactions && (
        <View style={styles.reactions}>
          <TouchableOpacity 
            style={[
              styles.reactionButton,
              message.reactions.userThumbsUp && styles.reactionButtonActive
            ]}
            onPress={() => handleReaction('like')}
          >
            <Text style={styles.reactionEmoji}>👍</Text>
            <Text style={styles.reactionCount}>{message.reactions.thumbsUp}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.reactionButton,
              message.reactions.userHeart && styles.reactionButtonActive
            ]}
            onPress={() => handleReaction('love')}
          >
            <Text style={styles.reactionEmoji}>❤️</Text>
            <Text style={styles.reactionCount}>{message.reactions.heart}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.reactionButton,
              message.reactions.userLaugh && styles.reactionButtonActive
            ]}
            onPress={() => handleReaction('laugh')}
          >
            <Text style={styles.reactionEmoji}>😂</Text>
            <Text style={styles.reactionCount}>{message.reactions.laugh}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.reactionButton,
              message.reactions.userWow && styles.reactionButtonActive
            ]}
            onPress={() => handleReaction('wow')}
          >
            <Text style={styles.reactionEmoji}>😮</Text>
            <Text style={styles.reactionCount}>{message.reactions.wow}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageWrapper: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  aiSenderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  messageContainer: {
    borderRadius: 16,
    maxWidth: '85%',
    alignSelf: 'flex-start',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageContent: {
    padding: 16,
  },
  aiMessageText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
    marginBottom: 4,
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
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  rating: {
    fontSize: 12,
    color: '#666',
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 16,
  },
  addToWardrobeBtn: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addToWardrobeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  aiTimestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  reactions: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 6,
    backgroundColor: '#EAE8FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  reactionButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '500',
  },
});
