import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/contexts/session-context';

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  brand: string;
  rating: number;
  isAiRecommended?: boolean;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  count: number;
}

const mockCategories: Category[] = [
  { id: '1', name: 'Ethnic', emoji: '👗', count: 1250 },
  { id: '2', name: 'Western', emoji: '👔', count: 980 },
  { id: '3', name: 'Footwear', emoji: '👠', count: 750 },
  { id: '4', name: 'Accessories', emoji: '💍', count: 540 },
  { id: '5', name: 'Beauty', emoji: '💄', count: 320 },
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Floral Print Maxi Dress',
    price: '₹2,499',
    category: 'Dresses',
    brand: 'Libas',
    rating: 4.3,
    isAiRecommended: true,
  },
  {
    id: '2',
    name: 'Silk Blend Saree',
    price: '₹4,999',
    category: 'Sarees',
    brand: 'Soch',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Block Heels Sandals',
    price: '₹1,899',
    category: 'Footwear',
    brand: 'Metro',
    rating: 4.1,
    isAiRecommended: true,
  },
  {
    id: '4',
    name: 'Statement Earrings',
    price: '₹899',
    category: 'Jewelry',
    brand: 'Accessorize',
    rating: 4.4,
  },
];



// Session Overlay Component
const SessionOverlay = ({ 
  participants, 
  onProductClick 
}: { 
  participants: any[], 
  onProductClick: (productId: string) => void 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (participants.length === 0) return null;

  return (
    <View style={sessionStyles.overlay}>
      <TouchableOpacity 
        style={sessionStyles.sessionIndicator}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={sessionStyles.sessionIcon}>👥</Text>
        <Text style={sessionStyles.sessionText}>{participants.length} viewing</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={sessionStyles.expandedView}>
          <Text style={sessionStyles.expandedTitle}>Session Members</Text>
          {participants.map(participant => (
            <TouchableOpacity
              key={participant.id}
              style={sessionStyles.participantItem}
              onPress={() => participant.currentProduct && onProductClick(participant.currentProduct.id)}
            >
              <Text style={sessionStyles.participantName}>{participant.name}</Text>
              {participant.currentProduct ? (
                <View style={sessionStyles.productInfo}>
                  <Text style={sessionStyles.productIcon}>{participant.currentProduct.image}</Text>
                  <Text style={sessionStyles.productName}>{participant.currentProduct.name}</Text>
                </View>
              ) : (
                <Text style={sessionStyles.browsingText}>Browsing...</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};


export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const { isInSession, isInLiveView, sessionParticipants } = useSession();

  const handleProductClick = (productId: string) => {
    console.log('Navigate to product:', productId);
    // Add navigation logic here
  };

  // Only show session overlay if user is in session AND in live view
  const shouldShowSessionOverlay = isInSession && isInLiveView;



  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.name && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.name ? null : item.name)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
      <Text style={styles.categoryCount}>{item.count}+</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      {item.isAiRecommended && (
        <View style={styles.aiRecommendedBadge}>
          <Text style={styles.aiRecommendedText}>AI Pick</Text>
        </View>
      )}
      
      <View style={styles.productImagePlaceholder}>
        <Text style={styles.productEmoji}>
          {item.category === 'Dresses' ? '👗' : 
           item.category === 'Sarees' ? '🥻' : 
           item.category === 'Footwear' ? '👠' : '💍'}
        </Text>
      </View>
      
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>{item.price}</Text>
          <View style={styles.rating}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.addToWardrobeButton}>
        <Text style={styles.addToWardrobeText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView>

        {shouldShowSessionOverlay && (
          <SessionOverlay 
            participants={sessionParticipants}
            onProductClick={handleProductClick}
          />
        )}


        <View style={styles.header}>
          <ThemedText style={styles.title}>Discover Fashion</ThemedText>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, styles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.categoriesSection}>
          <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
          <FlatList
            data={mockCategories}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <ThemedText style={styles.sectionTitle}>AI Recommendations</ThemedText>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.aiSubtitle}>
            Based on your style preferences and recent activity
          </Text>
        </View>

        <View style={styles.trendsSection}>
          <View style={styles.trendsHeader}>
            <ThemedText style={styles.sectionTitle}>Trending Now</ThemedText>
            <View style={styles.trendTags}>
              <View style={styles.trendTag}>
                <Text style={styles.trendTagText}>#WeddingSeason</Text>
              </View>
              <View style={styles.trendTag}>
                <Text style={styles.trendTagText}>#Festive</Text>
              </View>
            </View>
          </View>
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCategory: {
    backgroundColor: '#ff6b6b',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  aiSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  seeAllText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  trendsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendTags: {
    flexDirection: 'row',
  },
  trendTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
  },
  trendTagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  productsList: {
    paddingHorizontal: 16,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  aiRecommendedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  aiRecommendedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productEmoji: {
    fontSize: 32,
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  addToWardrobeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: '#ff6b6b',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToWardrobeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const sessionStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 100,
    right: 16,
    zIndex: 1000,
  },
  sessionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sessionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sessionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  expandedView: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  participantItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  participantName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  productName: {
    fontSize: 12,
    color: '#1a1a1a',
    flex: 1,
  },
  browsingText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});