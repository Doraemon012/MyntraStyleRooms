import { roomAPI, userAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
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

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface RoomMember {
  _id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Editor' | 'Contributor' | 'Viewer';
}

// Mock users data
const mockUsers: User[] = [
  { _id: '1', name: 'Richa Sharma', email: 'richa@email.com', profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
  { _id: '2', name: 'Priya Patel', email: 'priya@email.com', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  { _id: '3', name: 'Sarah Johnson', email: 'sarah@email.com', profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  { _id: '4', name: 'Aisha Khan', email: 'aisha@email.com', profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
  { _id: '5', name: 'Emma Wilson', email: 'emma@email.com', profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
  { _id: '6', name: 'Sofia Rodriguez', email: 'sofia@email.com', profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
  { _id: '7', name: 'Maya Chen', email: 'maya@email.com', profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
  { _id: '8', name: 'Zara Ahmed', email: 'zara@email.com', profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
];

export default function RoomSettingsScreen() {
  const { id } = useLocalSearchParams();
  
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users from API
  const fetchUsers = async (search?: string) => {
    try {
      setLoadingUsers(true);
      console.log('🔍 Fetching users with search:', search || searchQuery);
      
      const response = await userAPI.getAll({ 
        search: search || searchQuery,
        limit: 50 
      });
      
      console.log('📡 Users API response:', response);
      
      if (response.status === 'success') {
        // Backend returns users with 'id' field, convert to '_id' for consistency
        const usersData = (response.data.users || []).map((user: any) => ({
          _id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          location: user.location
        }));
        console.log('✅ Processed users data:', usersData);
        setUsers(usersData);
      } else {
        // Fallback to mock data if API fails
        console.log('❌ API failed, using mock users');
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      // Fallback to mock data
      setUsers(mockUsers);
    } finally {
      setLoadingUsers(false);
    }
  };

  const addMember = (user: User) => {
    const newMember: RoomMember = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: 'Contributor',
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(member => member._id !== id));
  };

  const updateMemberRole = (id: string, role: RoomMember['role']) => {
    setMembers(members.map(member => 
      member._id === id ? { ...member, role } : member
    ));
  };

  const copyInvitationLink = async () => {
    try {
      await Clipboard.setString(invitationLink);
      Alert.alert('Success', 'Invitation link copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  // Fetch room data
  const fetchRoomData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await roomAPI.getById(id as string);
      
      if (response.status === 'success') {
        const roomData = response.data.room;
        setRoom(roomData);
        setRoomName(roomData.name || '');
        setDescription(roomData.description || '');
        setIsPrivate(roomData.isPrivate || false);
        setAiEnabled(roomData.settings?.aiEnabled ?? true);
        
        // Convert members to local format
        const roomMembers = roomData.members?.map((member: any) => ({
          _id: member.userId._id,
          name: member.userId.name,
          email: member.userId.email,
          role: member.role
        })) || [];
        setMembers(roomMembers);
      } else {
        throw new Error(response.message || 'Failed to fetch room data');
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
      Alert.alert('Error', 'Failed to load room settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load room data on mount
  useEffect(() => {
    fetchRoomData();
    fetchUsers();
  }, [id]);

  const saveSettings = async () => {
    if (!id) return;
    
    try {
      setSaving(true);
      
      const updateData = {
        name: roomName.trim(),
        description: description.trim() || undefined,
        isPrivate,
        settings: {
          aiEnabled
        }
      };

      const response = await roomAPI.update(id as string, updateData);
      
      if (response.status === 'success') {
        // Update local room state
        setRoom(prevRoom => ({
          ...prevRoom,
          ...updateData,
          settings: {
            ...prevRoom?.settings,
            ...updateData.settings
          }
        }));
        
        Alert.alert('Success', 'Room settings saved successfully', [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]);
      } else {
        throw new Error(response.message || 'Failed to save room settings');
      }
    } catch (error) {
      console.error('Error saving room settings:', error);
      Alert.alert('Error', 'Failed to save room settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generateInvitationLink = async () => {
    if (!id) return;
    
    try {
      const response = await roomAPI.generateInvitation(id as string, {
        role: 'Contributor',
        expiresInHours: 24
      });
      
      if (response.status === 'success') {
        setInvitationLink(response.data.invitationLink);
        Alert.alert('Success', 'Invitation link generated successfully!');
      } else {
        throw new Error(response.message || 'Failed to generate invitation link');
      }
    } catch (error) {
      console.error('Error generating invitation link:', error);
      Alert.alert('Error', 'Failed to generate invitation link. Please try again.');
    }
  };

  // Handle search
  const handleUserSearch = (query: string) => {
    setSearchQuery(query);
    fetchUsers(query);
  };

  const filteredUsers = users.filter(user => 
    !members.some(member => member._id === user._id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => addMember(item)}
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
      </View>
      <View style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Loading room settings...</Text>
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
           <TouchableOpacity onPress={saveSettings} disabled={saving} style={styles.editButtonContainer}>
             {saving ? (
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
            <Text style={styles.sectionTitle}>Copy invitation link</Text>
            <View style={styles.copyLinkContainer}>
              <TextInput
                style={styles.copyLinkInput}
                value={invitationLink}
                editable={false}
                placeholder="Generate invitation link"
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={invitationLink ? copyInvitationLink : generateInvitationLink} style={styles.copyButton}>
                <Ionicons name={invitationLink ? "copy" : "link"} size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

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
              onPress={() => setShowUserModal(true)}
            >
              <Text style={styles.selectUsersText}>Select Users to Invite</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            {/* Members List */}
            {members.length > 0 ? (
              <View style={styles.membersList}>
                {members.map((member, index) => (
                  <View key={member._id} style={styles.memberItem}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>{member.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberUsername}>@{member.email.split('@')[0]}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeMemberButton}
                      onPress={() => removeMember(member._id)}
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
                  placeholder="Search users..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleUserSearch}
                />
              </View>
              
              {/* Users List */}
              {loadingUsers ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#E91E63" />
                  <Text style={styles.loadingText}>Loading users...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredUsers}
                  renderItem={renderUser}
                  keyExtractor={item => item._id}
                  style={styles.usersList}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>
                        {searchQuery ? 'No users found' : 'No users available'}
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          </View>
        </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
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
  userAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  },
});
