import { ThemedView } from '@/components/themed-view';
import { getDefaultImageProps, getProductImageUri } from '@/utils/imageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wardrobeApi, WardrobeItem } from '../../services/wardrobeApi';

// Remove the local interface since we're importing from wardrobeApi

// Mock room members data
const roomMembers = [
  { id: 'user1', name: 'Priya', avatar: '👩' },
  { id: 'user2', name: 'Richa', avatar: '👩‍🦱' },
  { id: 'user3', name: 'Neyati', avatar: '👩‍🦰' },
  { id: 'user4', name: 'Sneha', avatar: '👩‍💼' },
  { id: 'user5', name: 'Ananya', avatar: '👩‍🎨' },
  { id: 'currentUser', name: 'You', avatar: '👤' },
];

const wardrobeItems: WardrobeItem[] = [
  {
    id: '1',
    name: 'Fur Coat',
    price: '₹1,999',
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=200&h=300&fit=crop',
    isFavorited: false,
    category: 'Outerwear',
    addedBy: 'AI Stylist',
    purchasedByUsers: ['user1', 'user2', 'user3'],
    reactions: [
      { userId: 'user1', type: 'love' },
      { userId: 'user2', type: 'like' },
      { userId: 'user3', type: 'love' },
      { userId: 'user4', type: 'like' },
      { userId: 'user5', type: 'love' },
    ],
  },
  {
    id: '2',
    name: 'Floral Dress',
    price: '₹1,199',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=300&fit=crop',
    isFavorited: false,
    category: 'Dresses',
    addedBy: 'Priya',
    purchasedByUsers: ['user1', 'user4'],
    reactions: [
      { userId: 'user1', type: 'love' },
      { userId: 'user2', type: 'love' },
      { userId: 'user3', type: 'like' },
      { userId: 'user4', type: 'love' },
      { userId: 'user5', type: 'like' },
      { userId: 'currentUser', type: 'love' },
    ],
  },
  {
    id: '3',
    name: 'Ribbed Top',
    price: '₹599',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=300&fit=crop',
    isFavorited: false,
    category: 'Tops',
    addedBy: 'You',
    purchasedByUsers: ['user2', 'user3', 'user4', 'user5'],
    reactions: [
      { userId: 'user1', type: 'like' },
      { userId: 'user2', type: 'love' },
      { userId: 'user3', type: 'love' },
      { userId: 'user4', type: 'love' },
      { userId: 'user5', type: 'love' },
      { userId: 'currentUser', type: 'like' },
    ],
  },
  {
    id: '4',
    name: 'Cocktail Dress',
    price: '₹1,799',
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200&h=300&fit=crop',
    isFavorited: false,
    category: 'Dresses',
    addedBy: 'Richa',
    purchasedByUsers: ['user1'],
    reactions: [
      { userId: 'user1', type: 'love' },
      { userId: 'user2', type: 'like' },
      { userId: 'user3', type: 'like' },
    ],
  },
  {
    id: '5',
    name: 'Designer Blouse',
    price: '₹899',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&h=300&fit=crop',
    isFavorited: false,
    category: 'Tops',
    addedBy: 'Neyati',
    purchasedByUsers: ['user2', 'user3', 'user4', 'user5', 'currentUser'],
    reactions: [
      { userId: 'user1', type: 'love' },
      { userId: 'user2', type: 'love' },
      { userId: 'user3', type: 'love' },
      { userId: 'user4', type: 'love' },
      { userId: 'user5', type: 'love' },
      { userId: 'currentUser', type: 'love' },
    ],
  },
  {
    id: '6',
    name: 'Evening Gown',
    price: '₹2,499',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=300&fit=crop',
    isFavorited: false,
    category: 'Dresses',
    addedBy: 'Sneha',
    purchasedByUsers: ['user1', 'user2'],
    reactions: [
      { userId: 'user1', type: 'love' },
      { userId: 'user2', type: 'love' },
      { userId: 'user3', type: 'like' },
      { userId: 'user4', type: 'love' },
    ],
  },
  {
    id: '7',
    name: 'Casual T-Shirt',
    price: '₹399',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=300&fit=crop',
    isFavorited: false,
    category: 'Tops',
    addedBy: 'Ananya',
    purchasedByUsers: ['user1', 'user2', 'user3', 'user4', 'user5', 'currentUser'],
    reactions: [
      { userId: 'user1', type: 'like' },
      { userId: 'user2', type: 'like' },
      { userId: 'user3', type: 'like' },
      { userId: 'user4', type: 'like' },
      { userId: 'user5', type: 'like' },
      { userId: 'currentUser', type: 'like' },
    ],
  },
  {
    id: '8',
    name: 'Formal Blazer',
    price: '₹3,299',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=300&fit=crop',
    isFavorited: false,
    category: 'Outerwear',
    addedBy: 'AI Stylist',
    purchasedByUsers: ['user2', 'user4'],
    reactions: [
      { userId: 'user1', type: 'love' },
      { userId: 'user2', type: 'love' },
      { userId: 'user3', type: 'like' },
      { userId: 'user4', type: 'love' },
      { userId: 'user5', type: 'like' },
    ],
  },
];

export default function WardrobeItemsScreen() {
  const { categoryId, categoryName, wardrobeId } = useLocalSearchParams();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Most liked' | 'Most bought'>('All');

  useEffect(() => {
    if (wardrobeId) {
      loadWardrobeItems();
    }
  }, [wardrobeId]);

  const loadWardrobeItems = async () => {
    if (!wardrobeId) return;
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'Please log in to view wardrobe items');
        setLoading(false);
        return;
      }

      const response = await wardrobeApi.getWardrobeItems(token, wardrobeId as string, {
        limit: 50,
        sortBy: 'addedAt',
        sortOrder: 'desc'
      });

      if (response.status === 'success' && response.data) {
        setItems(response.data.items);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading wardrobe items:', error);
      Alert.alert('Error', 'Failed to load wardrobe items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get total likes for an item
  const getTotalLikes = (item: WardrobeItem) => {
    return item.reactions.filter(r => r.type === 'like' || r.type === 'love').length;
  };

  // Helper function to get total purchases for an item
  const getTotalPurchases = (item: WardrobeItem) => {
    return item.isPurchased ? 1 : 0;
  };

  // Filter items based on selected filter
  const getFilteredItems = () => {
    switch (activeFilter) {
      case 'Most liked':
        return [...items].sort((a, b) => getTotalLikes(b) - getTotalLikes(a));
      case 'Most bought':
        return [...items].sort((a, b) => getTotalPurchases(b) - getTotalPurchases(a));
      default:
        return items;
    }
  };

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = roomMembers.find(member => member.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Use the passed category name or default to "Striped Crop Shirts"
  const displayName = categoryName || 'Striped Crop Shirts';

  const toggleFavorite = (itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, isFavorited: !item.isFavorited } : item
      )
    );
  };

  const renderItem = ({ item }: { item: WardrobeItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: getProductImageUri(item.productId) }} 
          style={styles.itemImage}
          {...getDefaultImageProps()}
        />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item._id)}
        >
          <Text style={[styles.favoriteIcon, false && styles.favoriteIconActive]}>
            ♡
          </Text>
        </TouchableOpacity>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.gradient}
        >
          <View style={styles.priceTag}>
            <Text style={styles.itemName}>{item.productId.name}</Text>
            <Text style={styles.itemPrice}>₹{item.productId.price}</Text>
          </View>
        </LinearGradient>
      </View>
      
      {/* Enhanced item info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemCategory}>{item.productId.category}</Text>
        <Text style={styles.addedBy}>Added by {item.addedBy.name}</Text>
        
        {/* Show purchase status */}
        {item.isPurchased && (
          <View style={styles.purchaseInfo}>
            <Text style={styles.purchaseText}>
              🛒 Purchased by {item.purchasedBy?.name || 'Someone'}
            </Text>
          </View>
        )}
        
        {/* Show like count */}
        <View style={styles.likeInfo}>
          <Text style={styles.likeText}>
            ❤️ {getTotalLikes(item)} room member{getTotalLikes(item) > 1 ? 's' : ''} liked this
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#f8f8f8' }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>{displayName}</Text>
            <Text style={styles.itemCount}>121+ Items</Text>
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => router.push(`/wardrobe/ai-outfits?wardrobeId=${categoryId}`)}
          >
            <Text style={styles.filterIcon}>⚙</Text>
            <Text style={styles.filterText}>AI Powered</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterTabs}>
          {(['All', 'Most liked', 'Most bought'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity key={filter} onPress={() => setActiveFilter(filter)}>
                {isActive ? (
                  <LinearGradient
                    colors={['#FF6FD8', '#FF66A6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activeFilterTab}
                  >
                    <Text style={styles.activeFilterTabText}>{filter}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.filterTab}>
                    <Text style={styles.filterTabText}>{filter}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Loading wardrobe items...</Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredItems()}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsList}
            columnWrapperStyle={styles.row}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items in this wardrobe yet</Text>
                <Text style={styles.emptySubtext}>Add some products to get started!</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  backButton: {
    fontSize: 24,
    color: '#666',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
  },
  itemCount: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF69B4',
  },
  filterIcon: {
    fontSize: 12,
    color: '#FF69B4',
    marginRight: 4,
  },
  filterText: {
    fontSize: 12,
    color: '#FF69B4',
    fontWeight: '500',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
  },
  filterTabText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  itemsList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  itemInfo: {
    padding: 8,
  },
  itemCategory: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  addedBy: {
    fontSize: 9,
    color: '#999',
    marginBottom: 4,
  },
  purchaseInfo: {
    marginTop: 4,
    padding: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#4CAF50',
  },
  purchaseText: {
    fontSize: 8,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 1,
  },
  purchasedByNames: {
    fontSize: 7,
    color: '#666',
    fontStyle: 'italic',
  },
  likeInfo: {
    marginTop: 2,
  },
  likeText: {
    fontSize: 8,
    color: '#E91E63',
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
    height: 240,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'flex-end',
    padding: 8,
  },
  priceTag: {
    position: 'absolute',
    bottom: 16,
    left: 0,
	backgroundColor: 'rgba(86, 81, 81, 0.4)',
	paddingHorizontal: 6,
	paddingVertical: 4,
	borderRadius: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  favoriteIconActive: {
    color: '#FF69B4',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
  },
});
