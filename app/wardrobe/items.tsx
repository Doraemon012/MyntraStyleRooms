import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WardrobeItem {
  id: string;
  name: string;
  price: string;
  image: string;
  isFavorited: boolean;
}

const wardrobeItems: WardrobeItem[] = [
  {
    id: '1',
    name: 'Fur Coat',
    price: '₹1,999',
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=200&h=300&fit=crop',
    isFavorited: false,
  },
  {
    id: '2',
    name: 'Floral Dress',
    price: '₹1,199',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=300&fit=crop',
    isFavorited: false,
  },
  {
    id: '3',
    name: 'Ribbed Top',
    price: '₹599',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=300&fit=crop',
    isFavorited: false,
  },
  {
    id: '4',
    name: 'Cocktail Dress',
    price: '₹1,799',
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200&h=300&fit=crop',
    isFavorited: false,
  },
  {
    id: '5',
    name: 'Ribbed Top',
    price: '₹599',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&h=300&fit=crop',
    isFavorited: false,
  },
  {
    id: '6',
    name: 'Cocktail Dress',
    price: '₹1,799',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=300&fit=crop',
    isFavorited: false,
  },
  {
    id: '7',
    name: 'Ribbed Top',
    price: '₹599',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=300&fit=crop',
    isFavorited: false,
  },
  {
    id: '8',
    name: 'Cocktail Dress',
    price: '₹1,799',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=300&fit=crop',
    isFavorited: false,
  },
];

export default function WardrobeItemsScreen() {
  const { categoryId, categoryName } = useLocalSearchParams();
  const [items, setItems] = useState<WardrobeItem[]>(wardrobeItems);
  const [activeFilter, setActiveFilter] = useState('All');

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
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Text style={[styles.favoriteIcon, item.isFavorited && styles.favoriteIconActive]}>
            {item.isFavorited ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.gradient}
        >
          <View style={styles.priceTag}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>{displayName}</Text>
            <Text style={styles.itemCount}>121+ Items</Text>
          </View>
          <LinearGradient
            colors={['#FF6FD8', '#FF66A6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.filterButton}
          >
            <Text style={styles.filterIcon}>⚙</Text>
            <Text style={styles.filterText}>AI Powered</Text>
          </LinearGradient>
        </View>

        <View style={styles.filterTabs}>
          {['All', 'Most liked', 'Most bought'].map((filter) => {
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

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.itemsList}
          columnWrapperStyle={styles.row}
        />
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
	marginLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterIcon: {
    fontSize: 12,
    color: 'white',
    marginRight: 4,
  },
  filterText: {
    fontSize: 12,
    color: 'white',
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
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    fontSize: 13,
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
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  favoriteIcon: {
    fontSize: 14,
    color: '#FF69B4',
  },
  favoriteIconActive: {
    color: '#FF1744',
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
});
