import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
          {participants.map((participant) => (
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
              <Text style={styles.participantName}>{participant.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Linear Gradient Section - Presenter Info Only */}
      <LinearGradient
        colors={['rgba(60, 60, 60, 0.8)', 'rgba(255, 255, 255,1)']}
        style={styles.presenterSection}
      >
        <View style ={{display: 'flex', flexDirection: 'row'}}>
                <Text style={styles.presenterText2}>{presenterName}</Text>

        <Text style={styles.presenterText}>{' '} is presenting</Text>
      </View>
      </LinearGradient>
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
  presenterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  presenterText: {
    color: '#FFF', // Orange color
    fontSize: 14,
    fontWeight: '600',
    left: 200
  },
  presenterText2: {
    color: '#F13AB1',
    fontSize: 14,
    fontWeight: '600',
    left: 200
  },
});
