import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isSpeaking: boolean;
}

interface WardrobeItem {
  id: string;
  name: string;
  price: string;
  addedBy: string;
  category: string;
}

const mockParticipants: Participant[] = [
  { id: '1', name: 'You', isMuted: false, isSpeaking: true },
  { id: '2', name: 'Priya', isMuted: false, isSpeaking: false },
  { id: '3', name: 'Arjun', isMuted: true, isSpeaking: false },
];

const mockWardrobeItems: WardrobeItem[] = [
  {
    id: '1',
    name: 'Red Wrap Dress',
    price: '₹2,499',
    addedBy: 'Priya',
    category: 'Dress',
  },
  {
    id: '2',
    name: 'Silver Heels',
    price: '₹1,899',
    addedBy: 'AI Stylist',
    category: 'Footwear',
  },
  {
    id: '3',
    name: 'Gold Chain Necklace',
    price: '₹3,200',
    addedBy: 'You',
    category: 'Accessories',
  },
];

export default function LiveCallScreen() {
  const { id } = useLocalSearchParams();
  const [isCallActive, setIsCallActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>(mockWardrobeItems);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    setIsCallActive(false);
    router.back();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const renderParticipant = (participant: Participant) => (
    <View
      key={participant.id}
      style={[
        styles.participantCard,
        participant.isSpeaking && styles.speakingParticipant,
      ]}
    >
      <View style={styles.participantAvatar}>
        <Text style={styles.participantInitial}>
          {participant.name.charAt(0)}
        </Text>
      </View>
      <Text style={styles.participantName}>{participant.name}</Text>
      {participant.isMuted && (
        <Text style={styles.mutedIndicator}>🔇</Text>
      )}
    </View>
  );

  const renderWardrobeItem = (item: WardrobeItem) => (
    <View key={item.id} style={styles.wardrobeItem}>
      <View style={styles.itemImagePlaceholder}>
        <Text style={styles.itemEmoji}>
          {item.category === 'Dress' ? '👗' : 
           item.category === 'Footwear' ? '👠' : '💍'}
        </Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <Text style={styles.itemAddedBy}>Added by {item.addedBy}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton}>
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.callInfo}>
            <ThemedText style={styles.roomName}>Saturday Party Look</ThemedText>
            <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
          </View>
          <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
            <Text style={styles.endCallText}>End Call</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.participantsSection}>
          <ThemedText style={styles.sectionTitle}>Participants</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.participantsList}>
              {mockParticipants.map(renderParticipant)}
            </View>
          </ScrollView>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.catalogSection}>
            <ThemedText style={styles.sectionTitle}>Browsing Catalog</ThemedText>
            <View style={styles.catalogPlaceholder}>
              <Text style={styles.catalogEmoji}>👗</Text>
              <Text style={styles.catalogText}>Myntra Catalog View</Text>
              <Text style={styles.catalogSubtext}>Scroll through products live</Text>
            </View>
          </View>

          <View style={styles.wardrobeSection}>
            <View style={styles.wardrobeHeader}>
              <ThemedText style={styles.sectionTitle}>Shared Wardrobe</ThemedText>
              <Text style={styles.itemCount}>{wardrobeItems.length} items</Text>
            </View>
            <ScrollView style={styles.wardrobeList}>
              {wardrobeItems.map(renderWardrobeItem)}
            </ScrollView>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.mutedButton]}
            onPress={toggleMute}
          >
            <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🔊'}</Text>
            <Text style={styles.controlText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>📱</Text>
            <Text style={styles.controlText}>Share Screen</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>➕</Text>
            <Text style={styles.controlText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2a2a2a',
  },
  callInfo: {
    alignItems: 'center',
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  callDuration: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  endCallButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  endCallText: {
    color: 'white',
    fontWeight: '600',
  },
  participantsSection: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  participantsList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  participantCard: {
    alignItems: 'center',
    marginRight: 15,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#3a3a3a',
  },
  speakingParticipant: {
    backgroundColor: '#ff6b6b',
  },
  participantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  participantInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  participantName: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  mutedIndicator: {
    fontSize: 10,
    marginTop: 2,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  catalogSection: {
    flex: 2,
    backgroundColor: '#f8f9fa',
    margin: 10,
    borderRadius: 12,
    padding: 15,
  },
  catalogPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  catalogEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  catalogText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  catalogSubtext: {
    fontSize: 14,
    color: '#666',
  },
  wardrobeSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    margin: 10,
    marginLeft: 0,
    borderRadius: 12,
    padding: 15,
  },
  wardrobeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  wardrobeList: {
    flex: 1,
  },
  wardrobeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  itemPrice: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  itemAddedBy: {
    fontSize: 10,
    color: '#666',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#2a2a2a',
  },
  controlButton: {
    alignItems: 'center',
    marginHorizontal: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#3a3a3a',
  },
  mutedButton: {
    backgroundColor: '#ff6b6b',
  },
  controlIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});