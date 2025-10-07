import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/auth-context';
import { useSession } from '../../contexts/session-context';
import webrtcService from '../../services/webrtcServiceFactory';

interface VoiceCallControlsProps {
  onCallStarted?: () => void;
  onCallEnded?: () => void;
}

export default function VoiceCallControls({ onCallStarted, onCallEnded }: VoiceCallControlsProps) {
  const { user } = useAuth();
  const { sessionRoomId, isHost, sessionParticipants, setVoiceCallState, addVoiceCallParticipant, removeVoiceCallParticipant } = useSession();
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<any>(null);

  useEffect(() => {
    if (!user || !sessionRoomId) return;

    // Initialize WebRTC service
    webrtcService.initialize({
      onCallStarted: () => {
        console.log('🎤 Voice call started');
        setIsInCall(true);
        setVoiceCallState(true);
        onCallStarted?.();
      },
      onCallEnded: () => {
        console.log('🎤 Voice call ended');
        setIsInCall(false);
        setVoiceCallState(false);
        onCallEnded?.();
      },
      onUserJoinedCall: (userId) => {
        console.log('🎤 User joined call:', userId);
        addVoiceCallParticipant(userId);
      },
      onUserLeftCall: (userId) => {
        console.log('🎤 User left call:', userId);
        removeVoiceCallParticipant(userId);
      },
      onError: (error) => {
        console.error('❌ Voice call error:', error);
        Alert.alert('Voice Call Error', error.message || 'An error occurred during the voice call');
      },
    }, user._id);

    // Update call status periodically
    const statusInterval = setInterval(() => {
      const status = webrtcService.getCallStatus();
      setCallStatus(status);
      setIsInCall(status.isInCall);
      setIsMuted(status.isMuted);
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      if (isInCall) {
        webrtcService.endCall();
      }
    };
  }, [user, sessionRoomId, onCallStarted, onCallEnded]);

  const handleStartCall = async () => {
    if (!sessionRoomId) return;
    
    try {
      if (isHost) {
        await webrtcService.startCall(sessionRoomId);
      } else {
        await webrtcService.joinCall(sessionRoomId);
      }
    } catch (error) {
      console.error('❌ Error starting/joining call:', error);
      Alert.alert('Error', 'Failed to start/join voice call. Please check your microphone permissions.');
    }
  };

  const handleEndCall = () => {
    webrtcService.endCall();
  };

  const handleToggleMute = () => {
    webrtcService.toggleMute();
  };

  if (!sessionRoomId) return null;

  return (
    <View style={styles.container}>
      {!isInCall ? (
        <TouchableOpacity style={styles.startCallButton} onPress={handleStartCall}>
          <Ionicons name="call" size={24} color="white" />
          <Text style={styles.buttonText}>
            {isHost ? 'Start Voice Call' : 'Join Voice Call'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.callControls}>
          <TouchableOpacity 
            style={[styles.controlButton, isMuted && styles.mutedButton]} 
            onPress={handleToggleMute}
          >
            <Ionicons name={isMuted ? "mic-off" : "mic"} size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Ionicons name="call" size={20} color="white" />
          </TouchableOpacity>
          
          {callStatus && (
            <Text style={styles.participantCount}>
              {callStatus.participantCount + 1} participants
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  startCallButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  callControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 20,
  },
  controlButton: {
    backgroundColor: '#2196F3',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutedButton: {
    backgroundColor: '#F44336',
  },
  endCallButton: {
    backgroundColor: '#F44336',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  participantCount: {
    color: 'white',
    fontSize: 12,
    marginLeft: 10,
  },
});
