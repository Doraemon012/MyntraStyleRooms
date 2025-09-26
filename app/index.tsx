import { useAuth } from '@/contexts/auth-context';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🔄 Index redirect - Auth state:', { isAuthenticated, isLoading });

  // Show loading while checking auth status
  if (isLoading) {
    console.log('⏳ Index redirect - Still loading, showing nothing');
    return null; // The loading will be handled by the layout
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    console.log('✅ Index redirect - User authenticated, redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  } else {
    console.log('❌ Index redirect - User not authenticated, redirecting to login');
    return <Redirect href="/auth/login" />;
  }
}
