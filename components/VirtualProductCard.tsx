import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Wardrobe, wardrobeApi } from '../services/wardrobeApi';

interface ProductData {
  name: string;
  brand: string;
  price: string;
  image: string;
  productId: string | null;
  description: string;
  originalPrice?: string | null;
  discount?: number;
  rating?: number;
  ratingCount?: number;
  colors?: Array<{ name: string; hex: string; stock: number }>;
  sizes?: Array<{ size: string; stock: number }>;
  occasion?: string[];
  trendingScore?: number;
}

interface VirtualProductCardProps {
  product: ProductData;
  onAddToWardrobe?: (product: ProductData) => void;
  onShowMore?: (product: ProductData) => void;
  showReactions?: boolean;
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
  onReaction?: (reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => void;
  token?: string;
  userId?: string;
}

export default function VirtualProductCard({
  product,
  onAddToWardrobe,
  onShowMore,
  showReactions = true,
  reactions,
  onReaction,
  token,
  userId
}: VirtualProductCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addingToWardrobe, setAddingToWardrobe] = useState(false);
  const [showWardrobeModal, setShowWardrobeModal] = useState(false);
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([]);
  const [loadingWardrobes, setLoadingWardrobes] = useState(false);

  const handleAddToWardrobe = async () => {
    if (token && userId) {
      // Show wardrobe selection modal
      await loadWardrobes();
      setShowWardrobeModal(true);
    } else if (onAddToWardrobe) {
      setAddingToWardrobe(true);
      try {
        await onAddToWardrobe(product);
        Alert.alert('Success', 'Product added to wardrobe!');
      } catch (error) {
        Alert.alert('Error', 'Failed to add product to wardrobe');
      } finally {
        setAddingToWardrobe(false);
      }
    }
  };

  const loadWardrobes = async () => {
    if (!token) return;
    
    setLoadingWardrobes(true);
    try {
      const response = await wardrobeApi.getWardrobes(token);
      if (response.status === 'success' && response.data) {
        setWardrobes(response.data.wardrobes);
      }
    } catch (error) {
      console.error('Error loading wardrobes:', error);
      Alert.alert('Error', 'Failed to load wardrobes');
    } finally {
      setLoadingWardrobes(false);
    }
  };

  const addToSpecificWardrobe = async (wardrobeId: string) => {
    if (!token) return;
    
    setAddingToWardrobe(true);
    try {
      const response = await wardrobeApi.addToWardrobe(token, wardrobeId, product);
      if (response.status === 'success') {
        Alert.alert('Success', 'Product added to wardrobe!');
        setShowWardrobeModal(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to add product to wardrobe');
      }
    } catch (error) {
      console.error('Error adding to wardrobe:', error);
      Alert.alert('Error', 'Failed to add product to wardrobe');
    } finally {
      setAddingToWardrobe(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={12} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={12} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#FFD700" />
      );
    }

    return stars;
  };

  const renderTrendingBadge = () => {
    if (!product.trendingScore || product.trendingScore < 80) return null;
    
    return (
      <View style={styles.trendingBadge}>
        <Ionicons name="trending-up" size={10} color="#E91E63" />
        <Text style={styles.trendingText}>Trending</Text>
      </View>
    );
  };

  const renderDiscountBadge = () => {
    if (!product.discount || product.discount < 10) return null;
    
    return (
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{product.discount}% OFF</Text>
      </View>
    );
  };

  return (
    <>
      <View style={styles.productCard}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          {renderTrendingBadge()}
          {renderDiscountBadge()}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
          
          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>{product.originalPrice}</Text>
            )}
          </View>

          {/* Rating */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {renderStars(product.rating)}
              </View>
              <Text style={styles.ratingText}>
                {product.rating.toFixed(1)} ({product.ratingCount})
              </Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>

          {/* Occasion Tags */}
          {product.occasion && product.occasion.length > 0 && (
            <View style={styles.occasionContainer}>
              {product.occasion.slice(0, 3).map((occ, index) => (
                <View key={index} style={styles.occasionTag}>
                  <Text style={styles.occasionText}>{occ}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <LinearGradient
            colors={['#E91E63', '#FF6B9D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addToWardrobeBtn}
          >
            <TouchableOpacity 
              style={styles.addToWardrobeBtnInner}
              onPress={handleAddToWardrobe}
              disabled={addingToWardrobe}
            >
              {addingToWardrobe ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.addToWardrobeText}>Add to Wardrobe</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
          
          <TouchableOpacity 
            style={styles.showMoreBtn}
            onPress={() => setShowDetails(true)}
          >
            <Text style={styles.showMoreText}>View Details</Text>
          </TouchableOpacity>
        </View>

        {/* Reactions */}
        {showReactions && reactions && (
          <View style={styles.reactions}>
            <TouchableOpacity 
              style={[
                styles.reactionButton,
                reactions.userThumbsUp && styles.reactionButtonActive
              ]}
              onPress={() => onReaction?.('like')}
            >
              <Text style={styles.reactionEmoji}>👍</Text>
              <Text style={styles.reactionCount}>{reactions.thumbsUp}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.reactionButton,
                reactions.userHeart && styles.reactionButtonActive
              ]}
              onPress={() => onReaction?.('love')}
            >
              <Text style={styles.reactionEmoji}>❤️</Text>
              <Text style={styles.reactionCount}>{reactions.heart}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.reactionButton,
                reactions.userLaugh && styles.reactionButtonActive
              ]}
              onPress={() => onReaction?.('laugh')}
            >
              <Text style={styles.reactionEmoji}>😂</Text>
              <Text style={styles.reactionCount}>{reactions.laugh}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.reactionButton,
                reactions.userWow && styles.reactionButtonActive
              ]}
              onPress={() => onReaction?.('wow')}
            >
              <Text style={styles.reactionEmoji}>😮</Text>
              <Text style={styles.reactionCount}>{reactions.wow}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Product Details Modal */}
      <Modal
        visible={showDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Product Details</Text>
                <TouchableOpacity onPress={() => setShowDetails(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Product Image */}
              <Image source={{ uri: product.image }} style={styles.modalImage} />

              {/* Product Info */}
              <View style={styles.modalProductInfo}>
                <Text style={styles.modalProductName}>{product.name}</Text>
                <Text style={styles.modalProductBrand}>{product.brand}</Text>
                
                <View style={styles.modalPriceContainer}>
                  <Text style={styles.modalCurrentPrice}>{product.price}</Text>
                  {product.originalPrice && (
                    <Text style={styles.modalOriginalPrice}>{product.originalPrice}</Text>
                  )}
                </View>

                {product.rating && (
                  <View style={styles.modalRatingContainer}>
                    <View style={styles.stars}>
                      {renderStars(product.rating)}
                    </View>
                    <Text style={styles.modalRatingText}>
                      {product.rating.toFixed(1)} ({product.ratingCount} reviews)
                    </Text>
                  </View>
                )}

                <Text style={styles.modalDescription}>{product.description}</Text>

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Available Colors</Text>
                    <View style={styles.colorOptions}>
                      {product.colors.map((color, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.colorOption,
                            selectedColor === color.name && styles.selectedColorOption
                          ]}
                          onPress={() => setSelectedColor(color.name)}
                        >
                          <View 
                            style={[
                              styles.colorSwatch, 
                              { backgroundColor: color.hex }
                            ]} 
                          />
                          <Text style={styles.colorName}>{color.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Available Sizes</Text>
                    <View style={styles.sizeOptions}>
                      {product.sizes.map((size, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.sizeOption,
                            selectedSize === size.size && styles.selectedSizeOption
                          ]}
                          onPress={() => setSelectedSize(size.size)}
                        >
                          <Text style={styles.sizeText}>{size.size}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Occasions */}
                {product.occasion && product.occasion.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Perfect For</Text>
                    <View style={styles.occasionTags}>
                      {product.occasion.map((occ, index) => (
                        <View key={index} style={styles.modalOccasionTag}>
                          <Text style={styles.modalOccasionText}>{occ}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <LinearGradient
                  colors={['#E91E63', '#FF6B9D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalAddBtn}
                >
                  <TouchableOpacity 
                    style={styles.modalAddBtnInner}
                    onPress={handleAddToWardrobe}
                    disabled={addingToWardrobe}
                  >
                    {addingToWardrobe ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.modalAddBtnText}>Add to Wardrobe</Text>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Wardrobe Selection Modal */}
      <Modal
        visible={showWardrobeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWardrobeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.wardrobeModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Wardrobe</Text>
              <TouchableOpacity onPress={() => setShowWardrobeModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.selectedProductInfo}>
              <Text style={styles.selectedProductName}>{product.name}</Text>
              <Text style={styles.selectedProductPrice}>{product.price}</Text>
            </View>

            <Text style={styles.sectionTitle}>Choose Wardrobe</Text>
            
            {loadingWardrobes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text style={styles.loadingText}>Loading wardrobes...</Text>
              </View>
            ) : (
              <ScrollView style={styles.wardrobeList}>
                {wardrobes.map((wardrobe) => (
                  <TouchableOpacity
                    key={wardrobe._id}
                    style={styles.wardrobeOption}
                    onPress={() => addToSpecificWardrobe(wardrobe._id)}
                    disabled={addingToWardrobe}
                  >
                    <View style={styles.wardrobeEmoji}>
                      {wardrobe.occasionType === 'Party' ? '🎉' :
                       wardrobe.occasionType === 'Casual' ? '👕' :
                       wardrobe.occasionType === 'Formal' ? '👔' :
                       wardrobe.occasionType === 'Ethnic' ? '👘' : '👗'}
                    </View>
                    <View style={styles.wardrobeInfo}>
                      <Text style={styles.wardrobeName}>{wardrobe.name}</Text>
                      <Text style={styles.wardrobeCount}>
                        {wardrobe.itemCount} items • {wardrobe.occasionType}
                      </Text>
                    </View>
                    <Text style={styles.addIcon}>+</Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity style={styles.createNewWardrobe}>
                  <Text style={styles.createNewText}>Create New Wardrobe</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  trendingText: {
    fontSize: 10,
    color: '#E91E63',
    fontWeight: '600',
    marginLeft: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E91E63',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  occasionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  occasionTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  occasionText: {
    fontSize: 10,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  addToWardrobeBtn: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addToWardrobeBtnInner: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToWardrobeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  showMoreBtn: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E91E63',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  showMoreText: {
    color: '#E91E63',
    fontSize: 12,
    fontWeight: '600',
  },
  reactions: {
    position: 'absolute',
    bottom: -12,
    right: 12,
    flexDirection: 'row',
    backgroundColor: '#EAE8FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  reactionButtonActive: {
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 10,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  modalProductInfo: {
    padding: 16,
  },
  modalProductName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  modalProductBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalCurrentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
    marginRight: 12,
  },
  modalOriginalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  modalRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalRatingText: {
    fontSize: 12,
    color: '#666',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  selectedColorOption: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
    padding: 4,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 4,
  },
  colorName: {
    fontSize: 10,
    color: '#666',
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSizeOption: {
    borderColor: '#E91E63',
    backgroundColor: '#E91E63',
  },
  sizeText: {
    fontSize: 12,
    color: '#666',
  },
  occasionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalOccasionTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  modalOccasionText: {
    fontSize: 12,
    color: '#666',
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalAddBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalAddBtnInner: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAddBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  wardrobeModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  wardrobeList: {
    maxHeight: 300,
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
    color: '#E91E63',
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
    color: '#E91E63',
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
    color: '#E91E63',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});
