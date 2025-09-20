import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/auth-context';
import { useRoom } from '../../contexts/room-context';
import { Room } from '../../services/roomApi';

export default function RoomsScreen() {
  const { rooms, isLoading, error, refreshRooms, deleteRoom } = useRoom();
  const { user, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('🏠 RoomsScreen: Loading rooms from database...');
    refreshRooms();
  }, []);

  useEffect(() => {
    console.log('🏠 RoomsScreen: Rooms updated:', rooms.length, 'rooms from database');
    rooms.forEach((room, index) => {
      console.log(`Room ${index + 1}: "${room.name}" by ${room.owner.name} (${room.memberCount} members)`);
    });
  }, [rooms]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshRooms();
    setRefreshing(false);
  };

  const handleCreateRoom = () => {
    router.push('/room/create');
  };

  const handleRoomPress = (room: Room) => {
    router.push(`/room/${room._id}`);
  };

  const handleDeleteRoom = (room: Room) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${room.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoom(room._id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete room');
            }
          },
        },
      ]
    );
  };

  const renderRoomItem = ({ item }: { item: Room }) => {
    const isOwner = item.owner._id === user?._id;
    const userRole = item.members.find(member => member.userId._id === user?._id)?.role || 'Viewer';

    return (
      <TouchableOpacity
        style={styles.roomCard}
        onPress={() => handleRoomPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <Text style={styles.roomEmoji}>{item.emoji}</Text>
            <View style={styles.roomDetails}>
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.roomDescription}>
                {item.description || 'No description'}
              </Text>
            </View>
          </View>
          <View style={styles.roomMeta}>
            <Text style={styles.memberCount}>{item.memberCount} members</Text>
            {isOwner && <Text style={styles.ownerBadge}>Owner</Text>}
          </View>
        </View>

        <View style={styles.roomFooter}>
          <View style={styles.roomStatus}>
            {item.isLive && (
              <View style={styles.liveIndicator}>
                <Text style={styles.liveText}>🔴 LIVE</Text>
              </View>
            )}
            <Text style={styles.lastActivity}>
              {new Date(item.lastActivity).toLocaleDateString()}
            </Text>
          </View>
          
          {isOwner && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteRoom(item)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>🏠</Text>
      <Text style={styles.emptyStateTitle}>No Rooms Yet</Text>
      <Text style={styles.emptyStateDescription}>
        Create your first room to start collaborating on fashion choices with friends and family.
      </Text>
      <Text style={styles.databaseIndicator}>
        📊 Connected to Myntra Fashion Database
      </Text>
      <TouchableOpacity style={styles.createFirstRoomButton} onPress={handleCreateRoom}>
        <LinearGradient
          colors={['#E91E63', '#FF6B35']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createFirstRoomGradient}
        >
          <Text style={styles.createFirstRoomText}>Create Your First Room</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Loading rooms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Rooms</Text>
          <Text style={styles.subtitle}>From Myntra Fashion Database</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateRoom}>
          <LinearGradient
            colors={['#E91E63', '#FF6B35']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createButtonGradient}
          >
            <Text style={styles.createButtonText}>+ Create</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshRooms}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={rooms}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#E91E63']}
            tintColor="#E91E63"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
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
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    color: '#E91E63',
    fontWeight: '600',
    marginTop: 2,
  },
  createButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  roomCard: {
    backgroundColor: 'white',
    borderRadius: 12,
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
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  roomDetails: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  roomDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  roomMeta: {
    alignItems: 'flex-end',
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  ownerBadge: {
    fontSize: 10,
    color: '#E91E63',
    backgroundColor: '#ffe6f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '600',
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  lastActivity: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  databaseIndicator: {
    fontSize: 14,
    color: '#E91E63',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
    backgroundColor: '#ffe6f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  createFirstRoomButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createFirstRoomGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstRoomText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
