import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface OutfitItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  isSelected: boolean;
  isMainItem?: boolean;
}

interface OutfitSuggestion {
  id: string;
  name: string;
  occasion: string;
  description: string;
  mainItem: OutfitItem;
  accessories: OutfitItem[];
  totalPrice: number;
  originalTotalPrice: number;
  totalDiscount: number;
  confidence: number;
}

// Mock data for outfit suggestions
const mockOutfitSuggestions: OutfitSuggestion[] = [
  {
    id: '1',
    name: 'Elegant Evening Look',
    occasion: 'Dinner Party',
    description: 'Perfect for a sophisticated dinner party',
    mainItem: {
      id: 'main1',
      name: 'Ritu Kumar Floral Dress',
      brand: 'aarke',
      price: 1450,
      originalPrice: 2900,
      discount: 50,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
      category: 'Dress',
      isMainItem: true,
      isSelected: true,
    },
    accessories: [
      {
        id: 'acc1',
        name: 'Sparkly Black Sandals',
        brand: 'Shezone',
        price: 855,
        originalPrice: 2000,
        discount: 57,
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop',
        category: 'Shoes',
        isSelected: true,
      },
      {
        id: 'acc2',
        name: 'Pink Structured Handbag',
        brand: 'Shanaya Trends',
        price: 932,
        originalPrice: 1864,
        discount: 50,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
        category: 'Handbag',
        isSelected: true,
      },
      {
        id: 'acc3',
        name: 'Elegant Watch',
        brand: 'WATCHSTAR',
        price: 280,
        originalPrice: 1900,
        discount: 85,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
        category: 'Watch',
        isSelected: true,
      },
    ],
    totalPrice: 3517,
    originalTotalPrice: 8997,
    totalDiscount: 61,
    confidence: 95,
  },
  {
    id: '2',
    name: 'Casual Day Out',
    occasion: 'Coffee Shop Visit',
    description: 'Comfortable and stylish for a casual day',
    mainItem: {
      id: 'main2',
      name: 'Blue Floral Dress',
      brand: 'aarke',
      price: 1200,
      originalPrice: 2400,
      discount: 50,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
      category: 'Dress',
      isMainItem: true,
      isSelected: true,
    },
    accessories: [
      {
        id: 'acc4',
        name: 'White Sneakers',
        brand: 'Nike',
        price: 2500,
        originalPrice: 3500,
        discount: 29,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
        category: 'Shoes',
        isSelected: true,
      },
      {
        id: 'acc5',
        name: 'Crossbody Bag',
        brand: 'H&M',
        price: 599,
        originalPrice: 999,
        discount: 40,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
        category: 'Handbag',
        isSelected: true,
      },
      {
        id: 'acc6',
        name: 'Minimalist Necklace',
        brand: 'Zara',
        price: 399,
        originalPrice: 799,
        discount: 50,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop',
        category: 'Jewelry',
        isSelected: true,
      },
    ],
    totalPrice: 4698,
    originalTotalPrice: 7698,
    totalDiscount: 39,
    confidence: 88,
  },
  {
    id: '3',
    name: 'Beach Day Look',
    occasion: 'Beach Day',
    description: 'Perfect for a relaxing beach day',
    mainItem: {
      id: 'main3',
      name: 'White Summer Dress',
      brand: 'aarke',
      price: 1800,
      originalPrice: 3600,
      discount: 50,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
      category: 'Dress',
      isMainItem: true,
      isSelected: true,
    },
    accessories: [
      {
        id: 'acc7',
        name: 'Straw Hat',
        brand: 'Accessorize',
        price: 1200,
        originalPrice: 2000,
        discount: 40,
        image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200&h=200&fit=crop',
        category: 'Hat',
        isSelected: true,
      },
      {
        id: 'acc8',
        name: 'Beach Sandals',
        brand: 'Havaianas',
        price: 800,
        originalPrice: 1200,
        discount: 33,
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop',
        category: 'Shoes',
        isSelected: true,
      },
      {
        id: 'acc9',
        name: 'Tote Bag',
        brand: 'Forever 21',
        price: 450,
        originalPrice: 900,
        discount: 50,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
        category: 'Handbag',
        isSelected: true,
      },
    ],
    totalPrice: 4250,
    originalTotalPrice: 7700,
    totalDiscount: 45,
    confidence: 92,
  },
  {
    id: '4',
    name: 'Office Professional',
    occasion: 'Work Meeting',
    description: 'Professional and confident for important meetings',
    mainItem: {
      id: 'main4',
      name: 'Navy Blue Blazer',
      brand: 'aarke',
      price: 3200,
      originalPrice: 4800,
      discount: 33,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=400&fit=crop',
      category: 'Blazer',
      isMainItem: true,
      isSelected: true,
    },
    accessories: [
      {
        id: 'acc10',
        name: 'Black Pumps',
        brand: 'Steve Madden',
        price: 2800,
        originalPrice: 4000,
        discount: 30,
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop',
        category: 'Shoes',
        isSelected: true,
      },
      {
        id: 'acc11',
        name: 'Leather Briefcase',
        brand: 'Fossil',
        price: 4500,
        originalPrice: 6000,
        discount: 25,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
        category: 'Handbag',
        isSelected: true,
      },
      {
        id: 'acc12',
        name: 'Pearl Earrings',
        brand: 'Tanishq',
        price: 1200,
        originalPrice: 2000,
        discount: 40,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop',
        category: 'Jewelry',
        isSelected: true,
      },
    ],
    totalPrice: 11700,
    originalTotalPrice: 16800,
    totalDiscount: 30,
    confidence: 90,
  },
  {
    id: '5',
    name: 'Date Night Glam',
    occasion: 'Date Night',
    description: 'Glamorous and elegant for a special evening',
    mainItem: {
      id: 'main5',
      name: 'Red Cocktail Dress',
      brand: 'aarke',
      price: 2500,
      originalPrice: 5000,
      discount: 50,
      image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=400&fit=crop',
      category: 'Dress',
      isMainItem: true,
      isSelected: true,
    },
    accessories: [
      {
        id: 'acc13',
        name: 'Red Heels',
        brand: 'Charles & Keith',
        price: 1800,
        originalPrice: 3000,
        discount: 40,
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop',
        category: 'Shoes',
        isSelected: true,
      },
      {
        id: 'acc14',
        name: 'Clutch Bag',
        brand: 'Michael Kors',
        price: 3500,
        originalPrice: 5000,
        discount: 30,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
        category: 'Handbag',
        isSelected: true,
      },
      {
        id: 'acc15',
        name: 'Diamond Earrings',
        brand: 'Tanishq',
        price: 8000,
        originalPrice: 12000,
        discount: 33,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop',
        category: 'Jewelry',
        isSelected: true,
      },
    ],
    totalPrice: 15800,
    originalTotalPrice: 25000,
    totalDiscount: 37,
    confidence: 94,
  },
];

export default function AIOutfitsScreen() {
  const { wardrobeId } = useLocalSearchParams();
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>(mockOutfitSuggestions);

  const currentOutfit = outfits[currentOutfitIndex];

  const toggleItemSelection = (outfitId: string, itemId: string) => {
    setOutfits(prevOutfits =>
      prevOutfits.map(outfit => {
        if (outfit.id === outfitId) {
          return {
            ...outfit,
            accessories: outfit.accessories.map(item =>
              item.id === itemId ? { ...item, isSelected: !item.isSelected } : item
            ),
          };
        }
        return outfit;
      })
    );
  };

  const calculateTotalPrice = (outfit: OutfitSuggestion) => {
    const selectedAccessories = outfit.accessories.filter(item => item.isSelected);
    const totalPrice = outfit.mainItem.price + selectedAccessories.reduce((sum, item) => sum + item.price, 0);
    const originalTotalPrice = (outfit.mainItem.originalPrice || outfit.mainItem.price) + 
      selectedAccessories.reduce((sum, item) => sum + (item.originalPrice || item.price), 0);
    const totalDiscount = Math.round(((originalTotalPrice - totalPrice) / originalTotalPrice) * 100);
    
    return { totalPrice, originalTotalPrice, totalDiscount };
  };

  const renderOutfitItem = ({ item }: { item: OutfitItem }) => (
    <TouchableOpacity
      style={[styles.outfitItem, item.isSelected && styles.selectedItem]}
      onPress={() => toggleItemSelection(currentOutfit.id, item.id)}
    >
      <View style={styles.itemImageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        {item.isMainItem && (
          <View style={styles.mainItemLabel}>
            <Text style={styles.mainItemLabelText}>This Item</Text>
          </View>
        )}
        {item.isSelected && !item.isMainItem && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>✓</Text>
          </View>
        )}
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.brandName}>{item.brand}</Text>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>₹{item.price.toLocaleString()}</Text>
          {item.originalPrice && (
            <>
              <Text style={styles.originalPrice}>₹{item.originalPrice.toLocaleString()}</Text>
              <Text style={styles.discount}>({item.discount}% OFF)</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOutfitCarousel = () => (
    <View style={styles.carouselContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setCurrentOutfitIndex(index);
        }}
      >
        {outfits.map((outfit, index) => (
          <View key={outfit.id} style={styles.outfitSlide}>
            <View style={styles.outfitHeader}>
              <View style={styles.outfitInfo}>
                <Text style={styles.outfitName}>{outfit.name}</Text>
                <Text style={styles.outfitOccasion}>{outfit.occasion}</Text>
                <Text style={styles.outfitDescription}>{outfit.description}</Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{outfit.confidence}% match</Text>
              </View>
            </View>

            <View style={styles.itemsContainer}>
              <View style={styles.mainItemContainer}>
                <Text style={styles.sectionTitle}>Main Item</Text>
                <View style={styles.mainItemCard}>
                  <Image source={{ uri: outfit.mainItem.image }} style={styles.mainItemImage} />
                  <View style={styles.mainItemDetails}>
                    <Text style={styles.brandName}>{outfit.mainItem.brand}</Text>
                    <Text style={styles.itemName}>{outfit.mainItem.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.currentPrice}>₹{outfit.mainItem.price.toLocaleString()}</Text>
                      {outfit.mainItem.originalPrice && (
                        <>
                          <Text style={styles.originalPrice}>₹{outfit.mainItem.originalPrice.toLocaleString()}</Text>
                          <Text style={styles.discount}>({outfit.mainItem.discount}% OFF)</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.accessoriesContainer}>
                <Text style={styles.sectionTitle}>Perfect Matches</Text>
                <FlatList
                  data={outfit.accessories}
                  renderItem={renderOutfitItem}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.accessoriesList}
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderPriceSummary = () => {
    const { totalPrice, originalTotalPrice, totalDiscount } = calculateTotalPrice(currentOutfit);
    const selectedItemsCount = 1 + currentOutfit.accessories.filter(item => item.isSelected).length;

    return (
      <View style={styles.priceSummary}>
        <View style={styles.priceHeader}>
          <Text style={styles.totalPriceLabel}>Total Price ({selectedItemsCount} items):</Text>
        </View>
        <View style={styles.priceDetails}>
          <Text style={styles.originalTotalPrice}>₹{originalTotalPrice.toLocaleString()}</Text>
          <Text style={styles.finalTotalPrice}>₹{totalPrice.toLocaleString()}</Text>
          <Text style={styles.totalDiscount}>({totalDiscount}% OFF)</Text>
        </View>
        <TouchableOpacity style={styles.buyButton}>
          <LinearGradient
            colors={['#E91E63', '#FF6B9D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyButtonGradient}
          >
            <Text style={styles.buyButtonText}>Select and Buy ></Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#f8f9fa' }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI Outfit Matcher</Text>
            <Text style={styles.headerSubtitle}>Find the Perfect Match</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>More Outfits ></Text>
          </TouchableOpacity>
        </View>

        {renderOutfitCarousel()}
        {renderPriceSummary()}

        {/* Carousel Indicators */}
        <View style={styles.carouselIndicators}>
          {outfits.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentOutfitIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 6,
  },
  backButtonText: {
    fontSize: 20,
    color: '#E91E63',
    fontWeight: '300',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },
  moreButton: {
    padding: 6,
  },
  moreButtonText: {
    fontSize: 10,
    color: '#E91E63',
    fontWeight: '500',
  },
  carouselContainer: {
    flex: 1,
  },
  outfitSlide: {
    width: screenWidth,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  outfitInfo: {
    flex: 1,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  outfitOccasion: {
    fontSize: 11,
    color: '#E91E63',
    fontWeight: '500',
    marginBottom: 2,
  },
  outfitDescription: {
    fontSize: 10,
    color: '#666',
    lineHeight: 14,
  },
  confidenceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  confidenceText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  itemsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainItemContainer: {
    marginBottom: 16,
  },
  mainItemCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainItemImage: {
    width: 60,
    height: 75,
    borderRadius: 6,
    marginRight: 10,
  },
  mainItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  accessoriesContainer: {
    flex: 1,
  },
  accessoriesList: {
    paddingBottom: 16,
  },
  outfitItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 6,
    marginBottom: 8,
    marginRight: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedItem: {
    borderWidth: 1.5,
    borderColor: '#E91E63',
  },
  itemImageContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  itemImage: {
    width: '100%',
    height: 60,
    borderRadius: 6,
  },
  mainItemLabel: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  mainItemLabelText: {
    color: 'white',
    fontSize: 7,
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E91E63',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
  },
  brandName: {
    fontSize: 8,
    color: '#666',
    fontWeight: '500',
    marginBottom: 1,
  },
  itemName: {
    fontSize: 9,
    color: '#1a1a1a',
    fontWeight: '500',
    marginBottom: 3,
    lineHeight: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  currentPrice: {
    fontSize: 10,
    color: '#1a1a1a',
    fontWeight: '700',
    marginRight: 3,
  },
  originalPrice: {
    fontSize: 7,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 3,
  },
  discount: {
    fontSize: 7,
    color: '#4CAF50',
    fontWeight: '600',
  },
  priceSummary: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceHeader: {
    marginBottom: 6,
  },
  totalPriceLabel: {
    fontSize: 11,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  priceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  originalTotalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  finalTotalPrice: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '700',
    marginRight: 6,
  },
  totalDiscount: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  buyButton: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: '#E91E63',
  },
});
