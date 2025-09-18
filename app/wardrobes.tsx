import { ThemedView } from "@/components/themed-view";
import { LinearGradient } from "expo-linear-gradient";
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
    role: string;
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
        role: "Editor",
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
        role: "Editor",
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
        role: "Viewer",
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

    const renderWardrobeCategory = ({ item, index }: { item: WardrobeCategory; index: number }) => {
        const isEven = index % 2 === 0;
        const gradientColors = isEven 
            ? ['#F3F1FE', '#FFFFFF'] as const // Purple to white
            : ['#FFEEEC', '#FFFFFF'] as const; // Pink to white
        
        return (
            <LinearGradient
                colors={gradientColors}
                style={styles.categoryContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{item.role}</Text>
                </View>
                
                <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{item.name}</Text>
                        <View style={styles.subtitleContainer}>
                            <View style={styles.aiIcon} />
                            <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
                        </View>
                    </View>
                </View>

                <FlatList
                    data={item.items}
                    renderItem={renderWardrobeItem}
                    keyExtractor={(wardrobeItem) => wardrobeItem.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.itemsList}
                    style={styles.horizontalList}
                />

                <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => handleViewAll(item.id, item.name)}
                >
                    <Text style={styles.viewAllText}>View all</Text>
                    <Text style={styles.viewAllArrow}>›</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
                        <Text style={styles.backButton}>‹</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>Wardrobes</Text>
                        <Text style={styles.subtitle}>Room No. 1</Text>
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
                    renderItem={({ item, index }) => renderWardrobeCategory({ item, index })}
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
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "white",
    },
    backButtonContainer: {
        width: 40,
        alignItems: "flex-start",
    },
    backButton: {
        fontSize: 24,
        color: "#666",
        fontWeight: "300",
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: "400",
        color: "#000",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 10,
        color: "#666",
        textAlign: "center",
    },
    createButton: {
        backgroundColor: "transparent",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#FF69B4",
        minWidth: 80,
        alignItems: "center",
        justifyContent: "center",
    },
    createButtonText: {
        color: "#FF69B4",
        fontSize: 12,
        fontWeight: "600",
    },
    categoriesList: {
        paddingVertical: 16,
    },
    categoryContainer: {
        marginBottom: 24,
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 0,
    },
    categoryHeader: {
        marginBottom: 8,
    },
    horizontalList: {
        marginHorizontal: -16,
        marginBottom: 0,
    },
    itemsList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    wardrobeItemImage: {
        width: 160,
        height: 140,
        borderRadius: 12,
        marginRight: 12,
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
        fontSize: 14,
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
    roleBadge: {
        position: "absolute",
        top: 12,
        right: 16,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    roleText: {
        fontSize: 10,
        color: "#CCCCCC",
        fontWeight: "500",
    },
    viewAllButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        marginTop: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        alignSelf: "center",
        minWidth: 380,
    },
    viewAllText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
        marginRight: 6,
    },
    viewAllArrow: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
});
