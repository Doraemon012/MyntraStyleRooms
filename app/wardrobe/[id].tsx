import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
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
  reactions: { userId: string; type: 'like' | 'love' | 'dislike' }[];
}

interface OutfitSuggestion {
  id: string;
  name: string;
  items: string[];
  occasion: string;
  aiConfidence: number;
}

const mockItems: WardrobeItem[] = [
  {
    id: '1',
    name: 'Red Silk Saree with Golden Border',
    price: '₹4,999',
    category: 'Ethnic Wear',
    addedBy: 'AI Stylist',
    isPurchased: false,
    reactions: [
      { userId: 'user1', type: 'love' },
      { userId: 'user2', type: 'like' },
    ],
  },
  {
    id: '2',
    name: 'Gold Jhumka Earrings',
    price: '₹2,499',
    category: 'Jewelry',
    addedBy: 'Priya',
    isPurchased: true,
    purchasedBy: 'You',
    reactions: [
      { userId: 'user1', type: 'love' },
    ],
  },
  {
    id: '3',
    name: 'Traditional Mojaris',
    price: '₹1,899',
    category: 'Footwear',
    addedBy: 'You',
    isPurchased: false,
    reactions: [],
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
          <Text style={styles.itemEmoji}>
            {item.category === 'Ethnic Wear' ? '👗' : 
             item.category === 'Jewelry' ? '💍' : '👠'}
          </Text>
        </View>
        <View style={styles.itemInfo}>
          <ThemedText style={styles.itemName}>{item.name}</ThemedText>
          <Text style={styles.itemPrice}>{item.price}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.addedBy}>Added by {item.addedBy}</Text>
        </View>
        {item.isPurchased && (
          <View style={styles.purchasedBadge}>
            <Text style={styles.purchasedText}>✅ Purchased</Text>
            <Text style={styles.purchasedBy}>by {item.purchasedBy}</Text>
          </View>
        )}
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
    <ThemedView style={styles.container}>
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
            onPress={() => setActiveTab('outfits')}
          >
            <Text style={[styles.tabText, activeTab === 'outfits' && styles.activeTabText]}>
              AI Outfits ({mockOutfits.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'items' ? (
          <FlatList
            data={items}
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
    width: 60,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  addedBy: {
    fontSize: 12,
    color: '#999',
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