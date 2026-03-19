import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
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

  const inputStyle = {
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  } as const;

  const labelStyle = {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 6,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 56, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <AppLogo size={30} />
        </View>

        {/* Heading */}
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#1e1b4b', fontFamily: 'Georgia, serif', marginBottom: 6 }}>
          Welcome Back
        </Text>
        <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>
          Sign in to your QuickCover account.
        </Text>

        {/* Email */}
        <Text style={labelStyle}>Email</Text>
        <TextInput
          style={inputStyle}
          placeholder="you@example.com"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <Text style={labelStyle}>Password</Text>
        <TextInput
          style={{ ...inputStyle, marginBottom: error ? 10 : 24 }}
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? (
          <Text style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</Text>
        ) : null}

        {/* Log In button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{ backgroundColor: '#3b1f8c', borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginBottom: 20 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 17, fontFamily: 'Georgia, serif' }}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* Sign up link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8', fontSize: 14 }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={{ color: '#a855f7', fontWeight: '700', fontSize: 14 }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
