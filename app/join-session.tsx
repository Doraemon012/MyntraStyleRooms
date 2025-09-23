import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../contexts/session-context';

const mockSessionParticipants = [
  {
    id: '1',
    name: 'You',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isMuted: false,
    currentProduct: null
  },
  {
    id: '2',
    name: 'Chinku',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isMuted: true,
    currentProduct: {
      id: '1',
      name: 'Red Silk Saree',
      image: 'https://images.unsplash.com/photo-1677002419193-9a74069587af?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  },
  {
    id: '3',
    name: 'Minku',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isMuted: false,
    currentProduct: {
      id: '2',
      name: 'Blue Kurta',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop'
    }
  },
  {
    id: '4',
    name: 'Tinku',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    isMuted: false,
    currentProduct: null
  },
  {
    id: '5',
    name: 'Poha',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    isMuted: true,
    currentProduct: null
  },
  {
    id: '6',
    name: 'Juhi',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
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
