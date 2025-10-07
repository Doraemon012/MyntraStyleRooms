import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/auth-context';
import { useSession } from '../contexts/session-context';
import socketService from '../services/socketService';
import { showToast } from '../utils/toast';

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
  const { startSession, endSession, setPresenter, sessionParticipants, setParticipants, isInSession } = useSession() as any;
  const { user } = useAuth();
  const { roomId, sessionHost } = useLocalSearchParams();

  useEffect(() => {
    // If already in a session, go straight to catalog once
    if (isInSession) {
      router.replace('/catalog');
      return;
    }
    if (!user) {
      console.warn('User not authenticated, cannot join session.');
      router.replace('/auth/login');
      return;
    }

    const roomIdStr = (roomId as string) || '1';
    const hostName = (sessionHost as string) || 'Host';
    
    console.log(`🚀 Joining session in room ${roomIdStr} by ${user.name}`);
    
    // Set presenter name
    setPresenter(hostName);
    
    // Set up socket callbacks for session events
    socketService.updateCallbacks({
      onSessionParticipants: (participants) => {
        console.log('📥 Received session participants in join-screen:', participants);
        if (Array.isArray(participants)) {
          const normalizedRaw = participants.map((p) => {
            const isCurrent = user && p.userId === user._id;
            const displayName = isCurrent ? user.name : (p.userName || p.name);
            const fallbackAvatarName = displayName && typeof displayName === 'string' ? displayName : 'User';
            const avatar = isCurrent
              ? (user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4A90E2&color=FFFFFF&size=150`)
              : (p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackAvatarName)}&background=4A90E2&color=FFFFFF&size=150`);
            return {
              id: p.userId,
              name: displayName,
              avatar,
              isMuted: false,
              currentProduct: p.currentProduct ? {
                id: p.currentProduct.productId,
                name: p.currentProduct.productTitle,
                image: p.currentProduct.productImage,
              } : null,
            };
          });
          // Dedupe by id keeping the first occurrence (prefer backend order)
          const seen = new Set<string>();
          let normalized = normalizedRaw.filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          });

          // Ensure current user is present
          const hasCurrent = normalized.some(p => p.id === user._id);
          if (!hasCurrent) {
            normalized = [
              {
                id: user._id,
                name: user.name,
                avatar: user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
                isMuted: false,
                currentProduct: null,
              },
              ...normalized,
            ];
          }
          console.log('📥 Normalized participants in join-screen:', normalized.map(p => p.name));
          
          // Update participants in existing session
          setParticipants(normalized);
        }
      },
      onSessionStarted: (state) => {
        console.log('📊 Session started in join-screen:', state);
        if (state?.active) {
          console.log('✅ Session is active, user can join');
        }
      }
    });
    
    // Join the room
    socketService.joinRoom(roomIdStr);
    
    // Join the session with user data
    const userData = {
      userId: user._id,
      userName: user.name,
      avatar: user.profileImage || 'https://ui-avatars.com/api/?name=' + user.name
    };
    socketService.joinSession(roomIdStr, userData);
    
    // Join personal room for follow notifications
    socketService.joinUser(user._id);

    // Start session with empty list; server will send participants to avoid duplicates
    startSession(roomIdStr, [], false);
    
    // Show toast
    showToast(`Joined ${hostName}'s session`);
    // Navigate directly to catalog session screen
    router.replace('/catalog');
    
    return () => {
      // Do not leave room or end session here; catalog handles cleanup
    };
  }, [startSession, endSession, setPresenter, roomId, sessionHost, user, isInSession]);

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
