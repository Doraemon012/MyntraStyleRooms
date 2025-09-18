
// export default function HomeScreen() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
//       headerImage={
//         <Image
//           source={require('@/assets/images/partial-react-logo.png')}
//           style={styles.reactLogo}
//         />
//       }>
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Welcome!</ThemedText>
//         <HelloWave />
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 1: Try it</ThemedText>
//         <ThemedText>
//           Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
//           Press{' '}
//           <ThemedText type="defaultSemiBold">
//             {Platform.select({
//               ios: 'cmd + d',
//               android: 'cmd + m',
//               web: 'F12',
//             })}
//           </ThemedText>{' '}
//           to open developer tools.
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <Link href="/modal">
//           <Link.Trigger>
//             <ThemedText type="subtitle">Step 2: Explore</ThemedText>
//           </Link.Trigger>
//           <Link.Preview />
//           <Link.Menu>
//             <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
//             <Link.MenuAction
//               title="Share"
//               icon="square.and.arrow.up"
//               onPress={() => alert('Share pressed')}
//             />
//             <Link.Menu title="More" icon="ellipsis">
//               <Link.MenuAction
//                 title="Delete"
//                 icon="trash"
//                 destructive
//                 onPress={() => alert('Delete pressed')}
//               />
//             </Link.Menu>
//           </Link.Menu>
//         </Link>

//         <ThemedText>
//           {`Tap the Explore tab to learn more about what's included in this starter app.`}
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
//         <ThemedText>
//           {`When you're ready, run `}
//           <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
//           <ThemedText type="defaultSemiBold">app-example</ThemedText>.
//         </ThemedText>
//       </ThemedView>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
// });


import { DancingScript_400Regular, DancingScript_700Bold, useFonts } from '@expo-google-fonts/dancing-script';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/auth-context';
import { useRoom } from '../../contexts/room-context';
import { Room } from '../../services/roomApi';

// Extended Room interface for UI display
interface DisplayRoom extends Room {
  status: 'joined' | 'invited' | 'owner';
  invitedBy?: string;
  acceptedAt?: Date;
}

export default function HomeScreen() {
  // Load fonts first (must be called before any conditional returns)
  let [fontsLoaded] = useFonts({
    DancingScript_400Regular,
    DancingScript_700Bold,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'invited'>('all');
  const [invitationLink, setInvitationLink] = useState('');
  
  // Get real data from contexts
  const { user, token } = useAuth();
  const { rooms: realRooms, isLoading, refreshRooms } = useRoom();

  // Load rooms when component mounts - ONLY if user is authenticated
  useEffect(() => {
    if (token && user) {
      console.log('🏠 HomeScreen: Loading rooms from Myntra Fashion database...');
      refreshRooms();
    } else {
      console.log('🏠 HomeScreen: Waiting for authentication before loading rooms...');
    }
  }, [token, user]);

  // Log rooms data for debugging - ONLY if user is authenticated
  useEffect(() => {
    if (token && user) {
      console.log('🏠 HomeScreen: Real rooms from database:', realRooms.length);
      realRooms.forEach((room, index) => {
        console.log(`Room ${index + 1}: "${room.name}" - Owner: ${room.owner.name} - Members: ${room.memberCount}`);
      });
    }
  }, [realRooms, token, user]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Loading fonts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication required message if user is not logged in
  if (!user || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please log in to view your rooms</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Convert real rooms to display format and categorize them
  const displayRooms: DisplayRoom[] = realRooms.map(room => {
    const isOwner = room.owner._id === user?._id;
    const userMember = room.members.find(member => member.userId._id === user?._id);
    
    let status: 'joined' | 'invited' | 'owner';
    if (isOwner) {
      status = 'owner';
    } else if (userMember) {
      status = 'joined';
    } else {
      status = 'invited'; // This would be for rooms user was invited to but hasn't joined yet
    }

    return {
      ...room,
      status,
      invitedBy: isOwner ? undefined : room.owner.name,
    };
  });


  const handleAcceptInvitation = (roomId: string) => {
    console.log('Accepting invitation for room:', roomId);
    // TODO: Implement actual invitation acceptance API call
    // For now, just refresh rooms to get updated data
    refreshRooms();
  };

  const handleDeclineInvitation = (roomId: string) => {
    console.log('Declining invitation for room:', roomId);
    // TODO: Implement actual invitation decline API call
    // For now, just refresh rooms to get updated data
    refreshRooms();
  };

  // Filter rooms based on search and active tab
  const filteredRooms = displayRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'joined') return matchesSearch && (room.status === 'joined' || room.status === 'owner');
    if (activeTab === 'invited') return matchesSearch && room.status === 'invited';
    return matchesSearch;
  }).sort((a, b) => {
    // Custom ordering for 'all' tab: invited first, then owner, then joined
    if (activeTab === 'all') {
      const statusOrder = { 'invited': 0, 'owner': 1, 'joined': 2 };
      const aOrder = statusOrder[a.status];
      const bOrder = statusOrder[b.status];
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // Within same status, sort by lastActivity (most recent first)
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    }
    
    // For other tabs, sort by lastActivity (most recent first)
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });

  const renderRoom = ({ item }: { item: DisplayRoom }) => (
    <TouchableOpacity 
      style={styles.roomCard}
      onPress={() => router.push(`/room/${item._id}`)}
    >
      {item.status === 'invited' && (
        <Text style={styles.invitedText}>{item.invitedBy} invited you to:</Text>
      )}
      {item.status === 'owner' && (
        <Text style={styles.ownerText}>You own this room</Text>
      )}
      <View style={styles.roomHeader}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <View style={styles.memberSection}>
            <View style={styles.avatarGroup}>
              {item.members.slice(0, 3).map((member, index) => (
                <View 
                  key={member.userId._id}
                  style={[
                    styles.avatar, 
                    { 
                      backgroundColor: ['#FF6B35', '#E91E63', '#9C27B0'][index],
                      marginLeft: index > 0 ? -8 : 0 
                    }
                  ]} 
                />
              ))}
            </View>
            <Text style={styles.memberCount}>{item.memberCount} members</Text>
          </View>
          <Text style={styles.lastMessage}>
            {item.lastMessage || `Created by ${item.owner.name}`}
          </Text>
        </View>
        <View style={styles.roomRight}>
        {item.status === 'invited' && (
          <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleAcceptInvitation(item._id);
                }}
              >
                <Ionicons name="checkmark" size={14} color="#4CAF50" />
            </TouchableOpacity>
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeclineInvitation(item._id);
                }}
              >
                <Ionicons name="close" size={14} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}
          <Text style={styles.timeStamp}>
            {new Date(item.lastActivity).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}  >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image 
              source={require('@/assets/images/icon.webp')} 
              style={styles.logo}
              contentFit="contain"
            />
            <View>
            <Text style={styles.title}>Fashion Rooms</Text>
              <Text style={styles.databaseSubtitle}>Myntra Fashion Database</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/room/create')}
            >
              <Ionicons name="add" size={14} color="#E91E63" />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={18} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={12} color="#999" />
           <TextInput
             style={styles.searchInput}
              placeholder="Search rooms"
             value={searchQuery}
             onChangeText={setSearchQuery}
             placeholderTextColor="#999"
           />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'joined' && styles.activeTab]}
            onPress={() => setActiveTab('joined')}
          >
            <Text style={[styles.tabText, activeTab === 'joined' && styles.activeTabText]}>Joined</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'invited' && styles.activeTab]}
            onPress={() => setActiveTab('invited')}
          >
            <Text style={[styles.tabText, activeTab === 'invited' && styles.activeTabText]}>Invited</Text>
          </TouchableOpacity>
        </View>

        {/* Join Room Section */}
        <LinearGradient
          colors={['#FF6B35', '#E91E63']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.joinRoomCard}
        >
          <Text style={styles.joinRoomTitle}>Join a Room</Text>
          <View style={styles.joinRoomInput}>
            <Ionicons name="link" size={12} color="white" />
            <TextInput
              style={styles.joinRoomTextInput}
              placeholder="Paste Invitation Link"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={invitationLink}
              onChangeText={setInvitationLink}
            />
            <TouchableOpacity 
              style={styles.joinRoomButton}
              onPress={() => {
                if (invitationLink.trim()) {
                  // Handle join room functionality
                  console.log('Joining room with link:', invitationLink);
                  // You can add logic here to process invitation links
                  // For now, just clear the input
                  setInvitationLink('');
                }
              }}
            >
              <Ionicons name="arrow-forward" size={12} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Rooms List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E91E63" />
              <Text style={styles.loadingText}>Loading rooms from Myntra Fashion database...</Text>
                    </View>
          ) : filteredRooms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🏠</Text>
              <Text style={styles.emptyStateTitle}>
                {activeTab === 'all' ? 'No Rooms Found' : 
                 activeTab === 'joined' ? 'No Joined Rooms' : 
                 'No Invitations'}
              </Text>
              <Text style={styles.emptyStateDescription}>
                {activeTab === 'all' ? 'Create your first room or wait for invitations.' :
                 activeTab === 'joined' ? 'You haven\'t joined any rooms yet.' :
                 'You don\'t have any pending invitations.'}
              </Text>
              <Text style={styles.databaseIndicator}>
                📊 Connected to Myntra Fashion Database
                  </Text>
                </View>
          ) : (
            filteredRooms.map((item) => (
              <View key={item._id}>
                {renderRoom({ item })}
              </View>
            ))
          )}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'DancingScript_400Regular',
  },
  databaseSubtitle: {
    fontSize: 10,
    color: '#E91E63',
    fontWeight: '600',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E91E63',
    backgroundColor: 'white',
    gap: 3,
  },
  createButtonText: {
    color: '#E91E63',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: '#E91E63',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '300',
  },
  activeTabText: {
    color: '#E91E63',
    fontWeight: '400',
  },
  joinRoomCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  joinRoomTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  joinRoomInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  joinRoomTextInput: {
    flex: 1,
    color: 'white',
    fontSize: 12,
  },
  joinRoomButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  roomCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invitedText: {
    fontSize: 10,
    color: '#E91E63',
    marginBottom: 6,
    fontWeight: '500',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roomInfo: {
    flex: 1,
    marginRight: 8,
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  memberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  avatar1: {
    backgroundColor: '#FF6B35',
  },
  avatar2: {
    backgroundColor: '#E91E63',
  },
  avatar3: {
    backgroundColor: '#9C27B0',
  },
  avatar4: {
    backgroundColor: '#4CAF50',
  },
  avatar5: {
    backgroundColor: '#2196F3',
  },
  avatar6: {
    backgroundColor: '#FF9800',
  },
  memberCount: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 11,
    color: '#999',
    fontWeight: '400',
    marginTop: 2,
  },
  roomRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  timeStamp: {
    fontSize: 10,
    color: '#999',
    fontWeight: '400',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  acceptButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerText: {
    fontSize: 10,
    color: '#4CAF50',
    marginBottom: 6,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  databaseIndicator: {
    fontSize: 12,
    color: '#E91E63',
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: '#ffe6f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

});