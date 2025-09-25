import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/auth-context';
import { userAPI } from '../services/api';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    location: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || ''
      });
    }
  }, [user]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const response = await userAPI.getAll({ limit: 50 });
      console.log('Friends API Response:', response);
      
      // Handle different response structures
      let friendsData = [];
      
      if (response && response.data && response.data.users && Array.isArray(response.data.users)) {
        // Backend returns users in response.data.users
        friendsData = response.data.users;
      } else if (response && response.users && Array.isArray(response.users)) {
        // If response has users property with array
        friendsData = response.users;
      } else if (response && response.data && Array.isArray(response.data)) {
        // If response has data property with array
        friendsData = response.data;
      } else if (response && Array.isArray(response)) {
        // If response is directly an array
        friendsData = response;
      } else if (response && response.results && Array.isArray(response.results)) {
        // If response has results property with array
        friendsData = response.results;
      }
      
      // Transform the data to match our expected format
      const transformedFriends = friendsData.map((friend: any) => ({
        id: friend._id || friend.id || Math.random().toString(),
        name: friend.name || 'Unknown User',
        email: friend.email || '',
        avatar: friend.profileImage || friend.profilePhoto || friend.avatar || null,
        rooms: friend.sharedRooms || friend.rooms || []
      }));
      
      console.log('Transformed friends:', transformedFriends);
      
      // If no friends found, set empty array
      if (transformedFriends.length === 0) {
        console.log('No friends found in API response');
      }
      
      setFriends(transformedFriends);
      
    } catch (error) {
      console.error('Error fetching friends:', error);
      // Fallback to empty array if API fails
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Here you would typically call an API to update user data
      console.log('Saving user data:', userData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    if (user) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || ''
      });
    }
    setIsEditing(false);
  };

  const handleResetPassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }

    try {
      // Here you would typically call an API to reset password
      console.log('Resetting password...');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password updated successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const handlePhotoChange = () => {
    // Here you would typically implement photo selection/upload
    Alert.alert('Photo Change', 'Photo upload functionality will be implemented here.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={isEditing ? handleSave : handleEdit}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Image
              source={user?.profilePhoto ? { uri: user.profilePhoto } : require('@/assets/images/icon.webp')}
              style={styles.profilePhoto}
              contentFit="cover"
            />
            <TouchableOpacity 
              style={styles.photoEditButton}
              onPress={() => setShowPhotoModal(true)}
            >
              <Ionicons name="camera" size={10} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userData.name || 'User Name'}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={userData.name}
              onChangeText={(text) => setUserData({...userData, name: text})}
              editable={isEditing}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={userData.email}
              editable={false}
              placeholder="Enter your email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={userData.phone}
              onChangeText={(text) => setUserData({...userData, phone: text})}
              editable={isEditing}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={userData.location}
              onChangeText={(text) => setUserData({...userData, location: text})}
              editable={isEditing}
              placeholder="Enter your location"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={userData.dateOfBirth}
              onChangeText={(text) => setUserData({...userData, dateOfBirth: text})}
              editable={isEditing}
              placeholder="DD/MM/YYYY"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={userData.gender}
              onChangeText={(text) => setUserData({...userData, gender: text})}
              editable={isEditing}
              placeholder="Enter your gender"
            />
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
           <TouchableOpacity 
             style={styles.settingItem}
             onPress={() => setShowPasswordModal(true)}
           >
             <View style={styles.settingLeft}>
               <Ionicons name="lock-closed-outline" size={18} color="#666" />
               <Text style={styles.settingText}>Reset Password</Text>
             </View>
             <Ionicons name="chevron-forward" size={18} color="#ccc" />
           </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={18} color="#666" />
              <Text style={styles.settingText}>Notification Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-outline" size={18} color="#666" />
              <Text style={styles.settingText}>Privacy Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/invitations')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={18} color="#666" />
              <Text style={styles.settingText}>Room Invitations</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Friends Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Friends</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchFriends}
            >
              <Ionicons name="refresh" size={14} color="#E91E63" />
            </TouchableOpacity>
          </View>

          {/* Friends Grid */}
          <View style={styles.friendsGrid}>
            {loadingFriends ? (
              <View style={styles.loadingGrid}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={24} color="#ccc" />
                <Text style={styles.emptyText}>No friends found</Text>
                <Text style={styles.emptySubtext}>Join fashion rooms to find friends</Text>
              </View>
            ) : (
              friends.map((friend) => (
                <TouchableOpacity key={friend.id} style={styles.friendCard}>
                  <View style={styles.friendCardAvatar}>
                    <Image
                      source={friend.avatar ? { uri: friend.avatar } : require('@/assets/images/icon.webp')}
                      style={styles.friendCardImage}
                      contentFit="cover"
                    />
                  </View>
                  <Text style={styles.friendCardName} numberOfLines={1}>
                    {friend.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Password Reset Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData({...passwordData, currentPassword: text})}
                placeholder="Enter current password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData({...passwordData, newPassword: text})}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({...passwordData, confirmPassword: text})}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleResetPassword}
              >
                <Text style={styles.modalSaveButtonText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Photo Change Modal */}
      <Modal
        visible={showPhotoModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Profile Photo</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.photoOption} onPress={handlePhotoChange}>
              <Ionicons name="camera" size={24} color="#E91E63" />
              <Text style={styles.photoOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoOption} onPress={handlePhotoChange}>
              <Ionicons name="image" size={24} color="#E91E63" />
              <Text style={styles.photoOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowPhotoModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  editButton: {
    padding: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#E91E63',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profilePhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  photoEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E91E63',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#E91E63',
    borderRadius: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#E91E63',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  photoOptionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  // Friends Section Styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  refreshButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E91E63',
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  friendCard: {
    alignItems: 'center',
    width: (width - 60) / 4,
    marginBottom: 8,
  },
  friendCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  friendCardImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  friendCardName: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingGrid: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  emptyState: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
});
