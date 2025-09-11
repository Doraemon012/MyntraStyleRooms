import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WardrobeMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Editor' | 'Contributor' | 'Viewer';
}

const predefinedEmojis = ['👗', '👰', '💼', '🌟', '🎉', '👠', '💍', '🎪', '🔥', '💄'];
const occasionTypes = [
  'Wedding & Celebrations',
  'Office & Professional',
  'Casual & Weekend',
  'Party & Nightlife',
  'Travel & Vacation',
  'Festival & Cultural',
  'Sports & Fitness',
  'Date Night',
  'General Collection',
];

export default function CreateWardrobeScreen() {
  const [wardrobeName, setWardrobeName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👗');
  const [description, setDescription] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState<WardrobeMember[]>([]);
  const [budgetRange, setBudgetRange] = useState({ min: '', max: '' });

  const addMember = () => {
    if (memberEmail.trim()) {
      const newMember: WardrobeMember = {
        id: Date.now().toString(),
        name: memberEmail.split('@')[0],
        email: memberEmail.trim(),
        role: 'Contributor',
      };
      setMembers([...members, newMember]);
      setMemberEmail('');
    }
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  const updateMemberRole = (id: string, role: WardrobeMember['role']) => {
    setMembers(members.map(member => 
      member.id === id ? { ...member, role } : member
    ));
  };

  const createWardrobe = () => {
    if (!wardrobeName.trim()) {
      Alert.alert('Error', 'Please enter a wardrobe name');
      return;
    }

    if (!selectedOccasion) {
      Alert.alert('Error', 'Please select an occasion type');
      return;
    }

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
  };

  const renderMember = (member: WardrobeMember) => (
    <View key={member.id} style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitial}>{member.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberEmail}>{member.email}</Text>
        </View>
      </View>
      <View style={styles.memberActions}>
        <TouchableOpacity
          style={[styles.roleButton, member.role === 'Editor' && styles.activeRole]}
          onPress={() => updateMemberRole(member.id, 'Editor')}
        >
          <Text style={[styles.roleText, member.role === 'Editor' && styles.activeRoleText]}>
            Editor
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, member.role === 'Contributor' && styles.activeRole]}
          onPress={() => updateMemberRole(member.id, 'Contributor')}
        >
          <Text style={[styles.roleText, member.role === 'Contributor' && styles.activeRoleText]}>
            Contributor
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, member.role === 'Viewer' && styles.activeRole]}
          onPress={() => updateMemberRole(member.id, 'Viewer')}
        >
          <Text style={[styles.roleText, member.role === 'Viewer' && styles.activeRoleText]}>
            Viewer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeMember(member.id)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <ThemedText style={styles.title}>Create Wardrobe</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Wardrobe Details</ThemedText>
              
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
                <Text style={styles.label}>Choose Icon</Text>
                <View style={styles.emojiGrid}>
                  {predefinedEmojis.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.emojiButton,
                        selectedEmoji === emoji && styles.selectedEmoji,
                      ]}
                      onPress={() => setSelectedEmoji(emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Occasion Type *</Text>
                <View style={styles.occasionGrid}>
                  {occasionTypes.map((occasion) => (
                    <TouchableOpacity
                      key={occasion}
                      style={[
                        styles.occasionButton,
                        selectedOccasion === occasion && styles.selectedOccasion,
                      ]}
                      onPress={() => setSelectedOccasion(occasion)}
                    >
                      <Text style={[
                        styles.occasionText,
                        selectedOccasion === occasion && styles.selectedOccasionText,
                      ]}>
                        {occasion}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Budget Range (Optional)</Text>
                <View style={styles.budgetRow}>
                  <TextInput
                    style={[styles.textInput, styles.budgetInput]}
                    placeholder="Min ₹"
                    value={budgetRange.min}
                    onChangeText={(text) => setBudgetRange({...budgetRange, min: text})}
                    keyboardType="numeric"
                  />
                  <Text style={styles.budgetSeparator}>to</Text>
                  <TextInput
                    style={[styles.textInput, styles.budgetInput]}
                    placeholder="Max ₹"
                    value={budgetRange.max}
                    onChangeText={(text) => setBudgetRange({...budgetRange, max: text})}
                    keyboardType="numeric"
                  />
                </View>
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
              <ThemedText style={styles.sectionTitle}>Add Collaborators</ThemedText>
              
              <View style={styles.addMemberContainer}>
                <TextInput
                  style={[styles.textInput, styles.memberInput]}
                  placeholder="Enter email address"
                  value={memberEmail}
                  onChangeText={setMemberEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.addButton} onPress={addMember}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.roleExplanation}>
                <Text style={styles.roleTitle}>Permission Levels:</Text>
                <Text style={styles.roleDescription}>• Editor: Can add, remove, and edit items</Text>
                <Text style={styles.roleDescription}>• Contributor: Can add items and reactions</Text>
                <Text style={styles.roleDescription}>• Viewer: Can view and react to items</Text>
              </View>

              {members.length > 0 && (
                <View style={styles.membersList}>
                  <Text style={styles.membersCount}>{members.length} collaborator(s) added</Text>
                  {members.map(renderMember)}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>AI Features</ThemedText>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🤖</Text>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureTitle}>Smart Outfit Suggestions</Text>
                    <Text style={styles.featureDescription}>
                      AI will create complete outfits from your wardrobe items
                    </Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>📊</Text>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureTitle}>Style Analytics</Text>
                    <Text style={styles.featureDescription}>
                      Get insights on your style preferences and gaps
                    </Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🛍️</Text>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureTitle}>Smart Shopping</Text>
                    <Text style={styles.featureDescription}>
                      AI recommends new items that complement your wardrobe
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={createWardrobe}>
              <Text style={styles.createButtonText}>Create Wardrobe</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    fontSize: 24,
    color: '#ff6b6b',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 24,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    color: '#666',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEmoji: {
    borderColor: '#ff6b6b',
    backgroundColor: '#ffebee',
  },
  emojiText: {
    fontSize: 24,
  },
  occasionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  occasionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOccasion: {
    backgroundColor: '#ffebee',
    borderColor: '#ff6b6b',
  },
  occasionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOccasionText: {
    color: '#ff6b6b',
    fontWeight: '500',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetInput: {
    flex: 1,
  },
  budgetSeparator: {
    fontSize: 16,
    color: '#666',
  },
  privacyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#ff6b6b',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  addMemberContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  memberInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  roleExplanation: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  membersList: {
    marginTop: 16,
  },
  membersCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleButton: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeRole: {
    backgroundColor: '#ff6b6b',
  },
  roleText: {
    fontSize: 10,
    color: '#666',
  },
  activeRoleText: {
    color: 'white',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});