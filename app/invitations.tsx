import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { invitationAPI, roomAPI, userAPI } from '../services/api';

const { width } = Dimensions.get('window');

interface Invitation {
  _id: string;
  room: {
    _id: string;
    name: string;
    emoji: string;
    description?: string;
    isPrivate: boolean;
  };
  inviter: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  role: 'Editor' | 'Contributor' | 'Viewer';
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  createdAt: string;
  respondedAt?: string;
}

export default function InvitationsScreen() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    fetchInvitations();
  }, [activeTab]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching invitations for status:', activeTab);
      setDebugInfo(`Fetching invitations for status: ${activeTab}`);
      
      const response = await invitationAPI.getAll({ 
        status: activeTab === 'pending' ? 'pending' : activeTab 
      });
      
      console.log('📨 Invitations response:', response);
      setDebugInfo(`Response received: ${JSON.stringify(response, null, 2)}`);
      
      if (response.status === 'success') {
        setInvitations(response.data.invitations);
        console.log('✅ Loaded invitations:', response.data.invitations.length);
        setDebugInfo(`Loaded ${response.data.invitations.length} invitations`);
      }
    } catch (error) {
      console.error('❌ Error fetching invitations:', error);
      setDebugInfo(`Error: ${error.message || 'Unknown error'}`);
      Alert.alert('Error', `Failed to load invitations: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvitations();
    setRefreshing(false);
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const response = await invitationAPI.accept(invitationId);
      
      if (response.status === 'success') {
        Alert.alert('Success', 'Invitation accepted! You are now a member of the room.');
        fetchInvitations(); // Refresh the list
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert('Error', 'Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    Alert.alert(
      'Decline Invitation',
      'Are you sure you want to decline this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await invitationAPI.decline(invitationId);
              
              if (response.status === 'success') {
                Alert.alert('Success', 'Invitation declined');
                fetchInvitations(); // Refresh the list
              }
            } catch (error) {
              console.error('Error declining invitation:', error);
              Alert.alert('Error', 'Failed to decline invitation');
            }
          }
        }
      ]
    );
  };

  const createTestInvitation = async () => {
    try {
      // First get a room to invite to
      const roomsResponse = await roomAPI.getAll();
      if (roomsResponse.status === 'success' && roomsResponse.data.rooms.length > 0) {
        const room = roomsResponse.data.rooms[0];
        
        // Get current user info
        const userResponse = await userAPI.getCurrentUser();
        if (userResponse.status === 'success') {
          const currentUser = userResponse.data.user;
          
          // Create invitation to self for testing
          const invitationData = {
            roomId: room._id,
            inviteeId: currentUser._id,
            role: 'Contributor' as const,
            message: 'Test invitation for debugging',
            expiresInDays: 7
          };
          
          console.log('🧪 Creating test invitation:', invitationData);
          const response = await invitationAPI.send(invitationData);
          
          if (response.status === 'success') {
            Alert.alert('Success', 'Test invitation created!');
            fetchInvitations(); // Refresh the list
          }
        }
      } else {
        Alert.alert('Error', 'No rooms found to create test invitation');
      }
    } catch (error) {
      console.error('Error creating test invitation:', error);
      Alert.alert('Error', `Failed to create test invitation: ${error.message || 'Unknown error'}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else {
      return `Expires in ${diffDays} days`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'accepted': return '#4CAF50';
      case 'declined': return '#F44336';
      case 'expired': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'declined': return 'Declined';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  const renderInvitation = (invitation: Invitation) => (
    <View key={invitation._id} style={styles.invitationCard}>
      <View style={styles.invitationHeader}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomEmoji}>{invitation.room.emoji}</Text>
          <View style={styles.roomDetails}>
            <Text style={styles.roomName}>{invitation.room.name}</Text>
            <Text style={styles.roomDescription}>
              {invitation.room.description || 'No description'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invitation.status) }]}>
          <Text style={styles.statusText}>{getStatusText(invitation.status)}</Text>
        </View>
      </View>

      <View style={styles.invitationDetails}>
        <View style={styles.inviterInfo}>
          <Image
            source={invitation.inviter.profileImage ? 
              { uri: invitation.inviter.profileImage } : 
              require('@/assets/images/icon.webp')
            }
            style={styles.inviterAvatar}
            contentFit="cover"
          />
          <View style={styles.inviterDetails}>
            <Text style={styles.inviterName}>{invitation.inviter.name}</Text>
            <Text style={styles.inviterRole}>Invited you as {invitation.role}</Text>
          </View>
        </View>

        {invitation.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>"{invitation.message}"</Text>
          </View>
        )}

        <View style={styles.invitationFooter}>
          <Text style={styles.expiryText}>
            {formatDate(invitation.expiresAt)}
          </Text>
          <Text style={styles.createdText}>
            {new Date(invitation.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {invitation.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDeclineInvitation(invitation._id)}
            >
              <Ionicons name="close" size={16} color="#F44336" />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptInvitation(invitation._id)}
            >
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={activeTab === 'pending' ? 'mail-outline' : 'checkmark-circle-outline'} 
        size={64} 
        color="#ccc" 
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'pending' ? 'No Pending Invitations' : 
         activeTab === 'accepted' ? 'No Accepted Invitations' : 
         'No Declined Invitations'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'pending' ? 
          'You don\'t have any pending room invitations' :
          `You don't have any ${activeTab} invitations`}
      </Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>Invitations</Text>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={createTestInvitation}
        >
          <Ionicons name="add" size={24} color="#E91E63" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accepted' && styles.activeTab]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.activeTabText]}>
            Accepted
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'declined' && styles.activeTab]}
          onPress={() => setActiveTab('declined')}
        >
          <Text style={[styles.tabText, activeTab === 'declined' && styles.activeTabText]}>
            Declined
          </Text>
        </TouchableOpacity>
      </View>

      {/* Debug Info */}
      {__DEV__ && debugInfo && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading invitations...</Text>
          </View>
        ) : invitations.length === 0 ? (
          renderEmptyState()
        ) : (
          invitations.map(renderInvitation)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  testButton: {
    padding: 8,
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#E91E63',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  invitationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
    marginBottom: 4,
  },
  roomDescription: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  invitationDetails: {
    padding: 16,
  },
  inviterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inviterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  inviterDetails: {
    flex: 1,
  },
  inviterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  inviterRole: {
    fontSize: 12,
    color: '#666',
  },
  messageContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  invitationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  expiryText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  createdText: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  declineButton: {
    borderColor: '#F44336',
    backgroundColor: '#fff',
  },
  acceptButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 6,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
});
