import { Component, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { MockDataProvider } from '../context/MockDataContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import { Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <View style={{ flex: 1, backgroundColor: '#0f0a1e', padding: 24, paddingTop: 60 }}>
          <Text style={{ color: '#f87171', fontSize: 16, fontWeight: '800', marginBottom: 12 }}>Something went wrong</Text>
          <ScrollView>
            <Text style={{ color: '#fca5a5', fontSize: 13, fontFamily: 'monospace' }}>{err.message}</Text>
            <Text style={{ color: '#64748b', fontSize: 11, marginTop: 12 }}>{err.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

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
  useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Inter_500Medium,
    Inter_700Bold,
  });

  return (
    <ErrorBoundary>
      <AuthProvider>
        <MockDataProvider>
          <AuthGuard />
        </MockDataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
