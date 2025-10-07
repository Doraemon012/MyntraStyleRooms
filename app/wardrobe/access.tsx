import { ThemedView } from '@/components/themed-view';
import { roomAPI } from '@/services/api';
import wardrobeApi, { Wardrobe } from '@/services/wardrobeApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WardrobeAccessScreen() {
  const { wardrobeId } = useLocalSearchParams();
  const [wardrobe, setWardrobe] = useState<Wardrobe | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState<Array<{ _id: string; name: string; email: string; profileImage?: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Record<string, 'Editor' | 'Viewer'>>({});
  const [savingMembers, setSavingMembers] = useState(false);

  useEffect(() => {
    loadWardrobe();
  }, [wardrobeId]);

  const loadWardrobe = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'Please log in');
        return;
      }
      const res = await wardrobeApi.getWardrobeById(token, wardrobeId as string);
      if (res.status === 'success' && res.data) {
        setWardrobe(res.data.wardrobe);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load access settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    Alert.alert('Invite Sent', `Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  const renderMember = ({ item }: { item: Wardrobe['members'][number] }) => (
    <View style={styles.memberRow}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberInitial}>{item.userId.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.userId.name}</Text>
        <Text style={styles.memberEmail}>{item.userId.email}</Text>
      </View>
      <View style={styles.rolePill}>
        <Text style={styles.rolePillText}>{item.role === 'Owner' ? 'Editor' : item.role}</Text>
      </View>
    </View>
  );

  const openUserPicker = async () => {
    try {
      if (!wardrobe) return;
      setShowUserModal(true);
      setLoadingUsers(true);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'Please log in');
        setLoadingUsers(false);
        return;
      }
      const roomRes = await roomAPI.getById(wardrobe.roomId);
      if (roomRes.status === 'success' && roomRes.data) {
        const roomMembers = roomRes.data.room.members || [];
        const seen: Record<string, boolean> = {};
        const mapped = roomMembers.reduce((acc: Array<{ _id: string; name: string; email: string; profileImage?: string }>, m: any) => {
          const id = m.userId._id || m.userId;
          // Exclude owner from selectable list (owner is implicitly Editor and immutable)
          if (id === wardrobe.owner._id) return acc;
          if (seen[id]) return acc;
          seen[id] = true;
          acc.push({
            _id: id,
            name: m.userId.name || m.name,
            email: m.userId.email || m.email,
            profileImage: m.userId.profileImage || m.profileImage
          });
          return acc;
        }, []);
        setUsers(mapped);
        // Pre-seed existing roles from wardrobe
        const current: Record<string, 'Editor' | 'Viewer'> = {};
        (wardrobe.members || []).forEach(m => {
          if (m.userId._id === wardrobe.owner._id) return; // owner excluded
          if (m.role === 'Editor' || m.role === 'Viewer') current[m.userId._id] = m.role;
        });
        setSelectedMembers(current);
      }
    } catch (e) {
      console.error('Load users error:', e);
      Alert.alert('Error', 'Failed to load room members');
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleSelect = (userId: string) => {
    setSelectedMembers(prev => {
      const next = { ...prev };
      if (next[userId]) {
        delete next[userId];
      } else {
        next[userId] = 'Editor';
      }
      return next;
    });
  };

  const setRole = (userId: string, role: 'Editor' | 'Viewer') => {
    setSelectedMembers(prev => ({ ...prev, [userId]: role }));
  };

  const saveSelectedMembers = async () => {
    if (!wardrobe) return;
    try {
      setSavingMembers(true);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'Please log in');
        return;
      }
      const ops = Object.entries(selectedMembers).map(([userId, role]) =>
        wardrobeApi.addMember(token, wardrobe._id, userId, role)
      );
      await Promise.allSettled(ops);
      await loadWardrobe();
      setShowUserModal(false);
    } catch (e) {
      console.error('Save members error:', e);
      Alert.alert('Error', 'Failed to update collaborators');
    } finally {
      setSavingMembers(false);
    }
  };

  return (
    <>
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Wardrobe Access</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Members</Text>
              {/* Owner row */}
              {wardrobe && (
                <View style={[styles.memberRow, { paddingVertical: 10 }]}> 
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>{wardrobe.owner.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{wardrobe.owner.name}</Text>
                    <Text style={styles.memberEmail}>{wardrobe.owner.email}</Text>
                  </View>
                  <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>Owner</Text>
                  </View>
                </View>
              )}
              <View style={styles.separator} />
              <FlatList
                data={(wardrobe?.members || []).filter(m => m.userId._id !== wardrobe?.owner._id)}
                keyExtractor={(m) => `${m.userId._id}-${m.role}`}
                renderItem={renderMember}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No members yet</Text>}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Collaborators</Text>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionText}>
                  Everyone in the room can view this wardrobe by default. Select members to make them editors.
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.selectUsersButton}
                onPress={openUserPicker}
                activeOpacity={0.8}
              >
                <Text style={styles.selectUsersText}>Select Members to Make Editors</Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
              <Text style={styles.hint}>Owners can manage roles. Editors can add/remove items. Viewers can only view.</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>

    {/* User Selection Modal */}
    <Modal visible={showUserModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowUserModal(false); setSearchQuery(''); }}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Collaborators</Text>
            <TouchableOpacity disabled={savingMembers} onPress={saveSelectedMembers}>
              {savingMembers ? <ActivityIndicator size="small" color="#E91E63" /> : <Text style={styles.modalDoneButton}>Done</Text>}
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {loadingUsers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E91E63" />
            </View>
          ) : (
            <FlatList
              data={users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))}
              keyExtractor={(u) => u._id}
              renderItem={({ item }) => {
                const isSelected = !!selectedMembers[item._id];
                const role = selectedMembers[item._id] || 'Viewer';
                return (
                  <View style={styles.userItem}>
                    <TouchableOpacity style={styles.userLeft} onPress={() => toggleSelect(item._id)}>
                      <View style={[styles.memberAvatar, { marginRight: 10 }]}>
                        <Text style={styles.memberInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View>
                        <Text style={styles.memberName}>{item.name}</Text>
                        <Text style={styles.memberEmail}>{item.email}</Text>
                      </View>
                    </TouchableOpacity>
                    {isSelected ? (
                      <View style={styles.roleButtons}>
                        <TouchableOpacity style={[styles.roleButton, role === 'Editor' && styles.roleButtonActive]} onPress={() => setRole(item._id, 'Editor')}>
                          <Text style={[styles.roleButtonText, role === 'Editor' && styles.roleButtonTextActive]}>Editor</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.roleButton, role === 'Viewer' && styles.roleButtonActive]} onPress={() => setRole(item._id, 'Viewer')}>
                          <Text style={[styles.roleButtonText, role === 'Viewer' && styles.roleButtonTextActive]}>Viewer</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.addPill} onPress={() => toggleSelect(item._id)}>
                        <Text style={styles.addPillText}>Add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  backButtonContainer: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#333', fontWeight: '300' },
  title: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  permissionInfo: { backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6, marginBottom: 12 },
  permissionText: { fontSize: 12, color: '#666', lineHeight: 16 },
  selectUsersButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFC1D1', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FFF5F7'
  },
  selectUsersText: { fontSize: 12, color: '#CC3366', fontWeight: '600' },
  dropdownIcon: { fontSize: 12, color: '#CC3366' },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  memberAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E91E63', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  memberInitial: { color: 'white', fontSize: 12, fontWeight: '600' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 12, color: '#1a1a1a', fontWeight: '500' },
  memberEmail: { fontSize: 10, color: '#666' },
  rolePill: { backgroundColor: '#F3F1FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  rolePillText: { fontSize: 10, color: '#6D28D9', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#f0f0f0' },
  emptyText: { fontSize: 12, color: '#999', textAlign: 'center', paddingVertical: 12 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, backgroundColor: '#f8f9fa' },
  inviteButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: '#E91E63' },
  inviteButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  hint: { fontSize: 10, color: '#666', marginTop: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { maxHeight: '80%', backgroundColor: '#f8f9fa', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalCloseButton: { fontSize: 14, color: '#E91E63' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  modalDoneButton: { fontSize: 14, color: '#E91E63', fontWeight: '600' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  searchInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, backgroundColor: '#f8f9fa' },
  userItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 12 },
  userLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  roleButtons: { flexDirection: 'row', gap: 6 },
  roleButton: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#f0f0f0' },
  roleButtonActive: { backgroundColor: '#E91E63' },
  roleButtonText: { fontSize: 10, color: '#666' },
  roleButtonTextActive: { color: 'white' },
  addPill: { backgroundColor: '#F3F1FE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  addPillText: { fontSize: 10, color: '#6D28D9', fontWeight: '600' },
});


