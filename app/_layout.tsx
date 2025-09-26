import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { SessionProvider } from '@/contexts/session-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Removed unstable_settings to allow proper authentication flow

function AppContent() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Debug logging
  console.log('🔐 Auth State:', { isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="catalog" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="wardrobes" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="room/create" />
          <Stack.Screen name="room/[id]" />
          <Stack.Screen name="wardrobe/ai-outfits" />
          <Stack.Screen name="wardrobe/items" />
          <Stack.Screen name="room/settings" />
          <Stack.Screen name="wardrobe/create" />
          <Stack.Screen name="start-session" />
          <Stack.Screen name="join-session" />
          <Stack.Screen name="call/[id]" />
          <Stack.Screen name="wardrobe/[id]" />
          <Stack.Screen name="maya-demo" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});