import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { MockDataProvider } from '../context/MockDataContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';

function AuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const onLoginOrSignup = segments[0] === 'login' || segments[0] === 'login-form' || segments[0] === 'signup' || segments[0] === 'welcome' || segments[0] === undefined || segments.length === 0;
    // onboarding is post-signup — accessible only when authenticated, not redirected away
    const onOnboarding = segments[0] === 'onboarding';

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
  });

  // Keep rendering — expo-router handles the splash screen hide automatically
  // Fonts will be available by the time any screen renders

  return (
    <AuthProvider>
      <MockDataProvider>
        <AuthGuard />
      </MockDataProvider>
    </AuthProvider>
  );
}
