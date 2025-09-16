
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
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Room {
  id: string;
  name: string;
  lastMessage: string;
  memberCount: number;
  status: 'joined' | 'invited' | 'accepted';
  lastActivity: string;
  invitedBy?: string;
  memberAvatars: string[];
  acceptedAt?: Date;
}

const mockRooms: Room[] = [
  // Invited Rooms
  {
    id: '1',
    name: 'College Freshers Party',
    lastMessage: 'Richa: Hey! Check out this cute top I found',
    memberCount: 12,
    status: 'invited',
    lastActivity: '2 mins ago',
    invitedBy: 'Richa',
    memberAvatars: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    ]
  },
  {
    id: '2',
    name: 'Wedding Shopping',
    lastMessage: 'AI: Elegant lehenga suggestions under ₹15K',
    memberCount: 8,
    status: 'invited',
    lastActivity: '5 mins ago',
    invitedBy: 'Priya',
    memberAvatars: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    ]
  },
  // Joined Rooms
  {
    id: '3',
    name: 'Family Wedding',
    lastMessage: 'Mom: The saree looks perfect!',
    memberCount: 25,
    status: 'joined',
    lastActivity: '30 mins ago',
    invitedBy: undefined,
    memberAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
    ]
  },
  {
    id: '4',
    name: 'Friends Reunion',
    lastMessage: 'Sarah: Can\'t wait to see everyone!',
    memberCount: 18,
    status: 'joined',
    lastActivity: '1 hour ago',
    invitedBy: undefined,
    memberAvatars: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    ]
  },
  {
    id: '5',
    name: 'Work Conference',
    lastMessage: 'AI: Professional business attire',
    memberCount: 7,
    status: 'joined',
    lastActivity: '2 hours ago',
    invitedBy: undefined,
    memberAvatars: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    ]
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'invited'>('all');
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  
  let [fontsLoaded] = useFonts({
    DancingScript_400Regular,
    DancingScript_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleAcceptInvitation = (roomId: string) => {
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId 
          ? { ...room, status: 'accepted' as const, invitedBy: undefined, acceptedAt: new Date() }
          : room
      )
    );
  };

  const handleDeclineInvitation = (roomId: string) => {
    setRooms(prevRooms => 
      prevRooms.filter(room => room.id !== roomId)
    );
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'joined') return matchesSearch && (room.status === 'joined' || room.status === 'accepted');
    if (activeTab === 'invited') return matchesSearch && room.status === 'invited';
    return matchesSearch;
  }).sort((a, b) => {
    // Custom ordering for 'all' tab: invited first, then accepted, then joined
    if (activeTab === 'all') {
      const statusOrder = { 'invited': 0, 'accepted': 1, 'joined': 2 };
      const aOrder = statusOrder[a.status];
      const bOrder = statusOrder[b.status];
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // Within same status, sort by acceptedAt for accepted rooms (most recent first)
      if (a.status === 'accepted' && b.status === 'accepted') {
        return (b.acceptedAt?.getTime() || 0) - (a.acceptedAt?.getTime() || 0);
      }
    }
    
    return 0;
  });

  const renderRoom = ({ item }: { item: Room }) => (
    <View style={styles.roomCard}>
      {item.status === 'invited' && (
        <Text style={styles.invitedText}>{item.invitedBy} invited you to:</Text>
      )}
      <View style={styles.roomHeader}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <View style={styles.memberSection}>
            <View style={styles.avatarGroup}>
              <View style={[styles.avatar, styles.avatar1]} />
              <View style={[styles.avatar, styles.avatar2]} />
              <View style={[styles.avatar, styles.avatar3]} />
            </View>
            <Text style={styles.memberCount}>{item.memberCount}+ members</Text>
          </View>
        </View>
        {item.status === 'invited' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.acceptButton}>
              <Ionicons name="checkmark" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton}>
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image 
              source={require('@/assets/images/icon.png')} 
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.title}>Fashion Rooms</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.createButton}>
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
            />
            <TouchableOpacity style={styles.joinRoomButton}>
              <Ionicons name="arrow-forward" size={12} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Rooms List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredRooms.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.roomCard}
              onPress={() => router.push(`/room/${item.id}`)}
            >
              {item.status === 'invited' && (
                <Text style={styles.invitedText}>{item.invitedBy} invited you to:</Text>
              )}
              <View style={styles.roomHeader}>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{item.name}</Text>
                  <View style={styles.memberSection}>
                    <View style={styles.avatarGroup}>
                      {item.memberAvatars.slice(0, 3).map((avatar, index) => (
                        <Image
                          key={index}
                          source={{ uri: avatar }}
                          style={[styles.avatar, { marginLeft: index > 0 ? -8 : 0 }]}
                        />
                      ))}
                    </View>
                    <Text style={styles.memberCount}>{item.memberCount}+ members</Text>
                  </View>
                  <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                </View>
                <View style={styles.roomRight}>
                  {item.status === 'invited' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.acceptButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleAcceptInvitation(item.id);
                        }}
                      >
                        <Ionicons 
                          name="checkmark" 
                          size={14} 
                          color="#4CAF50" 
                        />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.declineButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeclineInvitation(item.id);
                        }}
                      >
                        <Ionicons 
                          name="close" 
                          size={14} 
                          color="#F44336" 
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                  <Text style={styles.timeStamp}>
                    {item.status === 'accepted' && item.acceptedAt 
                      ? 'Just accepted' 
                      : item.lastActivity
                    }
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </SafeAreaView>
    </View>
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
    paddingBottom: 20,
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

});