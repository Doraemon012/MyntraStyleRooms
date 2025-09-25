import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { SessionProvider } from '@/contexts/session-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'catalog',
};

function AppContent() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

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
        <Stack>
          {!isAuthenticated ? (
            // Auth screens
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          ) : (
            // Main app screens
            <Stack.Screen name="catalog" options={{ headerShown: false }} />
          )}
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="invitations" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="wardrobes" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="room/create" options={{ headerShown: false }} />
          <Stack.Screen name="room/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="wardrobe/ai-outfits" options={{ headerShown: false }} />
          <Stack.Screen name="wardrobe/items" options={{ headerShown: false }} />
          <Stack.Screen name="room/settings" options={{ headerShown: false }} />
          <Stack.Screen name="wardrobe/create" options={{ headerShown: false}} />
          <Stack.Screen name="start-session" options={{ headerShown: false }} />
          <Stack.Screen name="join-session" options={{ headerShown: false }} />
          <Stack.Screen name="call/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="maya-demo" options={{ headerShown: false }} />
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