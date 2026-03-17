import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { MockDataProvider } from '../context/MockDataContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

function AuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const onLoginOrSignup = segments[0] === 'login' || segments[0] === 'login-form' || segments[0] === 'signup';

    if (!user && inAuthGroup) {
      // Not logged in but trying to access the app — redirect to login
      router.replace('/login');
    } else if (user && onLoginOrSignup) {
      // Already logged in but on auth screen — redirect to app
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <MockDataProvider>
        <AuthGuard />
      </MockDataProvider>
    </AuthProvider>
  );
}
