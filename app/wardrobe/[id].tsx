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
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use WardrobeItem type from API directly for items


export default function WardrobeDetailScreen() {
    const { id } = useLocalSearchParams();
    const [wardrobe, setWardrobe] = useState<Wardrobe | null>(null);
    const [items, setItems] = useState<WardrobeItem[]>([]);
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


    const renderWardrobeItem = ({ item }: { item: WardrobeItem }) => {
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
                onPress={() => router.push(`/product/${item.productId._id}?fromWardrobeId=${id}`)}
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
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>{wardrobe.name}</Text>
                        <Text style={styles.headerSubtitle}>{wardrobe.occasionType}</Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={() => router.push(`/wardrobe/access?wardrobeId=${id}`)}
                    >
                        <Text style={styles.menuButtonText}>⋯</Text>
                    </TouchableOpacity>
                </View>

                {/* Wardrobe Info (trimmed) */}
                {!!wardrobe.description && (
                    <View style={styles.wardrobeInfo}>
                        <Text style={styles.wardrobeDescription}>{wardrobe.description}</Text>
                    </View>
                )}

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, styles.activeTab]}
                    >
                        <Text style={[styles.tabText, styles.activeTabText]}>Items</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.tab}
                        onPress={() => router.push(`/wardrobe/ai-outfits?wardrobeId=${id}`)}
                    >
                        <Text style={styles.tabText}>AI Outfits</Text>
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
                    ListEmptyComponent={
                        <ImageBackground
                            source={{ uri: 'https://cdn.dribbble.com/userupload/20573048/file/original-4f00702d51457e3021f9aa9ac53c92c8.gif' }}
                            style={styles.emptyStateBg}
                            imageStyle={styles.emptyStateBgImage}
                        >
                            <View style={styles.emptyStateOverlay}>
                                <Text style={styles.emptyStateText}>No outfits yet</Text>
                            </View>
                        </ImageBackground>
                    }
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
        paddingHorizontal: 16,
        paddingVertical: 12,
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
    backIcon: {
        fontSize: 24,
        color: '#333',
        fontWeight: '300',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
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
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 8,
    },
    wardrobeDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
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
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#ff6b6b',
    },
    tabText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#ff6b6b',
        fontWeight: '600',
    },
    itemsGrid: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        flexGrow: 1,
    },
    emptyStateBg: {
        width: '100%',
        flex: 1,
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: 8,
    },
    emptyStateBgImage: {
        resizeMode: 'cover',
        opacity: 0.18,
    },
    emptyStateOverlay: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    emptyStateText: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    itemCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        margin: 5,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
    },
    itemImageContainer: {
        height: 110,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 6,
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
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
        marginBottom: 3,
    },
    itemBrand: {
        fontSize: 9,
        color: '#666',
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 11,
        fontWeight: '600',
        color: '#ff6b6b',
        marginBottom: 2,
    },
    itemCategory: {
        fontSize: 9,
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