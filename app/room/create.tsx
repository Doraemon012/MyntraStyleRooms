import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
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
import { roomApi } from '../../services/roomApi';
import { User, userApi } from '../../services/userApi';


interface RoomMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Editor' | 'Contributor' | 'Viewer';
}


export default function CreateRoomScreen() {
  const [roomName, setRoomName] = useState('');
  const [emoji, setEmoji] = useState('👗');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { createRoom } = useRoom();
  const { user, token } = useAuth();

  // Search for users
  const searchUsers = async (query: string) => {
    if (!token) return;

    try {
      setIsSearchingUsers(true);
      setSearchError(null);
      
      const response = await userApi.searchUsers(token, {
        query: query.trim(),
        limit: 20
      });
      
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

  const addMember = (userToAdd: User) => {
    const newMember: RoomMember = {
      id: userToAdd.id,
      name: userToAdd.name,
      email: userToAdd.email,
      role: 'Contributor',
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  const updateMemberRole = (id: string, role: RoomMember['role']) => {
    setMembers(members.map(member => 
      member.id === id ? { ...member, role } : member
    ));
  };

  const generateInvitationLink = () => {
    const roomId = Date.now().toString();
    const token = Math.random().toString(36).substring(2, 15);
    const link = `https://myntra.com/join-room?roomId=${roomId}&token=${token}`;
    setInvitationLink(link);
    return link;
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    try {
      setIsCreating(true);

      const roomData = {
        name: roomName.trim(),
        emoji,
        description: description.trim() || undefined,
        isPrivate,
        members: members.map(member => ({
          userId: member.id,
          role: member.role as 'Editor' | 'Contributor' | 'Viewer'
        })),
        settings: {
          aiEnabled,
          allowMemberInvites: true,
          voiceCallEnabled: true
        }
      };

      const newRoom = await createRoom(roomData);
      
      // Generate invitation link
      try {
        const invitationResponse = await roomApi.generateInvitation(token!, newRoom._id, {
          role: 'Contributor',
          expiresInHours: 168 // 7 days
        });
        
        const invitationLink = invitationResponse.data.invitationLink;
        
        // Copy to clipboard
        await Clipboard.setStringAsync(invitationLink);
        
        // Show success toast notification
        Toast.show({
          type: 'success',
          text1: '🎉 Room Created Successfully!',
          text2: `Room "${newRoom.name}" created and invitation link copied to clipboard!`,
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 60,
        });
        
        // Show additional info alert
        Alert.alert(
          'Invitation Link Ready!', 
          `Your room "${newRoom.name}" has been created and the invitation link has been copied to your clipboard.\n\nShare this link with friends to invite them to your room.`,
          [
            {
              text: 'Share Link',
              onPress: () => {
                // You can add sharing functionality here if needed
                console.log('Share invitation link:', invitationLink);
              }
            },
            {
              text: 'Done',
              onPress: () => router.back()
            }
          ]
        );
      } catch (invitationError: any) {
        console.error('Failed to generate invitation:', invitationError);
        
        // Still show success but without invitation link
        Toast.show({
          type: 'success',
          text1: '✅ Room Created Successfully!',
          text2: `Room "${newRoom.name}" created!`,
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 60,
        });
        
        Alert.alert(
          'Room Created!', 
          `Room "${newRoom.name}" created successfully!\n\nNote: Could not generate invitation link. You can create one later from room settings.`,
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };


  const filteredUsers = availableUsers.filter(userToAdd => 
    !members.some(member => member.id === userToAdd.id)
  );

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => addMember(item)}
    >
      <View style={styles.userAvatar}>
        {item.profileImage ? (
          <Text style={styles.userInitial}>📷</Text>
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Room</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Room Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Room Details</Text>
            
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
              <Text style={styles.label}>Room emoji*</Text>
              <View style={styles.emojiContainer}>
                <TouchableOpacity style={styles.emojiButton}>
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.textInput, styles.emojiInput]}
                  placeholder="👗"
                  value={emoji}
                  onChangeText={setEmoji}
                  maxLength={2}
                />
              </View>
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

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity onPress={handleCreateRoom} disabled={isCreating}>
            <LinearGradient
              colors={['#E91E63', '#FF6B35']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.createButton, isCreating && styles.createButtonDisabled]}
            >
              {isCreating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Create Room</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
                  placeholder="Search users by name or email..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                />
                {isSearchingUsers && (
                  <View style={styles.searchLoading}>
                    <ActivityIndicator size="small" color="#E91E63" />
                  </View>
                )}
              </View>
              
              {/* Users List */}
              <FlatList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={item => item.id}
                style={styles.usersList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    {searchError ? (
                      <>
                        <Text style={styles.errorText}>❌ {searchError}</Text>
                        <TouchableOpacity 
                          style={styles.retryButton}
                          onPress={() => searchUsers(searchQuery)}
                        >
                          <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={styles.emptyStateText}>
                        {searchQuery ? 'No users found matching your search' : 'No users available'}
                      </Text>
                    )}
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
  placeholder: {
    width: 44,
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
  settingLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1a1a1a',
    marginBottom: 2,
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
  memberDivider: {
    position: 'absolute',
    bottom: 0,
    left: 56,
    right: 0,
    height: 1,
    backgroundColor: '#f0f0f0',
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
  bottomActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  createButton: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  emojiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  emojiText: {
    fontSize: 20,
  },
  emojiInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
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
  userLocation: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  searchLoading: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});