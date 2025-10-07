import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/auth-context';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
}

interface HostSessionHeaderProps {
  participants: Participant[];
  presenterName: string;
  onNotificationPress?: () => void;
  onLikePress?: () => void;
  onParticipantsPress?: () => void;
}

export default function HostSessionHeader({
  participants,
  presenterName,
  onNotificationPress,
  onLikePress,
  onParticipantsPress,
}: HostSessionHeaderProps) {
  const { user } = useAuth();
  const uniqueParticipants = React.useMemo(() => {
    const byKey = new Map<string, Participant>();
    const currentUserId = user?._id;
    const norm = (s?: string) => (s || '').trim().toLowerCase();
    const currentUserNameNorm = norm(user?.name);
    for (const p of participants) {
      const nameNorm = norm(p.name);
      const isSelfById = currentUserId && p.id === currentUserId;
      const isSelfByName = !!currentUserNameNorm && nameNorm === currentUserNameNorm;
      const isYouLiteral = nameNorm === 'you';
      const key = (currentUserId && (isSelfById || isSelfByName || isYouLiteral)) ? currentUserId : p.id;
      if (!byKey.has(key)) {
        byKey.set(key, p);
      }
    }
    return Array.from(byKey.values());
  }, [participants, user]);
  return (
    <View style={styles.container}>
      {/* Pure White Background - Participants List */}
      <View style={styles.participantsSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.participantsContainer}
          contentContainerStyle={styles.participantsContent}
        >
          {uniqueParticipants.map((participant) => {
            const isCurrentUser = user && participant.id === user._id;
            const displayName = isCurrentUser
              ? `${user?.name || participant.name} (you)`
              : (participant.name === 'You' && user?.name ? user.name : participant.name);
            return (
              <View key={participant.id} style={styles.participantItem}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarCircle}>
                    <Image 
                      source={{ uri: participant.avatar }} 
                      style={styles.avatarImage}
                      contentFit="cover"
                    />
                  </View>
                  <View style={[
                    styles.micIcon,
                    participant.isMuted ? styles.micMuted : styles.micActive
                  ]}>
                    <Ionicons 
                      name={participant.isMuted ? "mic-off" : "mic"} 
                      size={8} 
                      color="white" 
                    />
                  </View>
                </View>
                <Text style={styles.participantName}>{displayName}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16, // Status bar height
  },
  participantsSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  participantsContainer: {
    marginBottom: 8,
  },
  participantsContent: {
    paddingRight: 16,
  },
  participantItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 25,
    backgroundColor: '#F6F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  micIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micActive: {
    backgroundColor: '#FF6B35', // Orange color
  },
  micMuted: {
    backgroundColor: '#8E8E93', // Gray color
  },
  participantName: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});
