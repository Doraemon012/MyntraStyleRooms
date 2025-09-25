import { Wardrobe, wardrobeApi } from '@/services/wardrobeApi';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface WardrobeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (wardrobeId: string) => void;
  productName?: string;
  productPrice?: string;
  loading?: boolean;
}

export default function WardrobeSelector({
  visible,
  onClose,
  onSelect,
  productName,
  productPrice,
  loading = false
}: WardrobeSelectorProps) {
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([]);
  const [loadingWardrobes, setLoadingWardrobes] = useState(false);

  useEffect(() => {
    if (visible) {
      loadWardrobes();
    }
  }, [visible]);

  const loadWardrobes = async () => {
    setLoadingWardrobes(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'Please log in to view wardrobes');
        setLoadingWardrobes(false);
        return;
      }

      const response = await wardrobeApi.getWardrobes(token, { limit: 50 });
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

  const handleWardrobeSelect = (wardrobeId: string) => {
    onSelect(wardrobeId);
  };

  const getWardrobeEmoji = (occasionType: string) => {
    switch (occasionType) {
      case 'Wedding & Celebrations':
        return '💒';
      case 'Office & Professional':
        return '👔';
      case 'Casual & Weekend':
        return '👕';
      case 'Party & Nightlife':
        return '🎉';
      case 'Travel & Vacation':
        return '✈️';
      case 'Festival & Cultural':
        return '🎭';
      case 'Sports & Fitness':
        return '🏃';
      case 'Date Night':
        return '💕';
      default:
        return '👗';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to Wardrobe</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {productName && (
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{productName}</Text>
              {productPrice && (
                <Text style={styles.productPrice}>{productPrice}</Text>
              )}
            </View>
          )}

          <Text style={styles.sectionTitle}>Choose Wardrobe</Text>

          {loadingWardrobes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E91E63" />
              <Text style={styles.loadingText}>Loading wardrobes...</Text>
            </View>
          ) : (
            <FlatList
              data={wardrobes}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.wardrobeOption}
                  onPress={() => handleWardrobeSelect(item._id)}
                  disabled={loading}
                >
                  <View style={styles.wardrobeEmoji}>
                    {getWardrobeEmoji(item.occasionType)}
                  </View>
                  <View style={styles.wardrobeInfo}>
                    <Text style={styles.wardrobeName}>{item.name}</Text>
                    <Text style={styles.wardrobeCount}>
                      {item.itemCount} items • {item.occasionType}
                    </Text>
                  </View>
                  {loading ? (
                    <ActivityIndicator size="small" color="#E91E63" />
                  ) : (
                    <Text style={styles.addIcon}>+</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.wardrobeList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {wardrobes.length === 0 && !loadingWardrobes && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No wardrobes found</Text>
              <Text style={styles.emptySubtext}>Create a wardrobe first to add products</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  productInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productPrice: {
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
  wardrobeList: {
    maxHeight: 300,
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
    marginBottom: 2,
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

