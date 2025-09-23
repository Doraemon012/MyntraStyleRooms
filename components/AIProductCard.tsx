import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AIProductCardProps {
  productData: {
    name: string;
    price: string;
    originalPrice?: string;
    discount?: string;
    image: string;
    brand?: string;
    category?: string;
    rating?: number;
    reviewCount?: number;
    description?: string;
  };
  onAddToWardrobe: () => void;
  onShowMore: () => void;
}

export default function AIProductCard({ productData, onAddToWardrobe, onShowMore }: AIProductCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: productData.image }} 
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.productName}>{productData.name}</Text>
        <Text style={styles.brand}>{productData.brand || 'Myntra'}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>{productData.price}</Text>
          {productData.originalPrice && (
            <Text style={styles.originalPrice}>{productData.originalPrice}</Text>
          )}
          {productData.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{productData.discount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.rating}>{productData.rating || 4.7}</Text>
          <Text style={styles.reviewCount}>({productData.reviewCount || 89})</Text>
        </View>
        
        {productData.description && (
          <Text style={styles.description}>{productData.description}</Text>
        )}
        
        <TouchableOpacity style={styles.addToWardrobeBtn} onPress={onAddToWardrobe}>
          <Text style={styles.addToWardrobeText}>Add to Wardrobe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#f8fafc',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
    lineHeight: 20,
  },
  brand: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999999',
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
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  rating: {
    fontSize: 12,
    color: '#666666',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666666',
  },
  description: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
    marginBottom: 8,
  },
  addToWardrobeBtn: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  addToWardrobeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
