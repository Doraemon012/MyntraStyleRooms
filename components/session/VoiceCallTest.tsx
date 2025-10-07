import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/auth-context';
import { useSession } from '../../contexts/session-context';
import webrtcService from '../../services/webrtcServiceFactory';

export default function VoiceCallTest() {
  const { user } = useAuth();
  const { sessionRoomId, isHost, isInVoiceCall } = useSession();
  const [callStatus, setCallStatus] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!user || !sessionRoomId || isInitialized) return;

    // Initialize WebRTC service for testing
    webrtcService.initialize({
      onCallStarted: () => {
        console.log('🎤 Test: Voice call started');
        Alert.alert('Voice Call', 'Voice call started successfully!');
      },
      onCallEnded: () => {
        console.log('🎤 Test: Voice call ended');
        Alert.alert('Voice Call', 'Voice call ended');
      },
      onUserJoinedCall: (userId) => {
        console.log('🎤 Test: User joined call:', userId);
        Alert.alert('Voice Call', `User ${userId} joined the call`);
      },
      onUserLeftCall: (userId) => {
        console.log('🎤 Test: User left call:', userId);
        Alert.alert('Voice Call', `User ${userId} left the call`);
      },
      onError: (error) => {
        console.error('❌ Test: Voice call error:', error);
        Alert.alert('Voice Call Error', error.message || 'An error occurred during the voice call');
      },
    }, user._id);

    setIsInitialized(true);

    // Update call status periodically
    const statusInterval = setInterval(() => {
      const status = webrtcService.getCallStatus();
      setCallStatus(status);
    }, 1000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [user, sessionRoomId, isInitialized]);

  const handleStartCall = async () => {
    if (!sessionRoomId) {
      Alert.alert('Error', 'No session room available');
      return;
    }
    
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

  if (!sessionRoomId) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No active session</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Call Test</Text>
      <Text style={styles.subtitle}>
        {isHost ? 'Host Mode' : 'Participant Mode'} - Room: {sessionRoomId}
      </Text>
      
      {callStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Call Status: {callStatus.isInCall ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.statusText}>
            Muted: {callStatus.isMuted ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.statusText}>
            Participants: {callStatus.participantCount + 1}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!callStatus?.isInCall ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStartCall}>
            <Ionicons name="call" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isHost ? 'Start Voice Call' : 'Join Voice Call'}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.controlButton, callStatus?.isMuted && styles.mutedButton]} 
              onPress={handleToggleMute}
            >
              <Ionicons name={callStatus?.isMuted ? "mic-off" : "mic"} size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.endButton} onPress={handleEndCall}>
              <Ionicons name="call" size={20} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={styles.instructions}>
        {isHost 
          ? 'As a host, you can start a voice call that others can join.'
          : 'As a participant, you can join the voice call when the host starts it.'
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
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
  endButton: {
    backgroundColor: '#F44336',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
});
