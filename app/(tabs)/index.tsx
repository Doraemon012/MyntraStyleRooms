

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Room {
    id: string;
    name: string;
    emoji: string;
    lastMessage: string;
    memberCount: number;
    isLive: boolean;
    lastActivity: string;
}

const mockRooms: Room[] = [
    {
        id: "1",
        name: "Family Wedding",
        emoji: "👰",
        lastMessage: "AI: Perfect saree for the ceremony!",
        memberCount: 5,
        isLive: false,
        lastActivity: "2 min ago",
    },
    {
        id: "2",
        name: "College Freshers",
        emoji: "🎉",
        lastMessage: "Need jacket suggestions",
        memberCount: 3,
        isLive: true,
        lastActivity: "Live now",
    },
    {
        id: "3",
        name: "Saturday Party",
        emoji: "🔥",
        lastMessage: "Added red dress to wardrobe",
        memberCount: 4,
        isLive: false,
        lastActivity: "1 hour ago",
    },
];

export default function HomeScreen() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredRooms = mockRooms.filter((room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderRoom = ({ item }: { item: Room }) => (
        <TouchableOpacity
            style={styles.roomCard}
            onPress={() => router.push(`/room/${item.id}`)}
        >
            <View style={styles.roomHeader}>
                <View style={styles.roomInfo}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                    <View style={styles.roomDetails}>
                        <ThemedText style={styles.roomName}>
                            {item.name}
                        </ThemedText>
                        <View style={styles.memberInfo}>
                            <ThemedText style={styles.memberCount}>
                                {item.memberCount} members
                            </ThemedText>
                            {item.isLive && (
                                <View style={styles.liveBadge}>
                                    <Text style={styles.liveText}>LIVE</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                <ThemedText style={styles.timestamp}>
                    {item.lastActivity}
                </ThemedText>
            </View>
            <ThemedText style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
            </ThemedText>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView>
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Fashion Rooms</ThemedText>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => router.push("/room/create")}
                    >
                        <Text style={styles.createButtonText}>+ Create</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                </View>

                <FlatList
                    data={filteredRooms}
                    renderItem={renderRoom}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.roomsList}
                />
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    createButton: {
        backgroundColor: "#ff6b6b",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    createButtonText: {
        color: "white",
        fontWeight: "600",
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    searchInput: {
        backgroundColor: "white",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#e1e5e9",
    },
    roomsList: {
        paddingHorizontal: 20,
    },
    roomCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    roomHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    roomInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    emoji: {
        fontSize: 32,
        marginRight: 12,
    },
    roomDetails: {
        flex: 1,
    },
    roomName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    memberInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    memberCount: {
        fontSize: 14,
        color: "#666",
        marginRight: 8,
    },
    liveBadge: {
        backgroundColor: "#ff6b6b",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    liveText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    timestamp: {
        fontSize: 12,
        color: "#999",
    },
    lastMessage: {
        fontSize: 14,
        color: "#666",
        fontStyle: "italic",
    },
});