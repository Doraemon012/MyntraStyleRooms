import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import AuthWrapper from '@/components/auth-wrapper';
import { AuthProvider } from '@/contexts/auth-context';
import { RoomProvider } from '@/contexts/room-context';
import { SessionProvider } from '@/contexts/session-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'catalog',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <SessionProvider>
        <RoomProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthWrapper>
              <Stack>
                <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                <Stack.Screen name="auth/register" options={{ headerShown: false }} />
                <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
                <Stack.Screen name="catalog" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="wardrobes" options={{ headerShown: false }} />
                <Stack.Screen name="room/create" options={{ headerShown: false }} />
                <Stack.Screen name="room/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="wardrobe/items" options={{ headerShown: false }} />
                <Stack.Screen name="room/settings" options={{ headerShown: false }} />
                <Stack.Screen name="wardrobe/create" options={{ headerShown: false}} />
                <Stack.Screen name="start-session" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </AuthWrapper>
          </ThemeProvider>
        </RoomProvider>
      </SessionProvider>
    </AuthProvider>
  );
}