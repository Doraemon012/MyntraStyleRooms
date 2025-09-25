import { ThemedView } from '@/components/themed-view';
import { Wardrobe, wardrobeApi, WardrobeItem } from '@/services/wardrobeApi';
import { getDefaultImageProps, getProductImageUri } from '@/utils/imageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WardrobeItemWithProduct extends WardrobeItem {
    productId: {
        _id: string;
        name: string;
        price: number;
        images: Array<{ url: string }>;
        brand: string;
        description: string;
        category: string;
        subcategory: string;
    };
}


export default function WardrobeDetailScreen() {
    const { id } = useLocalSearchParams();
    const [wardrobe, setWardrobe] = useState<Wardrobe | null>(null);
    const [items, setItems] = useState<WardrobeItemWithProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWardrobeData();
    }, [id]);

    const loadWardrobeData = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                Alert.alert('Error', 'Please log in to view wardrobe details');
                return;
            }

            // Load wardrobe details
            const wardrobeResponse = await wardrobeApi.getWardrobeById(token, id as string);
            if (wardrobeResponse.status === 'success' && wardrobeResponse.data) {
                setWardrobe(wardrobeResponse.data.wardrobe);
            }

            // Load wardrobe items
            const itemsResponse = await wardrobeApi.getWardrobeItems(token, id as string, { limit: 100 });
            if (itemsResponse.status === 'success' && itemsResponse.data) {
                setItems(itemsResponse.data.items);
            }


        } catch (error) {
            console.error('Error loading wardrobe data:', error);
            Alert.alert('Error', 'Failed to load wardrobe details');
        } finally {
            setLoading(false);
        }
    };


    const renderWardrobeItem = ({ item }: { item: WardrobeItemWithProduct }) => {
        // Handle null productId
        if (!item.productId) {
            return (
                <TouchableOpacity 
                    style={styles.itemCard}
                    onPress={() => {
                        // Don't navigate if no product
                    }}
                >
                    <View style={styles.itemImageContainer}>
                        <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop' }} 
                            style={styles.itemImage}
                            resizeMode="cover"
                        />
                    </View>
                    
                    <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={2}>
                            Product Not Available
                        </Text>
                        <Text style={styles.itemBrand}>Unknown Brand</Text>
                        <Text style={styles.itemPrice}>₹0</Text>
                        <Text style={styles.itemCategory}>Unknown Category</Text>
                    </View>

                    <View style={styles.itemActions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>❤️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>📝</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity 
                style={styles.itemCard}
                onPress={() => router.push(`/product/${item.productId._id}`)}
            >
                <View style={styles.itemImageContainer}>
                    <Image 
                        source={{ uri: getProductImageUri(item.productId) }} 
                        style={styles.itemImage}
                        resizeMode="cover"
                        {...getDefaultImageProps()}
                    />
                </View>
                
                <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {item.productId.name || 'Unknown Product'}
                    </Text>
                    <Text style={styles.itemBrand}>{item.productId.brand || 'Unknown Brand'}</Text>
                    <Text style={styles.itemPrice}>₹{(item.productId.price || 0).toLocaleString()}</Text>
                    <Text style={styles.itemCategory}>{item.productId.category || 'Unknown Category'}</Text>
                </View>

                <View style={styles.itemActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>❤️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>📝</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };


    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff6b6b" />
                        <Text style={styles.loadingText}>Loading wardrobe...</Text>
                    </View>
                </SafeAreaView>
            </ThemedView>
        );
    }

    if (!wardrobe) {
        return (
            <ThemedView style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Wardrobe not found</Text>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backButtonText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
                        <Text style={styles.backButton}>‹</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>{wardrobe.emoji} {wardrobe.name}</Text>
                        <Text style={styles.headerSubtitle}>{wardrobe.occasionType}</Text>
                    </View>
                    
                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>⋯</Text>
                    </TouchableOpacity>
                </View>

                {/* Wardrobe Info */}
                <View style={styles.wardrobeInfo}>
                    <Text style={styles.wardrobeDescription}>{wardrobe.description}</Text>
                    <View style={styles.wardrobeStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{items.length}</Text>
                            <Text style={styles.statLabel}>Items</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Outfits</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>₹{wardrobe.budgetRange?.min || 0}</Text>
                            <Text style={styles.statLabel}>Min Budget</Text>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={styles.tab}
                    >
                        <Text style={styles.tabText}>
                            Items ({items.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.tab}
                        onPress={() => router.push(`/wardrobe/ai-outfits?wardrobeId=${id}`)}
                    >
                        <Text style={styles.tabText}>
                            AI Outfits
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <FlatList
                    data={items}
                    renderItem={renderWardrobeItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.itemsGrid}
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
    safeArea: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#ff6b6b',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButtonContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        fontSize: 24,
        color: '#333',
        fontWeight: '300',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    menuButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuButtonText: {
        fontSize: 20,
        color: '#333',
    },
    wardrobeInfo: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 1,
    },
    wardrobeDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    wardrobeStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
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
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#ff6b6b',
        fontWeight: '600',
    },
    itemsGrid: {
        padding: 20,
    },
    itemCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 6,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImageContainer: {
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    itemImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImagePlaceholderText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#999',
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemBrand: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ff6b6b',
        marginBottom: 2,
    },
    itemCategory: {
        fontSize: 10,
        color: '#999',
    },
    itemActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    actionButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 12,
    },
});