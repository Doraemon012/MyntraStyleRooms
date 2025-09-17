import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating: number;
  image: string;
  category: string;
  isNew?: boolean;
  isTrending?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive?: boolean;
}

// Banner data
const banners = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    title: 'The Best Men\'s Wear Collection',
    discount: 'UP TO 70% OFF',
    brand: '#SNITCH',
    buttonText: 'Shop Now'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    title: 'Women\'s Fashion Week',
    discount: 'UP TO 50% OFF',
    brand: '#FASHION',
    buttonText: 'Explore Now'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
    title: 'Footwear Collection',
    discount: 'UP TO 60% OFF',
    brand: '#SHOES',
    buttonText: 'Shop Now'
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    title: 'Accessories Sale',
    discount: 'UP TO 40% OFF',
    brand: '#ACCESSORIES',
    buttonText: 'Buy Now'
  }
];

// Play menu data
const playMenuItems = [
  {
    id: '1',
    title: 'Fashion Room',
    description: 'Discover your style with friends',
    icon: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
    hasNewTag: true
  },
  {
    id: '2',
    title: 'Shop with Maya',
    description: 'Your Personal shopping assistant',
    icon: 'https://images.unsplash.com/photo-1512496015851-a90fb38cd796?w=100&h=100&fit=crop',
    hasNewTag: false
  },
  {
    id: '3',
    title: 'My Stylist',
    description: 'Outfit combinations for you',
    icon: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop',
    hasNewTag: false
  },
  {
    id: '4',
    title: 'Myntra Minis',
    description: 'Swipe.Shop.Slay',
    icon: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop',
    hasNewTag: false
  }
];

// Mock categories
const categories: Category[] = [
  { id: '1', name: 'Fashion', icon: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', color: '#E91E63', isActive: true },
  { id: '2', name: 'Beauty', icon: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop&q=80', color: '#FF6B9D' },
  { id: '3', name: 'Homeliving', icon: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop', color: '#4A90E2' },
  { id: '4', name: 'Footwear', icon: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop', color: '#7ED321' },
  { id: '5', name: 'Accessories', icon: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop', color: '#9C27B0' },
];

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Floral Print Maxi Dress',
    brand: 'W',
    price: '₹1,299',
    originalPrice: '₹2,599',
    discount: '50% OFF',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    category: 'Women',
    isNew: true,
  },
  {
    id: '2',
    name: 'Denim Jacket',
    brand: 'Roadster',
    price: '₹1,899',
    originalPrice: '₹2,999',
    discount: '37% OFF',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop',
    category: 'Women',
    isTrending: true,
  },
  {
    id: '3',
    name: 'Cotton T-Shirt',
    brand: 'H&M',
    price: '₹599',
    rating: 4.0,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    category: 'Men',
  },
  {
    id: '4',
    name: 'Running Shoes',
    brand: 'Nike',
    price: '₹4,999',
    originalPrice: '₹7,999',
    discount: '38% OFF',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=400&fit=crop',
    category: 'Sports',
    isTrending: true,
  },
  {
    id: '5',
    name: 'Silk Saree',
    brand: 'Sangria',
    price: '₹3,999',
    originalPrice: '₹5,999',
    discount: '33% OFF',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
    category: 'Women',
  },
  {
    id: '6',
    name: 'Kids T-Shirt',
    brand: 'Gini & Jony',
    price: '₹399',
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300&h=400&fit=crop',
    category: 'Kids',
  },
  {
    id: '7',
    name: 'Lipstick Set',
    brand: 'Maybelline',
    price: '₹899',
    originalPrice: '₹1,299',
    discount: '31% OFF',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=400&fit=crop',
    category: 'Beauty',
  },
  {
    id: '8',
    name: 'Cushion Covers',
    brand: 'Home Centre',
    price: '₹599',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=400&fit=crop',
    category: 'Home',
  },
  {
    id: '9',
    name: 'Leather Handbag',
    brand: 'Hidesign',
    price: '₹2,999',
    originalPrice: '₹4,999',
    discount: '40% OFF',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
    category: 'Bags',
    isNew: true,
  },
  {
    id: '10',
    name: 'High Heels',
    brand: 'Metro',
    price: '₹1,499',
    originalPrice: '₹2,499',
    discount: '40% OFF',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop',
    category: 'Shoes',
  },
  {
    id: '11',
    name: 'Casual Sneakers',
    brand: 'Adidas',
    price: '₹3,999',
    originalPrice: '₹5,999',
    discount: '33% OFF',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
    category: 'Shoes',
    isTrending: true,
  },
  {
    id: '12',
    name: 'Crossbody Bag',
    brand: 'Van Heusen',
    price: '₹1,299',
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1584917860122-859af0e7a67b?w=300&h=400&fit=crop',
    category: 'Bags',
  },
];

export default function CatalogScreen() {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const menuScale = useRef(new Animated.Value(0.8)).current;

  // Auto-scroll banner every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % banners.length;
        bannerScrollRef.current?.scrollTo({
          x: nextIndex * screenWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Animate play button and menu
  useEffect(() => {
    if (showPlayMenu) {
      // Animate button scale and color change
      Animated.parallel([
        Animated.spring(playButtonScale, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(menuScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate button back to normal
      Animated.parallel([
        Animated.spring(playButtonScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(menuScale, {
          toValue: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPlayMenu]);

  const filteredProducts = mockProducts.filter(product => {
    const categoryMatch = selectedCategory === '1' || product.category === categories.find(cat => cat.id === selectedCategory)?.name;
    const searchMatch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const displayProducts = filteredProducts;

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        item.isActive && styles.selectedCategory
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <View style={[
        styles.categoryIcon, 
        item.isActive && styles.activeCategoryIcon
      ]}>
        <Image source={{ uri: item.icon }} style={styles.categoryIconImage} contentFit="cover" />
      </View>
      <Text style={[
        styles.categoryName,
        item.isActive && styles.selectedCategoryName
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        {item.isTrending && (
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingBadgeText}>🔥</Text>
          </View>
        )}
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{item.discount}</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.brandName}>{item.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.price}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>{item.originalPrice}</Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header with Search Bar */}
          <View style={styles.header}>
            <View style={styles.searchBar}>
              <Image source={require('@/assets/images/icon.webp')} style={styles.searchBarLogo} contentFit="contain" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search 'Joggers'"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Ionicons name="search" size={18} color="#999" />
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="notifications-outline" size={20} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="heart-outline" size={20} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="person-outline" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Category Tabs */}
          <View style={styles.mainCategoryTabs}>
            <TouchableOpacity style={styles.mainCategoryTab}>
              <Text style={[styles.mainCategoryText, styles.activeMainCategoryText]}>All</Text>
              <View style={styles.activeUnderline} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mainCategoryTab}>
              <Text style={styles.mainCategoryText}>Men</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mainCategoryTab}>
              <Text style={styles.mainCategoryText}>Women</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mainCategoryTab}>
              <Text style={styles.mainCategoryText}>Kids</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mainCategoryTab}>
              <Ionicons name="grid-outline" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {/* Promotional Banner 1 - GST Savings */}
          <View style={styles.promoBanner1}>
            <View style={styles.promoBanner1Left}>
              <View style={styles.promoBanner1Logo}>
                <Text style={styles.promoBanner1LogoText}>Big Fashion Festival</Text>
              </View>
            </View>
            <View style={styles.promoBanner1Center}>
              <Text style={styles.promoBanner1Title}>GET YOUR GST SAVINGS AHEAD OF TIME</Text>
            </View>
            <View style={styles.promoBanner1Right}>
              <Text style={styles.promoBanner1Date}>SALE STARTS SEP 20</Text>
              <TouchableOpacity style={styles.promoBanner1Button}>
                <Text style={styles.promoBanner1ButtonText}>Wishlist Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Banner Carousel */}
          <View style={styles.bannerCarousel}>
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                setCurrentBannerIndex(index);
              }}
            >
              {banners.map((banner, index) => (
                <View key={banner.id} style={styles.bannerSlide}>
                  <View style={styles.bannerImageContainer}>
                    <Image 
                      source={{ uri: banner.image }} 
                      style={styles.bannerImage}
                      contentFit="cover"
                    />
                    <View style={styles.bannerOverlay}>
                      <View style={styles.bannerTextLeft}>
                        <Text style={styles.bannerTitle}>{banner.title}</Text>
                        <Text style={styles.bannerDiscount}>{banner.discount}</Text>
                      </View>
                      <View style={styles.bannerTextCenter}>
                        <Text style={styles.bannerBrand}>{banner.brand}</Text>
                      </View>
                      <View style={styles.bannerTextRight}>
                        <TouchableOpacity style={styles.bannerButton}>
                          <Text style={styles.bannerButtonText}>{banner.buttonText}</Text>
                          <Ionicons name="arrow-forward" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.adLabel}>
                      <Text style={styles.adLabelText}>AD</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Carousel Indicators */}
          <View style={styles.carouselIndicators}>
            {banners.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.indicator, 
                  index === currentBannerIndex && styles.activeIndicator
                ]} 
              />
            ))}
          </View>

          {/* Sponsor Logos */}
          <View style={styles.sponsorSection}>
            <View style={styles.sponsorItem}>
              <Text style={styles.sponsorText}>ASSOCIATE SPONSOR U.S. POLO ASSN. SINCE 1890</Text>
              <Ionicons name="chevron-forward" size={16} color="#000" />
            </View>
            <View style={styles.sponsorDivider} />
            <View style={styles.sponsorItem}>
              <Text style={styles.sponsorText}>TITLE SPONSOR PUMA</Text>
              <Ionicons name="chevron-forward" size={16} color="#000" />
            </View>
            <View style={styles.sponsorDivider} />
            <View style={styles.sponsorItem}>
              <Text style={styles.sponsorText}>ASSOCIATE SPONSOR JACK&JONES</Text>
              <Ionicons name="chevron-forward" size={16} color="#000" />
            </View>
          </View>

          {/* Cashback Banner */}
          <View style={styles.cashbackBanner}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=60&fit=crop' }} 
              style={styles.cashbackCardImage} 
            />
            <View style={styles.cashbackTextContainer}>
              <Text style={styles.cashbackTitle}>Flat 7.5% Cashback*</Text>
              <Text style={styles.cashbackSubtitle}>On FLIPKART AXIS BANK Credit Card</Text>
            </View>
          </View>

          {/* Mock Product Cards Section */}
          <View style={styles.mockCardsSection}>
            <Text style={styles.mockCardsTitle}>Trending Now</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mockCardsContainer}
            >
              {mockProducts.slice(0, 8).map((product) => (
                <TouchableOpacity key={product.id} style={styles.mockCard}>
                  <View style={styles.mockCardImageContainer}>
                    <Image source={{ uri: product.image }} style={styles.mockCardImage} />
                    {product.isNew && (
                      <View style={styles.mockCardBadge}>
                        <Text style={styles.mockCardBadgeText}>NEW</Text>
                      </View>
                    )}
                    {product.discount && (
                      <View style={styles.mockCardDiscount}>
                        <Text style={styles.mockCardDiscountText}>{product.discount}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.mockCardInfo}>
                    <Text style={styles.mockCardBrand}>{product.brand}</Text>
                    <Text style={styles.mockCardName} numberOfLines={2}>{product.name}</Text>
                    <View style={styles.mockCardPriceContainer}>
                      <Text style={styles.mockCardPrice}>{product.price}</Text>
                      {product.originalPrice && (
                        <Text style={styles.mockCardOriginalPrice}>{product.originalPrice}</Text>
                      )}
                    </View>
                    <View style={styles.mockCardRating}>
                      <Text style={styles.mockCardRatingText}>⭐ {product.rating}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Products Grid */}
          <View style={styles.productsContainer}>
            <FlatList
              data={displayProducts}
              renderItem={renderProduct}
              keyExtractor={item => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>

        {/* Fixed Play Button */}
        <Animated.View style={[styles.playButton, { transform: [{ scale: playButtonScale }] }]}>
          <TouchableOpacity 
            style={[styles.playButtonInner, showPlayMenu && styles.playButtonActive]}
            onPress={() => setShowPlayMenu(!showPlayMenu)}
          >
            <Ionicons 
              name={showPlayMenu ? "close" : "play"} 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={styles.bottomTab}>
            <Image source={require('@/assets/Catalog/myntra-removebg-preview.png')} style={styles.bottomTabIcon} contentFit="contain" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.bottomTab}>
            <Text style={styles.bottomTabText}>fwd</Text>
            <Text style={styles.bottomTabSubtext}>Under ₹999</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.bottomTab}>
            <Text style={styles.bottomTabText}>LUXE</Text>
            <Text style={styles.bottomTabSubtext}>Luxury</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.bottomTab}>
            <Ionicons name="bag-outline" size={20} color="#000" />
            <Text style={styles.bottomTabText}>Bag</Text>
          </TouchableOpacity>
        </View>

        {/* Explore Menu Modal */}
        <Modal
          visible={showExploreMenu}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowExploreMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowExploreMenu(false)}
          >
            <View style={styles.exploreMenu}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Explore</Text>
                <TouchableOpacity onPress={() => setShowExploreMenu(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.menuItems}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setShowExploreMenu(false);
                    router.push('/(tabs)');
                  }}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="home" size={24} color="#E91E63" />
                  </View>
                  <Text style={styles.menuItemText}>Home</Text>
                </TouchableOpacity>

                 <TouchableOpacity 
                   style={styles.menuItem}
                   onPress={() => {
                     setShowExploreMenu(false);
                    //  router.push('/(tabs)/explore');
                   }}
                 >
                   <View style={styles.menuItemIcon}>
                     <Image source={require('@/assets/Catalog/fwd_icon-removebg-preview.png')} style={styles.menuIconImage} contentFit="contain" />
                   </View>
                   <Text style={styles.menuItemText}>Explore</Text>
                 </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setShowExploreMenu(false);
                    router.push('/(tabs)');
                  }}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="people" size={24} color="#E91E63" />
                  </View>
                  <Text style={styles.menuItemText}>Fashion Rooms</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setShowExploreMenu(false);
                    // router.push('/(tabs)/wardrobes');
                  }}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="shirt" size={24} color="#E91E63" />
                  </View>
                  <Text style={styles.menuItemText}>Wardrobes</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setShowExploreMenu(false);
                    router.push('/(tabs)/profile');
                  }}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="person" size={24} color="#E91E63" />
                  </View>
                  <Text style={styles.menuItemText}>Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Play Menu Modal */}
        <Modal
          visible={showPlayMenu}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowPlayMenu(false)}
        >
          <TouchableOpacity 
            style={styles.playMenuOverlay}
            activeOpacity={1}
            onPress={() => setShowPlayMenu(false)}
          >
            <Animated.View style={[styles.playMenuContainer, { 
              opacity: menuOpacity, 
              transform: [{ scale: menuScale }] 
            }]}>
              <View style={styles.playMenuList}>
                {playMenuItems.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.playMenuItem}
                    onPress={() => {
                      if (item.id === '1') {
                        // Navigate to fashion rooms screen
                        router.push('/(tabs)');
                        setShowPlayMenu(false);
                      }
                    }}
                  >
                    <View style={styles.playMenuItemLeft}>
                      <View style={styles.playMenuIconContainer}>
                        <Image source={{ uri: item.icon }} style={styles.playMenuIcon} contentFit="cover" />
                      </View>
                      <View style={styles.playMenuItemText}>
                        <Text style={styles.playMenuItemTitle}>{item.title}</Text>
                        <Text style={styles.playMenuItemDescription}>{item.description}</Text>
                      </View>
                    </View>
                    <View style={styles.playMenuItemRight}>
                      {item.hasNewTag && (
                        <View style={[
                          styles.playMenuNewTag,
                          item.id === '1' && styles.playMenuNewTagGlow
                        ]}>
                          <Text style={styles.playMenuNewTagText}>New</Text>
                        </View>
                      )}
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </View>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity style={styles.playMenuExploreItem}>
                  <Text style={styles.playMenuExploreTitle}>Explore more Features</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Space for bottom navigation
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  logoImage: {
    width: 100,
    height: 28,
  },
  headerIcon: {
    width: 18,
    height: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 40,
    gap: 8,
  },
  searchBarLogo: {
    width: 20,
    height: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    padding: 0,
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    marginBottom: 6,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 2,
  },
  selectedCategory: {
    // Add selected state styling if needed
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  activeCategoryIcon: {
    // No border for active state
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryIconImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: '#E91E63',
    fontWeight: '600',
  },
  productsContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  productsList: {
    paddingVertical: 8,
  },
  productCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF5722',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendingBadgeText: {
    fontSize: 10,
    color: 'white',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#E91E63',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  brandName: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  productName: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: 'bold',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  exploreMenu: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  menuItems: {
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  menuIconImage: {
    width: 24,
    height: 24,
  },
  // Main Category Tabs
  mainCategoryTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainCategoryTab: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  mainCategoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeMainCategoryText: {
    color: '#000',
    fontWeight: '600',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#E91E63',
    borderRadius: 1,
  },
  // Promotional Banner 1
  promoBanner1: {
    flexDirection: 'row',
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  promoBanner1Left: {
    flex: 1,
  },
  promoBanner1Logo: {
    backgroundColor: '#E91E63',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  promoBanner1LogoText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  promoBanner1Center: {
    flex: 2,
    alignItems: 'center',
  },
  promoBanner1Title: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  promoBanner1Right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  promoBanner1Date: {
    color: 'white',
    fontSize: 10,
    marginBottom: 6,
  },
  promoBanner1Button: {
    backgroundColor: '#E91E63',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  promoBanner1ButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Main Banner
  mainBanner: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E91E63',
    borderStyle: 'dashed',
  },
  mainBannerImageContainer: {
    position: 'relative',
    height: 160,
  },
  mainBannerImage: {
    width: '100%',
    height: '100%',
  },
  mainBannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  mainBannerTextLeft: {
    flex: 1,
  },
  mainBannerTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  mainBannerDiscount: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mainBannerTextCenter: {
    flex: 1,
    alignItems: 'center',
  },
  mainBannerBrand: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mainBannerTextRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  mainBannerButton: {
    backgroundColor: '#E91E63',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 3,
  },
  mainBannerButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  adLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adLabelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Carousel Indicators
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  activeIndicator: {
    backgroundColor: '#E91E63',
  },
  // Sponsor Section
  sponsorSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  sponsorItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorText: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  sponsorDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#ddd',
    marginHorizontal: 6,
  },
  // Cashback Banner
  cashbackBanner: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cashbackCardImage: {
    width: 50,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
  },
  cashbackTextContainer: {
    flex: 1,
  },
  cashbackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  cashbackSubtitle: {
    fontSize: 10,
    color: '#666',
  },
  // Bottom Navigation
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomTab: {
    alignItems: 'center',
    flex: 1,
  },
  bottomTabIcon: {
    width: 32,
    height: 32,
    marginBottom: 2,
  },
  bottomTabText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#E91E63',
    fontWeight: '600',
  },
  bottomTabSubtext: {
    fontSize: 8,
    color: '#999',
    marginTop: 1,
  },
  // Mock Cards Section
  mockCardsSection: {
    backgroundColor: 'white',
    paddingVertical: 12,
    marginBottom: 8,
  },
  mockCardsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  mockCardsContainer: {
    paddingHorizontal: 16,
  },
  mockCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  mockCardImageContainer: {
    position: 'relative',
  },
  mockCardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  mockCardBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  mockCardBadgeText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  mockCardDiscount: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#E91E63',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  mockCardDiscountText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  mockCardInfo: {
    padding: 8,
  },
  mockCardBrand: {
    fontSize: 9,
    color: '#999',
    marginBottom: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  mockCardName: {
    fontSize: 11,
    color: '#1a1a1a',
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 14,
  },
  mockCardPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mockCardPrice: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: 'bold',
    marginRight: 4,
  },
  mockCardOriginalPrice: {
    fontSize: 9,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  mockCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mockCardRatingText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '500',
  },
  // Banner Carousel
  bannerCarousel: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerSlide: {
    width: screenWidth - 32,
  },
  bannerImageContainer: {
    position: 'relative',
    height: 180,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  bannerTextLeft: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  bannerDiscount: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  bannerTextCenter: {
    flex: 1,
    alignItems: 'center',
  },
  bannerBrand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  bannerTextRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  bannerButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Fixed Play Button
  playButton: {
    position: 'absolute',
    bottom: 120,
    right: 30,
    width: 40,
    height: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1000,
  },
  playButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: '#E91E63',
  },
  // Play Menu Modal
  playMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 40,
    paddingBottom: 110,
  },
  playMenuContainer: {
    paddingTop: 8,
    paddingHorizontal: 16,
    width: 340,
    maxHeight: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  playMenuList: {
    gap: 4,
  },
  playMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playMenuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playMenuIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  playMenuIcon: {
    width: '100%',
    height: '100%',
  },
  playMenuItemText: {
    flex: 1,
  },
  playMenuItemTitle: {
    fontSize:11,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 1,
  },
  playMenuItemDescription: {
    fontSize: 7,
    color: '#666',
  },
  playMenuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playMenuNewTag: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  playMenuNewTagText: {
    color: 'white',
    fontSize: 6,
    fontWeight: 'bold',
  },
  playMenuExploreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playMenuExploreTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
  },
  // Glow effect only for "New" tag
  playMenuNewTagGlow: {
    backgroundColor: '#FF6B9D',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
