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
    // onboarding is post-signup — accessible only when authenticated, not redirected away
    const onOnboarding = segments[0] === 'onboarding';

    if (!user && (inAuthGroup || onOnboarding)) {
      // Not logged in but trying to access the app or onboarding — redirect to login
      router.replace('/login');
    } else if (user && onLoginOrSignup) {
      // If signup just fired, it already navigated to /onboarding — don't override it.
      // Only redirect to tabs when coming from login (not signup).
      if (segments[0] === 'signup') {
        // signup.tsx handles its own navigation to /onboarding — let it.
        return;
      }
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
