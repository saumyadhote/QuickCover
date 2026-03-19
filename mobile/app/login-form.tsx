import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { AppLogo } from './components/AppLogo';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#050714' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo + heading */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ marginBottom: 20 }}>
            <AppLogo size={100} />
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff', textAlign: 'center' }}>Welcome Back</Text>
          <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 10, fontSize: 15, paddingHorizontal: 16 }}>
            Sign in to your QuickCover account.
          </Text>
        </View>

        {/* Form card */}
        <View style={{ backgroundColor: '#1e2538', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(51,65,85,0.6)', padding: 24, marginBottom: 16 }}>

          {/* Email */}
          <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Email</Text>
          <TextInput
            style={{ backgroundColor: 'rgba(30,41,59,0.8)', color: '#ffffff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, fontSize: 15, borderWidth: 1, borderColor: 'rgba(51,65,85,0.5)' }}
            placeholder="you@example.com"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Password</Text>
          <TextInput
            style={{ backgroundColor: 'rgba(30,41,59,0.8)', color: '#ffffff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, fontSize: 15, borderWidth: 1, borderColor: 'rgba(51,65,85,0.5)' }}
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? (
            <Text style={{ color: '#f87171', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</Text>
          ) : null}

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{ borderRadius: 16, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={['#3b82f6', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 17 }}>Log In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#64748b', fontSize: 14 }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={{ color: '#60a5fa', fontWeight: '700', fontSize: 14 }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
