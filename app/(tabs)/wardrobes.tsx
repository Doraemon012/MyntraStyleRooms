import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Wardrobe {
  id: string;
  name: string;
  emoji: string;
  itemCount: number;
  memberCount: number;
  role: 'Owner' | 'Editor' | 'Contributor' | 'Viewer';
  lastUpdated: string;
  coverItems: string[];
}

const mockWardrobes: Wardrobe[] = [
  {
    id: '1',
    name: 'Family Wedding',
    emoji: '👰',
    itemCount: 12,
    memberCount: 5,
    role: 'Owner',
    lastUpdated: '2 hours ago',
    coverItems: ['👗', '👠', '💍'],
  },
  {
    id: '2',
    name: 'Office Formals',
    emoji: '💼',
    itemCount: 8,
    memberCount: 2,
    role: 'Editor',
    lastUpdated: '1 day ago',
    coverItems: ['👔', '👞', '💼'],
  },
  {
    id: '3',
    name: 'Weekend Casuals',
    emoji: '🌟',
    itemCount: 15,
    memberCount: 3,
    role: 'Contributor',
    lastUpdated: '3 days ago',
    coverItems: ['👕', '👖', '👟'],
  },
];

export default function WardrobesScreen() {
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>(mockWardrobes);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWardrobes = wardrobes.filter(wardrobe =>
    wardrobe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Owner': return '#ff6b6b';
      case 'Editor': return '#4CAF50';
      case 'Contributor': return '#2196F3';
      case 'Viewer': return '#9E9E9E';
      default: return '#666';
    }
  };

  const renderWardrobe = ({ item }: { item: Wardrobe }) => (
    <TouchableOpacity
      style={styles.wardrobeCard}
      onPress={() => router.push(`/wardrobe/${item.id}`)}
    >
      <View style={styles.wardrobeHeader}>
        <View style={styles.wardrobeInfo}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <View style={styles.wardrobeDetails}>
            <ThemedText style={styles.wardrobeName}>{item.name}</ThemedText>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>{item.itemCount} items</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.statText}>{item.memberCount} members</Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: getRoleColor(item.role) },
          ]}
        >
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
      </View>

      <View style={styles.coverItems}>
        {item.coverItems.map((emoji, index) => (
          <View key={index} style={styles.coverItem}>
            <Text style={styles.coverItemEmoji}>{emoji}</Text>
          </View>
        ))}
      </View>

      <ThemedText style={styles.lastUpdated}>
        Updated {item.lastUpdated}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <ThemedText style={styles.title}>My Wardrobes</ThemedText>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/wardrobe/create')}
          >
            <Text style={styles.createButtonText}>+ Create</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search wardrobes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <FlatList
          data={filteredWardrobes}
          renderItem={renderWardrobe}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.wardrobesList}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  createButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
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
  wardrobesList: {
    paddingHorizontal: 20,
  },
  wardrobeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  wardrobeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  wardrobeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  wardrobeDetails: {
    flex: 1,
  },
  wardrobeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  coverItems: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  coverItem: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  coverItemEmoji: {
    fontSize: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});