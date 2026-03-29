import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { PurpleBlob } from './components/PurpleBlob';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [deliveryId, setDeliveryId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Entrance animations
  const iconOpacity = useSharedValue(0);
  const iconY       = useSharedValue(-16);
  const cardOpacity = useSharedValue(0);
  const cardY       = useSharedValue(24);
  const btnsOpacity = useSharedValue(0);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ translateY: iconY.value }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));
  const btnsStyle = useAnimatedStyle(() => ({
    opacity: btnsOpacity.value,
  }));

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    iconOpacity.value = withDelay(60,  withTiming(1, { duration: 500, easing: ease }));
    iconY.value       = withDelay(60,  withTiming(0, { duration: 500, easing: ease }));
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 550, easing: ease }));
    cardY.value       = withDelay(200, withTiming(0, { duration: 550, easing: ease }));
    btnsOpacity.value = withDelay(420, withTiming(1, { duration: 450, easing: ease }));
  }, []);

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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Shield icon + heading */}
        <Animated.View style={[{ alignItems: 'center', marginBottom: 32 }, iconStyle]}>
          <ShieldCheck size={48} color="#a855f7" strokeWidth={1.6} style={{ marginBottom: 20 }} />
          <Text
            style={{
              fontSize: 32,
              fontFamily: 'PlayfairDisplay_700Bold',
              color: '#ffffff',
              textAlign: 'center',
              lineHeight: 42,
              letterSpacing: 0,
            }}
          >
            Sign in to your{'\n'}Account
          </Text>
        </Animated.View>

        {/* Form card */}
        <Animated.View
          style={[
            {
              backgroundColor: '#1a1a2e',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(168,85,247,0.15)',
              padding: 20,
              marginBottom: 12,
            },
            cardStyle,
          ]}
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
              marginBottom: 14,
            }}
          >
            <Mail size={17} color="rgba(168,85,247,0.6)" style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, color: '#ffffff', fontSize: 15, paddingVertical: 14 }}
              placeholder="Delivery ID"
              placeholderTextColor="rgba(255,255,255,0.28)"
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
            <Lock size={17} color="rgba(168,85,247,0.6)" style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, color: '#ffffff', fontSize: 15, paddingVertical: 14 }}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.28)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {showPassword
                ? <EyeOff size={17} color="rgba(168,85,247,0.6)" />
                : <Eye    size={17} color="rgba(168,85,247,0.6)" />
              }
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={btnsStyle}>
          {/* Forgot password */}
          <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 6 }}>
            <Text style={{ color: '#8b5cf6', fontSize: 13 }}>Forgot Your Password?</Text>
          </TouchableOpacity>

          {/* Error */}
          {error ? (
            <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 10, marginTop: 6 }}>
              {error}
            </Text>
          ) : null}

          {/* Log In button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#1a1a2e',
              borderRadius: 50,
              paddingVertical: 17,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(168,85,247,0.35)',
              marginTop: 18,
              marginBottom: 24,
            }}
          >
            {loading
              ? <ActivityIndicator color="#a855f7" size="small" />
              : <Text style={{ color: '#ffffff', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16 }}>Log In</Text>
            }
          </TouchableOpacity>

          {/* Sign up link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={{ color: '#a855f7', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14 }}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <PurpleBlob />
    </KeyboardAvoidingView>
  );
}
