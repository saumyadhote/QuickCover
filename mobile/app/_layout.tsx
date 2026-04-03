import { useEffect } from 'react';
import { View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { MockDataProvider } from '../context/MockDataContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import { Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';

function AuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const onSplash      = segments[0] === undefined || segments.length === 0;
    const onLoginOrSignup = segments[0] === 'login' || segments[0] === 'login-form' || segments[0] === 'signup' || segments[0] === 'welcome';
    const onOnboarding  = segments[0] === 'onboarding';

    // Let the splash screen always play — it handles its own navigation
    if (onSplash) return;

    if (!user && (inAuthGroup || onOnboarding)) {
      router.replace('/login-form');
    } else if (user && onLoginOrSignup) {
      if (segments[0] === 'signup') {
        return;
      }
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Inter_500Medium,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#0d0d1a' }} />;
  }

  return (
    <AuthProvider>
      <MockDataProvider>
        <AuthGuard />
      </MockDataProvider>
    </AuthProvider>
  );
}
