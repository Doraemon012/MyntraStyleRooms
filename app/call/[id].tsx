

import { ThemedText } from '@/components/themed-text';
import { useSession } from '@/contexts/session-context';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
}

interface Room {
  id: string;
  name: string;
  emoji: string;
  description: string;
  memberCount: number;
}

const mockRooms: { [key: string]: Room } = {
  '1': { id: '1', name: 'Family Wedding', emoji: '👰', description: 'Planning outfits for the family wedding ceremony', memberCount: 5 },
  '2': { id: '2', name: 'College Freshers', emoji: '🎉', description: 'Fresh looks for college parties and events', memberCount: 3 },
  '3': { id: '3', name: 'Saturday Party', emoji: '🔥', description: 'Weekend party vibes and styling', memberCount: 4 },
};

const mockParticipants: Participant[] = [
  { id: '1', name: 'You', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', isMuted: false, isDeafened: false, isSpeaking: true, isConnected: true },
  { id: '2', name: 'Priya', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', isMuted: false, isDeafened: false, isSpeaking: false, isConnected: true },
  { id: '3', name: 'Rahul', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', isMuted: true, isDeafened: false, isSpeaking: false, isConnected: true },
  { id: '4', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', isMuted: false, isDeafened: true, isSpeaking: false, isConnected: true },
  { id: '5', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', isMuted: false, isDeafened: false, isSpeaking: false, isConnected: false },
  { id: '6', name: 'Emma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', isMuted: false, isDeafened: false, isSpeaking: false, isConnected: true },
  { id: '7', name: 'Mike', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', isMuted: true, isDeafened: false, isSpeaking: false, isConnected: true },
  { id: '8', name: 'Lisa', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', isMuted: false, isDeafened: false, isSpeaking: false, isConnected: true },
  { id: '9', name: 'John', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face', isMuted: false, isDeafened: false, isSpeaking: false, isConnected: true },
  { id: '10', name: 'Anna', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face', isMuted: true, isDeafened: false, isSpeaking: false, isConnected: true },
  { id: '11', name: 'David', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', isMuted: false, isDeafened: false, isSpeaking: false, isConnected: false },
  { id: '12', name: 'Sophie', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face', isMuted: false, isDeafened: false, isSpeaking: false, isConnected: true },
];

const mockSessionParticipants = [
  {
    id: '1',
    name: 'You',
    avatar: '👤',
    isMuted: false,
    currentProduct: null
  },
  {
    id: '2',
    name: 'Chinku',
    avatar: '👩',
    isMuted: true,
    currentProduct: {
      id: '1',
      name: 'Red Silk Saree',
      image: '👗'
    }
  },
  {
    id: '3',
    name: 'Minku',
    avatar: '👩‍🦱',
    isMuted: false,
    currentProduct: {
      id: '2',
      name: 'Blue Kurta',
      image: '👔'
    }
  },
  {
    id: '4',
    name: 'Tinku',
    avatar: '👩‍🦰',
    isMuted: false,
    currentProduct: null
  },
  {
    id: '5',
    name: 'Poha',
    avatar: '👩‍💼',
    isMuted: true,
    currentProduct: null
  },
  {
    id: '6',
    name: 'Juhi',
    avatar: '👩‍🎨',
    isMuted: true,
    currentProduct: null
  },
];

export default function CallScreen() {
  const { id } = useLocalSearchParams();
  const roomData = mockRooms[id as string] || mockRooms['1'];
  const { startSession, enterLiveView, endSession } = useSession();
  
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  useEffect(() => {
    // Start session when call screen loads (as host)
    startSession(id as string, mockSessionParticipants, true);
    
    return () => {
      // Clean up session when leaving call
      endSession();
    };
  }, [id, startSession, endSession]);

  const connectedParticipants = participants.filter(p => p.isConnected);
  const disconnectedParticipants = participants.filter(p => !p.isConnected);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setParticipants(prev => prev.map(p => 
      p.id === '1' ? { ...p, isMuted: !isMuted } : p
    ));
  };

  const toggleDeafen = () => {
    const newDeafened = !isDeafened;
    setIsDeafened(newDeafened);
    if (newDeafened) setIsMuted(true);
    
    setParticipants(prev => prev.map(p => 
      p.id === '1' ? { ...p, isDeafened: newDeafened, isMuted: newDeafened || isMuted } : p
    ));
  };

  const leaveCall = () => {
    endSession();
    router.back();
  };

  const goToLiveView = () => {
    enterLiveView();
    router.push('/(tabs)/explore');
  };

  const renderParticipant = (participant: Participant) => (
    <View key={participant.id} style={styles.participantContainer}>
      <View style={[
        styles.avatarContainer,
        participant.isSpeaking && styles.speakingBorder,
        !participant.isConnected && styles.disconnectedBorder
      ]}>
        <Image 
          source={{ uri: participant.avatar }} 
          style={styles.avatarImage}
          contentFit="cover"
        />
        
        <View style={styles.statusIndicators}>
          {participant.isMuted && (
            <View style={styles.statusIcon}>
              <Text style={styles.statusIconText}>🔇</Text>
            </View>
          )}
          {participant.isDeafened && (
            <View style={styles.statusIcon}>
              <Text style={styles.statusIconText}>🔇</Text>
            </View>
          )}
          {!participant.isConnected && (
            <View style={[styles.statusIcon, styles.disconnectedIcon]}>
              <Text style={styles.statusIconText}>📵</Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={[
        styles.participantName,
        !participant.isConnected && styles.disconnectedName
      ]}>
        {participant.name}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container} edges={['top']}>
        
        <View style={styles.header}>
          <View style={styles.roomInfo}>
            <Text style={styles.roomEmoji}>{roomData.emoji}</Text>
            <View>
              <ThemedText style={styles.roomName}>{roomData.name}</ThemedText>
              <Text style={styles.participantCount}>
                {connectedParticipants.length} connected
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.liveViewButton} onPress={goToLiveView}>
            <Text style={styles.liveViewIcon}>🛍️</Text>
            <Text style={styles.liveViewText}>Live View</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
          
          {connectedParticipants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                VOICE — {connectedParticipants.length}
              </Text>
              <View style={styles.participantsGrid}>
                {connectedParticipants.map(renderParticipant)}
              </View>
            </View>
          )}

          {disconnectedParticipants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                OFFLINE — {disconnectedParticipants.length}
              </Text>
              <View style={styles.participantsGrid}>
                {disconnectedParticipants.map(renderParticipant)}
              </View>
            </View>
          )}

        </ScrollView>

        <View style={styles.bottomControls}>
          <View style={styles.userInfo}>
            <View style={[styles.userAvatar, isMuted && styles.mutedAvatar]}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }} 
                style={styles.userAvatarImage}
                contentFit="cover"
              />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>You</Text>
              <Text style={styles.userStatus}>
                {isDeafened ? 'Deafened' : isMuted ? 'Muted' : 'Connected'}
              </Text>
            </View>
          </View>

          <View style={styles.controlButtons}>
            <TouchableOpacity 
              style={[styles.controlButton, isMuted && styles.activeControlButton]} 
              onPress={toggleMute}
            >
              <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, isDeafened && styles.activeControlButton]} 
              onPress={toggleDeafen}
            >
              <Text style={styles.controlIcon}>{isDeafened ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.leaveButton} onPress={leaveCall}>
              <Text style={styles.leaveIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#36393f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2f3136',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  participantCount: {
    fontSize: 12,
    color: '#b9bbbe',
  },
  liveViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5865f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  liveViewIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  liveViewText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e9297',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  participantContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 8,
    width: (width - 64) / 3,
  },
  avatarContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#40444b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  speakingBorder: {
    borderColor: '#00d26a',
    shadowColor: '#00d26a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  disconnectedBorder: {
    borderColor: '#747f8d',
    opacity: 0.5,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  statusIndicators: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
  },
  statusIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f04747',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  disconnectedIcon: {
    backgroundColor: '#747f8d',
  },
  statusIconText: {
    fontSize: 10,
  },
  participantName: {
    fontSize: 12,
    color: '#dcddde',
    textAlign: 'center',
    fontWeight: '500',
  },
  disconnectedName: {
    color: '#747f8d',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2f3136',
    borderTopWidth: 1,
    borderTopColor: '#202225',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#40444b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  mutedAvatar: {
    borderWidth: 2,
    borderColor: '#f04747',
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
    fontWeight: '600',
    color: 'white',
  },
  userStatus: {
    fontSize: 12,
    color: '#b9bbbe',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#40444b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeControlButton: {
    backgroundColor: '#f04747',
  },
  controlIcon: {
    fontSize: 18,
  },
  leaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f04747',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  leaveIcon: {
    fontSize: 18,
  },
});