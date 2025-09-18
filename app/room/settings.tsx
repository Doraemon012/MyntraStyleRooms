import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/auth-context';
import { useRoom } from '../../contexts/room-context';
import { Room, roomApi } from '../../services/roomApi';
import { User, userApi } from '../../services/userApi';

// Updated Room interface now includes invitation fields

interface RoomMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Editor' | 'Contributor' | 'Viewer';
}

export default function RoomSettingsScreen() {
  const { id } = useLocalSearchParams();
  
  // Get real data from contexts
  const { user, token } = useAuth();
  const { rooms: allRooms, updateRoom, addMember, removeMember: removeMemberFromRoom } = useRoom();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState('');
  const [emoji, setEmoji] = useState('👗');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Load room data from database
  const loadRoomData = async () => {
    try {
      setIsLoading(true);
      console.log('🏠 RoomSettings: Loading room from Myntra Fashion database:', id);
      
      if (!token || !user) {
        console.error('No authentication token or user');
        return;
      }

      // Try to get room from context first
      const existingRoom = allRooms.find(r => r._id === id);
      if (existingRoom) {
        console.log('✅ Room found in context:', existingRoom.name);
        setRoomData(existingRoom);
        return;
      }

      // If not in context, fetch from API
      console.log('🔄 Fetching room from API...');
      const roomData = await roomApi.getRoom(token, id as string);
      console.log('✅ Room fetched from API:', roomData.data.room.name);
      setRoomData(roomData.data.room);
      
    } catch (error: any) {
      console.error('❌ Failed to load room:', error);
      Alert.alert('Error', 'Failed to load room data');
    } finally {
      setIsLoading(false);
    }
  };

  // Set room data to form fields
  const setRoomData = (roomData: Room) => {
    setRoom(roomData);
    setRoomName(roomData.name);
    setEmoji(roomData.emoji || '👗');
    setDescription(roomData.description || '');
    setIsPrivate(roomData.isPrivate);
    setAiEnabled(roomData.settings.aiEnabled);
    
    // Convert room members to display format
    const displayMembers: RoomMember[] = roomData.members.map(member => ({
      id: member.userId._id,
      name: member.userId.name,
      email: member.userId.email,
      role: member.role,
    }));
    setMembers(displayMembers);
    
    // Set invitation link if available
    if (roomData.invitationToken) {
      setInvitationLink(`https://myntra-fashion.com/join/${roomData._id}?token=${roomData.invitationToken}`);
    }
  };

  // Search for users
  const searchUsers = async (query: string) => {
    if (!token) return;

    try {
      setIsSearchingUsers(true);
      setSearchError(null);
      
      console.log('🔍 Searching users from Myntra Fashion Database...', { query: query.trim() });
      
      const response = await userApi.searchUsers(token, {
        query: query.trim(),
        limit: 20
      });
      
      console.log('✅ Found users from Myntra Fashion Database:', response.data.users.length);
      setAvailableUsers(response.data.users);
    } catch (error: any) {
      console.error('Search users error:', error);
      setSearchError(error.response?.data?.message || 'Failed to search users');
      setAvailableUsers([]);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  // Load initial users when modal opens
  const handleOpenUserModal = async () => {
    setShowUserModal(true);
    setSearchQuery('');
    await searchUsers('');
  };

  // Handle search query change
  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    await searchUsers(query);
  };

  const addMemberToLocalList = (userToAdd: User) => {
    const newMember: RoomMember = {
      id: userToAdd.id,
      name: userToAdd.name,
      email: userToAdd.email,
      role: 'Contributor',
    };
    setMembers([...members, newMember]);
  };

  const removeMember = async (id: string) => {
    if (!room) return;
    
    const memberToRemove = members.find(m => m.id === id);
    if (!memberToRemove) return;
    
    // Show confirmation dialog
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberToRemove.name} from this room?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Find the actual member ID from the room data
              const roomMember = room.members.find(m => m.userId._id === id);
              if (!roomMember) {
                Alert.alert('Error', 'Member not found in room');
                return;
              }
              
              // Remove from database using the member's _id
              await removeMemberFromRoom(room._id, (roomMember as any)._id);
              
              // Update local state
    setMembers(members.filter(member => member.id !== id));
              
              Toast.show({
                type: 'success',
                text1: '✅ Member Removed',
                text2: `${memberToRemove.name} has been removed from the room`,
                position: 'top',
                visibilityTime: 3000,
              });
              
            } catch (error: any) {
              console.error('Remove member error:', error);
              Alert.alert('Error', error.message || 'Failed to remove member');
            }
          }
        }
      ]
    );
  };

  const updateMemberRole = (id: string, role: RoomMember['role']) => {
    setMembers(members.map(member => 
      member.id === id ? { ...member, role } : member
    ));
  };

  const copyInvitationLink = async () => {
    try {
      if (!invitationLink) {
        Alert.alert('Error', 'No invitation link available');
        return;
      }
      
      await Clipboard.setStringAsync(invitationLink);
      
      Toast.show({
        type: 'success',
        text1: '✅ Invitation Link Copied!',
        text2: 'Share this link with friends to invite them to your room.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 60,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };


  const saveSettings = async () => {
    if (!room || !token) return;

    try {
      setIsSaving(true);
      
      // First, update basic room properties
      const updateData = {
        name: roomName.trim(),
        emoji,
        description: description.trim() || undefined,
        isPrivate,
        settings: {
          aiEnabled,
          allowMemberInvites: true,
          voiceCallEnabled: true
        }
      };

      await updateRoom(room._id, updateData);
      
      // Then, add any new members
      const currentMemberIds = room.members.map(member => member.userId._id);
      const newMembers = members.filter(member => !currentMemberIds.includes(member.id));
      
      for (const newMember of newMembers) {
        try {
          // Only add members with valid roles (exclude Owner)
          const validRole = newMember.role === 'Owner' ? 'Contributor' : newMember.role;
          await addMember(room._id, {
            userId: newMember.id,
            role: validRole as 'Editor' | 'Contributor' | 'Viewer'
          });
          console.log(`✅ Added member: ${newMember.name}`);
        } catch (memberError: any) {
          console.error(`❌ Failed to add member ${newMember.name}:`, memberError);
          // Continue with other members even if one fails
        }
      }
      
      Toast.show({
        type: 'success',
        text1: '✅ Room Settings Saved!',
        text2: `Room "${roomName}" has been updated successfully${newMembers.length > 0 ? ` and ${newMembers.length} member(s) added` : ''}.`,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 60,
      });
      
    router.back();
    } catch (error: any) {
      console.error('Failed to save room settings:', error);
      Alert.alert('Error', error.message || 'Failed to save room settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Check if user has permission to edit room settings
  const canEditRoom = (): boolean => {
    if (!user || !room) return false;
    
    // Check if user is the room owner
    if (room.owner._id === user._id) {
      return true;
    }
    
    // Check if user has Editor role
    const userMember = room.members.find(member => member.userId._id === user._id);
    return userMember?.role === 'Editor';
  };

  // Load room data when component mounts
  useEffect(() => {
    if (token && user && id) {
      loadRoomData();
    }
  }, [token, user, id]);

  const filteredUsers = availableUsers.filter(user => 
    !members.some(member => member.id === user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => addMemberToLocalList(item)}
    >
      <View style={styles.userAvatar}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.userAvatarImage} />
        ) : (
        <Text style={styles.userInitial}>{item.name.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        {item.location && (
          <Text style={styles.userLocation}>📍 {item.location}</Text>
        )}
      </View>
      <View style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Loading room settings from Myntra Fashion database...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Room not found</Text>
            <Text style={styles.databaseIndicator}>
              📊 Connected to Myntra Fashion Database
            </Text>
            <TouchableOpacity style={styles.backButtonStyle} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Check permissions - redirect if user cannot edit room
  if (!canEditRoom()) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Access Denied</Text>
            <Text style={styles.databaseIndicator}>
              You don't have permission to edit this room settings.
            </Text>
            <Text style={styles.databaseIndicator}>
              Only room owners and editors can access room settings.
            </Text>
            <TouchableOpacity style={styles.backButtonStyle} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Room Settings</Text>
           <TouchableOpacity 
             onPress={saveSettings} 
             style={styles.editButtonContainer}
             disabled={isSaving}
           >
             {isSaving ? (
               <ActivityIndicator size="small" color="#E91E63" />
             ) : (
             <Image 
               source={require('@/assets/images/okay_icon.png')} 
               style={styles.editButtonIcon}
               resizeMode="contain"
             />
             )}
           </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Copy Invitation Link Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invitation Link</Text>
            <View style={styles.copyLinkContainer}>
              <TextInput
                style={styles.copyLinkInput}
                value={invitationLink || 'No invitation link available'}
                editable={false}
                placeholder="Generating invitation link..."
                placeholderTextColor="#999"
              />
               <TouchableOpacity onPress={copyInvitationLink} style={styles.copyButton}>
                 <Ionicons name="link" size={16} color="#666" />
               </TouchableOpacity>
            </View>
          </View>

          {/* Room Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Room Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Room emoji*</Text>
              <View style={styles.emojiContainer}>
                {['👗', '🎉', '👰', '🌟', '💼', '🏠', '🎨', '✨'].map((emojiOption) => (
                  <TouchableOpacity
                    key={emojiOption}
                    style={[
                      styles.emojiOption,
                      emoji === emojiOption && styles.emojiOptionSelected
                    ]}
                    onPress={() => setEmoji(emojiOption)}
                  >
                    <Text style={styles.emojiText}>{emojiOption}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Room name*</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Family Wedding Outfits"
                value={roomName}
                onChangeText={setRoomName}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="What's this room about? Add context for members..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </View>

          {/* Privacy Settings Section */}
          <View style={styles.settingBox}>
            <Text style={styles.settingBoxLabel}>Privacy Settings</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingDescription}>Anyone with link can join</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggle, isPrivate && styles.toggleActive]}
                onPress={() => setIsPrivate(!isPrivate)}
              >
                <View style={[styles.toggleThumb, isPrivate && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Enable AI Features Section */}
          <View style={styles.settingBox}>
            <Text style={styles.settingBoxLabel}>Enable AI Features</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingDescription}>AI stylist, recommendations, and voice commands</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggle, aiEnabled && styles.toggleActive]}
                onPress={() => setAiEnabled(!aiEnabled)}
              >
                <View style={[styles.toggleThumb, aiEnabled && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add Members Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Members</Text>
            
            <TouchableOpacity 
              style={styles.selectUsersButton}
              onPress={handleOpenUserModal}
            >
              <Text style={styles.selectUsersText}>Select Users to Invite</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            {/* Members List */}
            {members.length > 0 ? (
              <View style={styles.membersList}>
                {members.map((member, index) => (
                  <View key={member.id} style={styles.memberItem}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>{member.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberUsername}>@{member.email.split('@')[0]}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeMemberButton}
                      onPress={() => removeMember(member.id)}
                    >
                      <Text style={styles.removeMemberText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noMembersText}>No members added yet</Text>
            )}
          </View>
        </ScrollView>

        {/* User Selection Modal */}
        <Modal
          visible={showUserModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => {
                  setShowUserModal(false);
                  setSearchQuery('');
                }}>
                  <Text style={styles.modalCloseButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Add Members</Text>
                <TouchableOpacity onPress={() => {
                  setShowUserModal(false);
                  setSearchQuery('');
                }}>
                  <Text style={styles.modalDoneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search users from Myntra Fashion database..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                />
                {isSearchingUsers && (
                  <ActivityIndicator size="small" color="#E91E63" style={styles.searchLoading} />
                )}
              </View>
              
              {searchError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{searchError}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => searchUsers(searchQuery)}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Users List */}
              <FlatList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={item => item.id}
                style={styles.usersList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      {searchQuery ? 'No users found in Myntra Fashion database' : 'Search for users to invite'}
                    </Text>
                    <Text style={styles.databaseIndicator}>
                      📊 Connected to Myntra Fashion Database
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>
        
        {/* Toast Component */}
        <Toast />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 2,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButtonContainer: {
    padding: 8,
    marginLeft: -8,
  },
  backButton: {
    fontSize: 28,
    color: '#1a1a1a',
    fontWeight: '300',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  editButtonContainer: {
    padding: 8,
    marginRight: -8,
  },
  editButtonIcon: {
    width: 16,
    height: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  copyLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  copyLinkInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1a1a1a',
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  settingBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 14,
    backgroundColor: 'white',
    position: 'relative',
  },
  settingBoxLabel: {
    position: 'absolute',
    top: -14,
    left: 12,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingInfo: {
    flex: 1,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  toggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#E91E63',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  toggleThumbActive: {
    transform: [{ translateX: 16 }],
  },
  selectUsersButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  selectUsersText: {
    fontSize: 12,
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#999',
  },
  membersList: {
    marginTop: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memberInitial: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '400',
    color: '#1a1a1a',
    marginBottom: 1,
  },
  memberUsername: {
    fontSize: 10,
    color: '#666',
  },
  removeMemberButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMemberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 12,
  },
  noMembersText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
    marginBottom: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '50%',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCloseButton: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalDoneButton: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: '70%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // New styles for real data integration
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
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
    marginBottom: 20,
  },
  backButtonStyle: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  // Emoji selection styles
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: '#E91E63',
    backgroundColor: '#ffe6f0',
  },
  emojiText: {
    fontSize: 20,
  },
  // User avatar image styles
  userAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userLocation: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  // Search loading styles
  searchLoading: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  retryButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
