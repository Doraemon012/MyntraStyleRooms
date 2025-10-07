import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSession } from '../../contexts/session-context';
import webrtcService from '../../services/webrtcServiceFactory';

interface VoiceCallParticipantsProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function VoiceCallParticipants({ isVisible, onClose }: VoiceCallParticipantsProps) {
  const { sessionParticipants, currentUserId } = useSession();
  const [remoteStreams, setRemoteStreams] = useState<Map<string, any>>(new Map());
  const [callStatus, setCallStatus] = useState<any>(null);

  useEffect(() => {
    if (!isVisible) return;

    // Update remote streams periodically
    const streamsInterval = setInterval(() => {
      const streams = webrtcService.getRemoteStreams();
      setRemoteStreams(streams);
    }, 1000);

    // Update call status
    const statusInterval = setInterval(() => {
      const status = webrtcService.getCallStatus();
      setCallStatus(status);
    }, 1000);

    return () => {
      clearInterval(streamsInterval);
      clearInterval(statusInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Voice Call Participants</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.participantsList}>
          {sessionParticipants.map((participant) => {
            const isCurrentUser = participant.id === currentUserId;
            const hasRemoteStream = remoteStreams.has(participant.id);
            const isSpeaking = false; // TODO: Implement speaking detection

            return (
              <View key={participant.id} style={styles.participantItem}>
                <View style={styles.participantInfo}>
                  <View style={[styles.avatarContainer, isSpeaking && styles.speakingAvatar]}>
                    <Image source={{ uri: participant.avatar }} style={styles.avatar} />
                    {isSpeaking && (
                      <View style={styles.speakingIndicator}>
                        <Ionicons name="volume-high" size={12} color="white" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.participantDetails}>
                    <Text style={styles.participantName}>
                      {participant.name} {isCurrentUser && '(You)'}
                    </Text>
                    <View style={styles.statusContainer}>
                      <Ionicons 
                        name={hasRemoteStream ? "checkmark-circle" : "radio-button-off"} 
                        size={16} 
                        color={hasRemoteStream ? "#4CAF50" : "#999"} 
                      />
                      <Text style={styles.statusText}>
                        {hasRemoteStream ? 'Connected' : 'Connecting...'}
                      </Text>
                    </View>
                  </View>
                </View>

                {isCurrentUser && (
                  <View style={styles.localIndicator}>
                    <Ionicons name="mic" size={16} color="#666" />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {callStatus && (
          <View style={styles.callInfo}>
            <Text style={styles.callInfoText}>
              {callStatus.participantCount + 1} participants in call
            </Text>
            <Text style={styles.callInfoText}>
              {callStatus.isMuted ? 'Muted' : 'Unmuted'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  participantsList: {
    maxHeight: 300,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  speakingAvatar: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  localIndicator: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  callInfo: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  callInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
