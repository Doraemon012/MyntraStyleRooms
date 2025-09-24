import { useSession } from '@/contexts/session-context';
import { roomAPI, userAPI } from '@/services/api';
import { wardrobeApi } from '@/services/wardrobeApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface WardrobeMember {
  userId: string;
  name: string;
  email: string;
  profileImage?: string;
  role: 'Editor' | 'Contributor' | 'Viewer';
}


export default function CreateWardrobeScreen() {
  const { sessionRoomId } = useSession();
  const [wardrobeName, setWardrobeName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [members, setMembers] = useState<WardrobeMember[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'Please log in to view users');
        setLoadingUsers(false);
        return;
      }

      let response;
      if (sessionRoomId) {
        // Get users from the current room
        console.log('Loading users from room:', sessionRoomId);
        response = await roomAPI.getById(sessionRoomId);
        if (response.status === 'success' && response.data) {
          // Extract users from room members
          const roomMembers = response.data.room.members || [];
          const users = roomMembers.map((member: any) => ({
            _id: member.userId._id || member.userId,
            name: member.userId.name || member.name,
            email: member.userId.email || member.email,
            profileImage: member.userId.profileImage || member.profileImage
          }));
          setUsers(users);
          console.log(`Loaded ${users.length} users from room`);
        } else {
          console.log('Failed to load room, falling back to all users');
          // Fallback to all users if room loading fails
          response = await userAPI.getAll({ limit: 50 });
          if (response.status === 'success' && response.data) {
            setUsers(response.data.users);
            console.log(`Loaded ${response.data.users.length} users from fallback`);
          }
        }
      } else {
        // Fallback: get all users if no room context
        console.log('No room context, loading all users');
        response = await userAPI.getAll({ limit: 50 });
        if (response.status === 'success' && response.data) {
          setUsers(response.data.users);
          console.log(`Loaded ${response.data.users.length} users from all users`);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const addMember = (user: User) => {
    const newMember: WardrobeMember = {
      userId: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: 'Editor',
    };
    setMembers([...members, newMember]);
    // Close the modal after adding a member
    setShowUserModal(false);
    setSearchQuery('');
  };

  const addAllRoomMembers = () => {
    if (sessionRoomId && users.length > 0) {
      const newMembers: WardrobeMember[] = users
        .filter(user => !members.some(member => member.userId === user._id))
        .map(user => ({
          userId: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          role: 'Editor' as const,
        }));
      setMembers([...members, ...newMembers]);
      // Close the modal after adding all members
      setShowUserModal(false);
      setSearchQuery('');
    }
  };

  const removeMember = (userId: string) => {
    setMembers(members.filter(member => member.userId !== userId));
  };

  const updateMemberRole = (userId: string, role: WardrobeMember['role']) => {
    setMembers(members.map(member => 
      member.userId === userId ? { ...member, role } : member
    ));
  };

  const filteredUsers = users.filter(user => 
    !members.some(member => member.userId === user._id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );


  const createWardrobe = async () => {
    if (!wardrobeName.trim()) {
      Alert.alert('Error', 'Please enter a wardrobe name');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'Please log in to create a wardrobe');
        setLoading(false);
        return;
      }

      const response = await wardrobeApi.createWardrobe(token, {
        name: wardrobeName,
        emoji: '👗', // Default emoji
        description: description || undefined,
        isPrivate,
        members: members.map(member => ({
          userId: member.userId,
          role: member.role as 'Editor' | 'Contributor' | 'Viewer'
        }))
      });

      if (response.status === 'success') {
        // Show success message and navigate back
        Alert.alert(
          'Success',
          'Wardrobe created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to create wardrobe');
      }
    } catch (error) {
      console.error('Create wardrobe error:', error);
      Alert.alert('Error', 'Failed to create wardrobe');
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => addMember(item)}
    >
      <View style={styles.userAvatar}>
        <Text style={styles.userInitial}>{item.name.charAt(0).toUpperCase()}</Text>
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Wardrobe</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wardrobe Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Wardrobe Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Family Wedding Collection"
                  value={wardrobeName}
                  onChangeText={setWardrobeName}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="What's this wardrobe for? Add details about style preferences, occasions, etc."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              </View>



              <View style={styles.inputGroup}>
                <View style={styles.privacyToggle}>
                  <View>
                    <Text style={styles.label}>Privacy Setting</Text>
                    <Text style={styles.sublabel}>
                      {isPrivate ? 'Only invited members can access' : 'Anyone with link can view'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggle, isPrivate && styles.toggleActive]}
                    onPress={() => setIsPrivate(!isPrivate)}
                  >
                    <View style={[styles.toggleThumb, isPrivate && styles.toggleThumbActive]} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Collaborators</Text>
            
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionText}>
                Everyone in the room can view this wardrobe by default. Select members to make them editors.
              </Text>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.selectUsersButton}
                onPress={() => setShowUserModal(true)}
              >
                <Text style={styles.selectUsersText}>Select Members to Make Editors</Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
              
              {sessionRoomId && users.length > 0 && (
                <TouchableOpacity 
                  style={styles.addAllButton}
                  onPress={addAllRoomMembers}
                >
                  <Text style={styles.addAllText}>Add All Room Members</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Members List */}
            {members.length > 0 ? (
              <View style={styles.membersList}>
                <Text style={styles.membersCount}>{members.length} editor(s) selected</Text>
                {members.map((member, index) => (
                  <View key={`member-${member.userId}-${index}`} style={styles.memberItem}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>{member.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberUsername}>@{member.email.split('@')[0]}</Text>
                    </View>
                    <View style={styles.memberActions}>
                      <TouchableOpacity
                        style={[styles.roleButton, member.role === 'Editor' && styles.activeRole]}
                        onPress={() => updateMemberRole(member.userId, 'Editor')}
                      >
                        <Text style={[styles.roleText, member.role === 'Editor' && styles.activeRoleText]}>
                          Editor
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.roleButton, member.role === 'Viewer' && styles.activeRole]}
                        onPress={() => updateMemberRole(member.userId, 'Viewer')}
                      >
                        <Text style={[styles.roleText, member.role === 'Viewer' && styles.activeRoleText]}>
                          Viewer
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeMemberButton}
                      onPress={() => removeMember(member.userId)}
                    >
                      <Text style={styles.removeMemberText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noMembersText}>No editors selected yet</Text>
            )}
          </View>

        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity onPress={createWardrobe} disabled={loading}>
            <LinearGradient
              colors={['#E91E63', '#FF6B35']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.createButton, loading && styles.createButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Create Wardrobe</Text>
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
                <Text style={styles.modalTitle}>Add Editors</Text>
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
                  onChangeText={setSearchQuery}
                />
              </View>
              
              {/* Users List */}
              {loadingUsers ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#E91E63" />
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
  sublabel: {
    fontSize: 12,
    color: '#666',
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
  privacyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  permissionInfo: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  selectUsersButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  selectUsersText: {
    fontSize: 12,
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#999',
  },
  roleExplanation: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 10,
    color: '#666',
    lineHeight: 14,
  },
  membersList: {
    marginTop: 8,
  },
  membersCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
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
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  roleButton: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeRole: {
    backgroundColor: '#E91E63',
  },
  roleText: {
    fontSize: 10,
    color: '#666',
  },
  activeRoleText: {
    color: 'white',
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
    opacity: 0.6,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  pickerText: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#999',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  addAllButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAllText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});