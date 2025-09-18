import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/auth-context';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    console.log('🔐 AuthWrapper: Checking auth state...', { 
      isLoading, 
      isAuthenticated, 
      segments: segments[0] 
    });

    if (isLoading) {
      console.log('🔐 AuthWrapper: Still loading auth state...');
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    console.log('🔐 AuthWrapper: Auth check complete', { 
      isAuthenticated, 
      inAuthGroup, 
      currentRoute: segments[0] 
    });

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth screens, redirect to login
      console.log('🔐 AuthWrapper: Redirecting to login - user not authenticated');
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but in auth screens, redirect to main app
      console.log('🔐 AuthWrapper: Redirecting to main app - user authenticated');
      router.replace('/(tabs)');
    } else {
      console.log('🔐 AuthWrapper: No redirect needed', { 
        isAuthenticated, 
        inAuthGroup 
      });
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
