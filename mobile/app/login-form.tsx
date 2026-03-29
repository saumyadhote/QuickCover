import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { PurpleBlob } from './components/PurpleBlob';

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [deliveryId, setDeliveryId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!deliveryId.trim() || !password) {
      setError('Please enter your Delivery ID and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(deliveryId.trim().toLowerCase(), password);
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
      style={{ flex: 1, backgroundColor: '#0d0d1a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" backgroundColor="#0d0d1a" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 72, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Shield icon */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <ShieldCheck size={44} color="#a855f7" strokeWidth={1.8} />
        </View>

        {/* Heading */}
        <Text
          style={{
            fontSize: 30,
            fontWeight: '800',
            color: '#ffffff',
            fontFamily: SERIF,
            textAlign: 'center',
            lineHeight: 38,
            marginBottom: 36,
          }}
        >
          Sign in to your{'\n'}Account
        </Text>

        {/* Form card */}
        <View
          style={{
            backgroundColor: '#1a1a2e',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(168,85,247,0.15)',
            padding: 24,
            marginBottom: 14,
          }}
        >
          {/* Delivery ID field */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#12122a',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(168,85,247,0.25)',
              paddingHorizontal: 14,
              marginBottom: 16,
            }}
          >
            <Mail size={18} color="rgba(168,85,247,0.6)" style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, color: '#ffffff', fontSize: 15, paddingVertical: 14 }}
              placeholder="your@email.com"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoCapitalize="none"
              keyboardType="email-address"
              value={deliveryId}
              onChangeText={setDeliveryId}
            />
          </View>

          {/* Password field */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#12122a',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(168,85,247,0.25)',
              paddingHorizontal: 14,
            }}
          >
            <Lock size={18} color="rgba(168,85,247,0.6)" style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, color: '#ffffff', fontSize: 15, paddingVertical: 14 }}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {showPassword
                ? <EyeOff size={18} color="rgba(168,85,247,0.6)" />
                : <Eye size={18} color="rgba(168,85,247,0.6)" />
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot password */}
        <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
          <Text style={{ color: '#7c3aed', fontSize: 13 }}>Forgot Your Password?</Text>
        </TouchableOpacity>

        {/* Error */}
        {error ? (
          <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 12, marginTop: 4 }}>
            {error}
          </Text>
        ) : null}

        {/* Log In button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: '#1a1a2e',
            borderRadius: 50,
            paddingVertical: 17,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(168,85,247,0.3)',
            marginTop: 20,
            marginBottom: 24,
          }}
        >
          {loading
            ? <ActivityIndicator color="#a855f7" size="small" />
            : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 17, fontFamily: SERIF }}>Log In</Text>
          }
        </TouchableOpacity>

        {/* Sign up link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={{ color: '#a855f7', fontWeight: '700', fontSize: 14 }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PurpleBlob />
    </KeyboardAvoidingView>
  );
}
