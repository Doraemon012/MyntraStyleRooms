import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { catalogAPI } from '../services/catalogApi';

interface Wardrobe {
  _id: string;
  name: string;
  emoji: string;
  description?: string;
  occasionType: string;
  itemCount: number;
  lastUpdated: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  members: Array<{
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    role: string;
    joinedAt: string;
  }>;
  roomId: string;
  isPrivate: boolean;
  budgetRange: {
    min: number;
    max: number;
  };
}

interface WardrobeItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    images: Array<{
      url: string;
      alt: string;
      isPrimary: boolean;
    }>;
    category: string;
    subcategory: string;
    rating: {
      average: number;
      count: number;
    };
    isNew?: boolean;
    isTrending?: boolean;
    isSustainable?: boolean;
  };
  addedBy: {
    _id: string;
    name: string;
    email: string;
  };
  addedAt: string;
  isPurchased: boolean;
  purchasedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  purchasedAt?: string;
  reactions: Array<{
    userId: string;
    type: 'like' | 'love' | 'dislike';
    createdAt: string;
  }>;
  notes?: string;
  customTags?: string[];
  priority: 'low' | 'medium' | 'high';
}

interface RoomWardrobeManagerProps {
  roomId: string;
  userId: string;
  onWardrobeSelect?: (wardrobe: Wardrobe) => void;
  onItemSelect?: (item: WardrobeItem) => void;
}

const RoomWardrobeManager: React.FC<RoomWardrobeManagerProps> = ({
  roomId,
  userId,
  onWardrobeSelect,
  onItemSelect,
}) => {
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([]);
  const [selectedWardrobe, setSelectedWardrobe] = useState<Wardrobe | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wardrobes for the room
  const fetchWardrobes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await catalogAPI.wardrobe.getAll({ roomId });
      setWardrobes(data.data.wardrobes);
    } catch (err) {
      console.error('Error fetching wardrobes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch wardrobes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch items for selected wardrobe
  const fetchWardrobeItems = async (wardrobeId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await catalogAPI.wardrobe.getItems(wardrobeId);
      setWardrobeItems(data.data.items);
    } catch (err) {
      console.error('Error fetching wardrobe items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch wardrobe items');
    } finally {
      setLoading(false);
    }
  };

  // Handle wardrobe selection
  const handleWardrobeSelect = (wardrobe: Wardrobe) => {
    setSelectedWardrobe(wardrobe);
    fetchWardrobeItems(wardrobe._id);
    onWardrobeSelect?.(wardrobe);
  };

  // Handle item selection
  const handleItemSelect = (item: WardrobeItem) => {
    onItemSelect?.(item);
  };

  // Add item to wardrobe
  const handleAddItem = async (productId: string) => {
    if (!selectedWardrobe) return;

    try {
      await catalogAPI.wardrobe.addItem(selectedWardrobe._id, {
        productId,
        priority: 'medium',
      });
      
      // Refresh wardrobe items
      await fetchWardrobeItems(selectedWardrobe._id);
      
      Alert.alert('Success', 'Item added to wardrobe successfully');
    } catch (err) {
      console.error('Error adding item to wardrobe:', err);
      Alert.alert('Error', 'Failed to add item to wardrobe');
    }
  };

  // Remove item from wardrobe
  const handleRemoveItem = async (itemId: string) => {
    if (!selectedWardrobe) return;

    try {
      await catalogAPI.wardrobe.removeItem(selectedWardrobe._id, itemId);
      
      // Refresh wardrobe items
      await fetchWardrobeItems(selectedWardrobe._id);
      
      Alert.alert('Success', 'Item removed from wardrobe successfully');
    } catch (err) {
      console.error('Error removing item from wardrobe:', err);
      Alert.alert('Error', 'Failed to remove item from wardrobe');
    }
  };

  // Add reaction to item
  const handleAddReaction = async (itemId: string, reactionType: 'like' | 'love' | 'dislike') => {
    if (!selectedWardrobe) return;

    try {
      await catalogAPI.wardrobe.addReaction(selectedWardrobe._id, itemId, reactionType);
      
      // Refresh wardrobe items
      await fetchWardrobeItems(selectedWardrobe._id);
    } catch (err) {
      console.error('Error adding reaction:', err);
      Alert.alert('Error', 'Failed to add reaction');
    }
  };

  // Mark item as purchased
  const handleMarkAsPurchased = async (itemId: string) => {
    if (!selectedWardrobe) return;

    try {
      await catalogAPI.wardrobe.markAsPurchased(selectedWardrobe._id, itemId);
      
      // Refresh wardrobe items
      await fetchWardrobeItems(selectedWardrobe._id);
      
      Alert.alert('Success', 'Item marked as purchased');
    } catch (err) {
      console.error('Error marking item as purchased:', err);
      Alert.alert('Error', 'Failed to mark item as purchased');
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWardrobes();
    if (selectedWardrobe) {
      await fetchWardrobeItems(selectedWardrobe._id);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWardrobes();
  }, [roomId]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading wardrobes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWardrobes}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Wardrobes List */}
      <View style={styles.wardrobesSection}>
        <Text style={styles.sectionTitle}>Wardrobes ({wardrobes.length})</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.wardrobesScrollView}
        >
          {wardrobes.map((wardrobe) => (
            <TouchableOpacity
              key={wardrobe._id}
              style={[
                styles.wardrobeCard,
                selectedWardrobe?._id === wardrobe._id && styles.selectedWardrobeCard
              ]}
              onPress={() => handleWardrobeSelect(wardrobe)}
            >
              <Text style={styles.wardrobeEmoji}>{wardrobe.emoji}</Text>
              <Text style={styles.wardrobeName} numberOfLines={1}>
                {wardrobe.name}
              </Text>
              <Text style={styles.wardrobeItemCount}>
                {wardrobe.itemCount} items
              </Text>
              <Text style={styles.wardrobeOccasion}>
                {wardrobe.occasionType}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Wardrobe Items */}
      {selectedWardrobe && (
        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>
              {selectedWardrobe.name} Items ({wardrobeItems.length})
            </Text>
            <TouchableOpacity style={styles.addItemButton}>
              <Ionicons name="add" size={20} color="#007AFF" />
              <Text style={styles.addItemButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.itemsScrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {wardrobeItems.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.itemCard}
                onPress={() => handleItemSelect(item)}
              >
                <View style={styles.itemImageContainer}>
                  <Text style={styles.itemImagePlaceholder}>
                    {item.productId.images[0]?.url ? '📷' : '👕'}
                  </Text>
                </View>
                
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.productId.name}
                  </Text>
                  <Text style={styles.itemBrand}>{item.productId.brand}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.productId.price}
                    {item.productId.originalPrice && (
                      <Text style={styles.originalPrice}>
                        {' '}₹{item.productId.originalPrice}
                      </Text>
                    )}
                  </Text>
                  
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemAddedBy}>
                      Added by {item.addedBy.name}
                    </Text>
                    <Text style={styles.itemDate}>
                      {new Date(item.addedAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.itemActions}>
                    <View style={styles.reactionButtons}>
                      <TouchableOpacity
                        style={styles.reactionButton}
                        onPress={() => handleAddReaction(item._id, 'like')}
                      >
                        <Ionicons name="thumbs-up" size={16} color="#007AFF" />
                        <Text style={styles.reactionCount}>
                          {item.reactions.filter(r => r.type === 'like').length}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.reactionButton}
                        onPress={() => handleAddReaction(item._id, 'love')}
                      >
                        <Ionicons name="heart" size={16} color="#FF3B30" />
                        <Text style={styles.reactionCount}>
                          {item.reactions.filter(r => r.type === 'love').length}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.actionButtons}>
                      {!item.isPurchased ? (
                        <TouchableOpacity
                          style={styles.purchaseButton}
                          onPress={() => handleMarkAsPurchased(item._id)}
                        >
                          <Ionicons name="checkmark" size={16} color="#34C759" />
                          <Text style={styles.purchaseButtonText}>Buy</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.purchasedBadge}>
                          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                          <Text style={styles.purchasedText}>Purchased</Text>
                        </View>
                      )}
                      
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveItem(item._id)}
                      >
                        <Ionicons name="trash" size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  wardrobesSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  wardrobesScrollView: {
    flexDirection: 'row',
  },
  wardrobeCard: {
    width: 120,
    padding: 12,
    marginRight: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedWardrobeCard: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  wardrobeEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  wardrobeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  wardrobeItemCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  wardrobeOccasion: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
  },
  itemsSection: {
    flex: 1,
    padding: 16,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  addItemButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  itemsScrollView: {
    flex: 1,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemImagePlaceholder: {
    fontSize: 32,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemAddedBy: {
    fontSize: 12,
    color: '#8E8E93',
  },
  itemDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reactionButtons: {
    flexDirection: 'row',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
  },
  reactionCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#8E8E93',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E8',
    borderRadius: 6,
    marginRight: 8,
  },
  purchaseButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  purchasedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E8',
    borderRadius: 6,
    marginRight: 8,
  },
  purchasedText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  removeButton: {
    padding: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
  },
});

export default RoomWardrobeManager;
