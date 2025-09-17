import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import React, { useState } from "react";
import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WardrobeCategory {
    id: string;
    name: string;
    subtitle: string;
    items: WardrobeItem[];
}

interface WardrobeItem {
    id: string;
    image: string;
}

const wardrobeCategories: WardrobeCategory[] = [
    {
        id: "1",
        name: "Striped Crop Shirt",
        subtitle: "AI Powered",
        items: [
            {
                id: "1",
                image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=150&h=200&fit=crop",
            },
            {
                id: "2",
                image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=150&h=200&fit=crop",
            },
            {
                id: "3",
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=200&fit=crop",
            },
            {
                id: "4",
                image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=150&h=200&fit=crop",
            },
            {
                id: "5",
                image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=150&h=200&fit=crop",
            },
        ],
    },
    {
        id: "2",
        name: "Modern Kurtis",
        subtitle: "AI Powered",
        items: [
            {
                id: "6",
                image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=150&h=200&fit=crop",
            },
            {
                id: "7",
                image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=150&h=200&fit=crop",
            },
            {
                id: "8",
                image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=150&h=200&fit=crop",
            },
        ],
    },
    {
        id: "3",
        name: "Daytime Looks",
        subtitle: "AI Powered",
        items: [
            {
                id: "9",
                image: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=300&h=200&fit=crop",
            },
            {
                id: "10",
                image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=150&h=200&fit=crop",
            },
        ],
    },
];

export default function WardrobesScreen() {
    const [searchQuery, setSearchQuery] = useState("");

    const renderWardrobeItem = ({ item }: { item: WardrobeItem }) => (
        <Image source={{ uri: item.image }} style={styles.wardrobeItemImage} />
    );

    const handleViewAll = (categoryId: string, categoryName: string) => {
        // Navigate to the wardrobe items page
        router.push({
            pathname: "/wardrobe/items",
            params: {
                categoryId: categoryId,
                categoryName: categoryName,
            },
        });
    };

    const renderWardrobeCategory = ({ item }: { item: WardrobeCategory }) => (
        <View style={styles.categoryContainer}>
            <FlatList
                data={item.items}
                renderItem={renderWardrobeItem}
                keyExtractor={(wardrobeItem) => wardrobeItem.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.itemsList}
                style={styles.horizontalList}
            />

            <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <View style={styles.subtitleContainer}>
                        <View style={styles.aiIcon} />
                        <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => handleViewAll(item.id, item.name)}
                >
                    <Text style={styles.viewAllText}>View all</Text>
                    <Text style={styles.viewAllArrow}>›</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity>
                            <Text style={styles.backButton}>‹</Text>
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.title}>Wardrobes</Text>
                            <Text style={styles.subtitle}>Room No. 1</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => router.push("/wardrobe/create")}
                    >
                        <Text style={styles.createButtonText}>+ Create</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={wardrobeCategories}
                    renderItem={renderWardrobeCategory}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "white",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        fontSize: 24,
        color: "#666",
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },
    subtitle: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    createButton: {
        backgroundColor: "#FF69B4",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#FF69B4",
    },
    createButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "500",
    },
    categoriesList: {
        paddingVertical: 16,
    },
    categoryContainer: {
        marginBottom: 32,
        backgroundColor: "white",
        marginHorizontal: 16,
        borderRadius: 12,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 0,
    },
    categoryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
    },
    horizontalList: {
        marginHorizontal: -16,
        marginBottom: 0,
    },
    itemsList: {
        paddingHorizontal: 16,
        gap: 8,
    },
    wardrobeItemImage: {
        width: 110,
        height: 140,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: "#f0f0f0",
    },
    categoryFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    subtitleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    aiIcon: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#FF69B4",
        marginRight: 6,
    },
    categorySubtitle: {
        fontSize: 12,
        color: "#666",
    },
    viewAllButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        marginHorizontal: -16,
        marginTop: 12,
    },
    viewAllText: {
        fontSize: 14,
        color: "#666",
        marginRight: 4,
    },
    viewAllArrow: {
        fontSize: 16,
        color: "#666",
    },
});
