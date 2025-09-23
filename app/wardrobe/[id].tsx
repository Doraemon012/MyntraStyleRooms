import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WardrobeItem {
  id: string;
  name: string;
  price: string;
  category: string;
  addedBy: string;
  isPurchased: boolean;
  purchasedBy?: string;
  purchasedByUsers: string[]; // Array of user IDs who purchased this item
  reactions: { userId: string; type: 'like' | 'love' | 'dislike' }[];
  image?: string;
  description?: string;
}

interface OutfitSuggestion {
  id: string;
  name: string;
  items: string[];
  occasion: string;
  aiConfidence: number;
}

// Mock room members data
const roomMembers = [
  { id: 'user1', name: 'Priya', avatar: '👩' },
  { id: 'user2', name: 'Richa', avatar: '👩‍🦱' },
  { id: 'user3', name: 'Neyati', avatar: '👩‍🦰' },
  { id: 'user4', name: 'Sneha', avatar: '👩‍💼' },
  { id: 'user5', name: 'Ananya', avatar: '👩‍🎨' },
  { id: 'currentUser', name: 'You', avatar: '👤' },
];

const mockItems: WardrobeItem[] = [
  {
    id: '1',
    name: 'Red Silk Saree with Golden Border',
    price: '₹4,999',
    category: 'Ethnic Wear',
    addedBy: 'AI Stylist',
    isPurchased: true,
    purchasedBy: 'You',
    purchasedByUsers: ['currentUser', 'user1', 'user2'],
    reactions: [
      { userId: 'user1', type: 'love' },
      { userId: 'user2', type: 'like' },
      { userId: 'user3', type: 'love' },
      { userId: 'user4', type: 'like' },
      { userId: 'user5', type: 'love' },
      { userId: 'currentUser', type: 'love' },
    ],
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
    description: 'Elegant red silk saree with intricate golden border work',
  },
  {
    id: '2',
    name: 'Gold Jhumka Earrings',
    price: '₹2,499',
    category: 'Jewelry',
    addedBy: 'Priya',
    isPurchased: true,
    purchasedBy: 'Priya',
    purchasedByUsers: ['user1', 'user3', 'user4'],
    reactions: [
      { userId: 'user1', type: 'love' },
      { userId: 'user2', type: 'love' },
      { userId: 'user3', type: 'like' },
      { userId: 'user5', type: 'love' },
    ],
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=400&fit=crop',
    description: 'Traditional gold jhumka earrings with intricate design',
  },
  {
    id: '3',
    name: 'Traditional Mojaris',
    price: '₹1,899',
    category: 'Footwear',
    addedBy: 'You',
    isPurchased: false,
    purchasedByUsers: ['user2'],
    reactions: [
      { userId: 'user1', type: 'like' },
      { userId: 'user2', type: 'love' },
      { userId: 'user4', type: 'like' },
    ],
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
    description: 'Comfortable traditional mojari shoes for special occasions',
  },
  {
    id: '4',
    name: 'Designer Handbag',
    price: '₹3,299',
    category: 'Accessories',
    addedBy: 'Richa',
    isPurchased: true,
    purchasedBy: 'Richa',
    purchasedByUsers: ['user2', 'user5'],
    reactions: [
      { userId: 'user1', type: 'love' },
      { userId: 'user2', type: 'love' },
      { userId: 'user3', type: 'love' },
      { userId: 'user4', type: 'love' },
      { userId: 'user5', type: 'love' },
      { userId: 'currentUser', type: 'like' },
    ],
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
    description: 'Stylish designer handbag perfect for any occasion',
  },
  {
    id: '5',
    name: 'Pearl Necklace Set',
    price: '₹5,999',
    category: 'Jewelry',
    addedBy: 'Neyati',
    isPurchased: false,
    purchasedByUsers: [],
    reactions: [
      { userId: 'user1', type: 'like' },
      { userId: 'user3', type: 'love' },
      { userId: 'user4', type: 'like' },
    ],
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=400&fit=crop',
    description: 'Classic pearl necklace set with matching earrings',
  },
  {
    id: '6',
    name: 'Silk Scarf',
    price: '₹899',
    category: 'Accessories',
    addedBy: 'Sneha',
    isPurchased: true,
    purchasedBy: 'Sneha',
    purchasedByUsers: ['user4', 'user1', 'user2', 'user3'],
    reactions: [
      { userId: 'user1', type: 'love' },
      { userId: 'user2', type: 'love' },
      { userId: 'user3', type: 'love' },
      { userId: 'user4', type: 'love' },
      { userId: 'user5', type: 'love' },
      { userId: 'currentUser', type: 'love' },
    ],
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    description: 'Luxurious silk scarf with beautiful patterns',
  },
];

const mockOutfits: OutfitSuggestion[] = [
  {
    id: '1',
    name: 'Traditional Wedding Look',
    items: ['Red Silk Saree', 'Gold Jhumkas', 'Traditional Mojaris'],
    occasion: 'Wedding Ceremony',
    aiConfidence: 95,
  },
  {
    id: '2',
    name: 'Reception Ready',
    items: ['Red Silk Saree', 'Gold Jhumkas', 'Block Heels'],
    occasion: 'Wedding Reception',
    aiConfidence: 88,
  },
];

export default function WardrobeDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'items' | 'outfits'>('items');
  const [items, setItems] = useState<WardrobeItem[]>(mockItems);
  const [filterType, setFilterType] = useState<'all' | 'mostLiked' | 'mostBought'>('all');

  // Helper function to get total likes for an item
  const getTotalLikes = (item: WardrobeItem) => {
    return item.reactions.filter(r => r.type === 'like' || r.type === 'love').length;
  };

  // Helper function to get total purchases for an item
  const getTotalPurchases = (item: WardrobeItem) => {
    return item.purchasedByUsers.length;
  };

  // Filter items based on selected filter
  const getFilteredItems = () => {
    switch (filterType) {
      case 'mostLiked':
        return [...items].sort((a, b) => getTotalLikes(b) - getTotalLikes(a));
      case 'mostBought':
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

  const addReaction = (itemId: string, type: 'like' | 'love' | 'dislike') => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const existingReaction = item.reactions.find(r => r.userId === 'currentUser');
          let newReactions = item.reactions.filter(r => r.userId !== 'currentUser');
          
          if (!existingReaction || existingReaction.type !== type) {
            newReactions.push({ userId: 'currentUser', type });
          }
          
          return { ...item, reactions: newReactions };
        }
        return item;
      })
    );
  };

  const renderItem = ({ item }: { item: WardrobeItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemImagePlaceholder}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.itemImage} />
          ) : (
            <Text style={styles.itemEmoji}>
              {item.category === 'Ethnic Wear' ? '👗' : 
               item.category === 'Jewelry' ? '💍' : 
               item.category === 'Footwear' ? '👠' : 
               item.category === 'Accessories' ? '👜' : '👕'}
            </Text>
          )}
        </View>
        <View style={styles.itemInfo}>
          <ThemedText style={styles.itemName}>{item.name}</ThemedText>
          <Text style={styles.itemPrice}>{item.price}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.addedBy}>Added by {item.addedBy}</Text>
          
          {/* Show purchase count */}
          {item.purchasedByUsers.length > 0 && (
            <View style={styles.purchaseInfo}>
              <Text style={styles.purchaseText}>
                🛒 {item.purchasedByUsers.length} room member{item.purchasedByUsers.length > 1 ? 's' : ''} bought this
              </Text>
              <Text style={styles.purchasedByNames}>
                {item.purchasedByUsers.slice(0, 3).map(userId => getUserName(userId)).join(', ')}
                {item.purchasedByUsers.length > 3 && ` +${item.purchasedByUsers.length - 3} more`}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.itemActions}>
        <View style={styles.reactions}>
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => addReaction(item.id, 'like')}
          >
            <Text style={styles.reactionIcon}>👍</Text>
            <Text style={styles.reactionCount}>
              {item.reactions.filter(r => r.type === 'like').length}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => addReaction(item.id, 'love')}
          >
            <Text style={styles.reactionIcon}>❤️</Text>
            <Text style={styles.reactionCount}>
              {item.reactions.filter(r => r.type === 'love').length}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>
            {item.isPurchased ? 'View Product' : 'Buy Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOutfit = ({ item }: { item: OutfitSuggestion }) => (
    <View style={styles.outfitCard}>
      <View style={styles.outfitHeader}>
        <ThemedText style={styles.outfitName}>{item.name}</ThemedText>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>{item.aiConfidence}% match</Text>
        </View>
      </View>
      <Text style={styles.occasion}>For: {item.occasion}</Text>
      
      <View style={styles.outfitItems}>
        {item.items.map((itemName, index) => (
          <View key={index} style={styles.outfitItemTag}>
            <Text style={styles.outfitItemText}>{itemName}</Text>
          </View>
        ))}
      </View>

      <View style={styles.outfitActions}>
        <TouchableOpacity style={styles.saveOutfitButton}>
          <Text style={styles.saveOutfitText}>Save Outfit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tryOnButton}>
          <Text style={styles.tryOnText}>Virtual Try-On</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#f8f9fa' }]}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <View style={styles.wardrobeInfo}>
            <ThemedText style={styles.wardrobeName}>Family Wedding 👰</ThemedText>
            <Text style={styles.memberInfo}>5 members • Owner: You</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuText}>⋯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'items' && styles.activeTab]}
            onPress={() => setActiveTab('items')}
          >
            <Text style={[styles.tabText, activeTab === 'items' && styles.activeTabText]}>
              Items ({mockItems.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'outfits' && styles.activeTab]}
            onPress={() => router.push(`/wardrobe/ai-outfits?wardrobeId=${id}`)}
          >
            <Text style={[styles.tabText, activeTab === 'outfits' && styles.activeTabText]}>
              AI Outfits ({mockOutfits.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'items' && (
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'all' && styles.activeFilterButton]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.filterButtonText, filterType === 'all' && styles.activeFilterButtonText]}>
                All Items
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'mostLiked' && styles.activeFilterButton]}
              onPress={() => setFilterType('mostLiked')}
            >
              <Text style={[styles.filterButtonText, filterType === 'mostLiked' && styles.activeFilterButtonText]}>
                Most Liked
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'mostBought' && styles.activeFilterButton]}
              onPress={() => setFilterType('mostBought')}
            >
              <Text style={[styles.filterButtonText, filterType === 'mostBought' && styles.activeFilterButtonText]}>
                Most Bought
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'items' ? (
          <FlatList
            data={getFilteredItems()}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.itemsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsListContent}
          />
        ) : (
          <FlatList
            data={mockOutfits}
            renderItem={renderOutfit}
            keyExtractor={item => item.id}
            style={styles.itemsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsListContent}
          />
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.addItemButton}>
            <Text style={styles.addItemText}>+ Add Item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareText}>Share Wardrobe</Text>
          </TouchableOpacity>
        </View>
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
  wardrobeInfo: {
    flex: 1,
    alignItems: 'center',
  },
  wardrobeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberInfo: {
    fontSize: 12,
    color: '#666',
  },
  menuButton: {
    padding: 8,
  },
  menuText: {
    fontSize: 20,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#ff6b6b',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterButton: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImagePlaceholder: {
    width: 80,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    lineHeight: 22,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  addedBy: {
    fontSize: 14,
    color: '#999',
  },
  purchaseInfo: {
    marginTop: 4,
    padding: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  purchaseText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 2,
  },
  purchasedByNames: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  purchasedBadge: {
    alignItems: 'center',
    paddingLeft: 8,
  },
  purchasedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  purchasedBy: {
    fontSize: 10,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reactions: {
    flexDirection: 'row',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  reactionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    color: '#666',
  },
  buyButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  outfitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  confidenceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  occasion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  outfitItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  outfitItemTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  outfitItemText: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  outfitActions: {
    flexDirection: 'row',
  },
  saveOutfitButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  saveOutfitText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tryOnButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tryOnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  addItemButton: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  addItemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  shareText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
});