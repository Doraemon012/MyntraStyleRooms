import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../contexts/session-context';

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

export default function JoinSessionScreen() {
  const { startSession, endSession, setPresenter } = useSession();
  const { roomId, sessionHost } = useLocalSearchParams();

  useEffect(() => {
    // Start session as attendee (not host)
    const roomIdStr = (roomId as string) || '1';
    const hostName = (sessionHost as string) || 'Jasmine';
    
    startSession(roomIdStr, mockSessionParticipants, false);
    setPresenter(hostName);
    
    return () => {
      endSession();
    };
  }, [startSession, endSession, setPresenter, roomId, sessionHost]);

  const handleJoinSession = () => {
    router.push('/catalog');
  };

  const hostName = (sessionHost as string) || 'Host';
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Join Session</Text>
        <Text style={styles.subtitle}>Joining {hostName}'s styling session</Text>
        <Text style={styles.description}>You'll be able to see what {hostName} is browsing and participate in the session.</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleJoinSession}>
          <Text style={styles.buttonText}>Join Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
