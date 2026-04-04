import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { PurpleBlob } from './components/PurpleBlob';

function MainLogo({ size = 82 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 82 82" fill="none">
      <Circle cx="41" cy="41" r="40" stroke="rgba(123,63,224,0.5)" strokeWidth="1.2" fill="none" />
      <Circle cx="41" cy="41" r="33.4" stroke="rgba(123,63,224,0.6)" strokeWidth="1.2" fill="none" />
      <Circle cx="41" cy="41" r="26.8" stroke="rgba(123,63,224,0.75)" strokeWidth="1.2" fill="none" />
      <Circle cx="41" cy="41" r="20.1" stroke="rgba(123,63,224,0.9)" strokeWidth="1.2" fill="none" />
      <Path d="M41 24 L57 31 L57 45 C57 55 41 61 41 61 C41 61 25 55 25 45 L25 31 Z" fill="#7B3FE0" />
      <Path d="M33 42 L39 49 L52 34" stroke="#F6F0FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [deliveryId, setDeliveryId] = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconY       = useRef(new Animated.Value(-16)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY       = useRef(new Animated.Value(24)).current;
  const btnsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.sequence([Animated.delay(60),  Animated.timing(iconOpacity, { toValue: 1, duration: 500, easing: ease, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(60),  Animated.timing(iconY,       { toValue: 0, duration: 500, easing: ease, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(200), Animated.timing(cardOpacity, { toValue: 1, duration: 550, easing: ease, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(200), Animated.timing(cardY,       { toValue: 0, duration: 550, easing: ease, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(420), Animated.timing(btnsOpacity, { toValue: 1, duration: 450, easing: ease, useNativeDriver: true })]),
    ]).start();
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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ alignItems: 'center', marginBottom: 32, gap: 16, opacity: iconOpacity, transform: [{ translateY: iconY }] }}>
          <MainLogo size={82} />
          <Text style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 32,
            lineHeight: 42,
            letterSpacing: -0.64,
            color: '#EEEEEE',
            textAlign: 'center',
          }}>
            Sign in to your Account
          </Text>
        </Animated.View>

        <Animated.View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          marginBottom: 12,
          overflow: 'hidden',
          opacity: cardOpacity,
          transform: [{ translateY: cardY }],
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 12 }}>
            <Mail size={16} color="#0052B4" strokeWidth={1.3} />
            <TextInput
              style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.14, color: '#6C7278' }}
              placeholder="Email / Delivery ID"
              placeholderTextColor="#6C7278"
              autoCapitalize="none"
              keyboardType="email-address"
              value={deliveryId}
              onChangeText={setDeliveryId}
            />
          </View>

          <View style={{ height: 1, backgroundColor: '#EDF1F3' }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 12 }}>
            <Lock size={16} color="#0052B4" strokeWidth={1.3} />
            <TextInput
              style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.14, color: '#1A1C1E' }}
              placeholder="Password"
              placeholderTextColor="#ACB5BB"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {showPassword
                ? <EyeOff size={16} color="#ACB5BB" strokeWidth={1.3} />
                : <Eye    size={16} color="#ACB5BB" strokeWidth={1.3} />
              }
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: btnsOpacity }}>
          <TouchableOpacity style={{ alignSelf: 'stretch', marginBottom: 24 }}>
            <Text style={{
              fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 17, letterSpacing: -0.12,
              color: '#EEEEEE', textAlign: 'center', textDecorationLine: 'underline',
            }}>
              Forgot Your Password ?
            </Text>
          </TouchableOpacity>

          {error ? (
            <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#101828', borderRadius: 10, paddingVertical: 13,
              paddingHorizontal: 24, alignItems: 'center', borderWidth: 1, borderColor: '#375DFB',
              shadowColor: '#253EA7', shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.48, shadowRadius: 2, elevation: 3, marginBottom: 24,
            }}
          >
            {loading
              ? <ActivityIndicator color="#ffffff" size="small" />
              : <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: 16, lineHeight: 22, letterSpacing: -0.16, color: '#FFFFFF' }}>
                  Log In
                </Text>
            }
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter_500Medium', fontSize: 14 }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={{ color: '#a855f7', fontFamily: 'Montserrat_600SemiBold', fontSize: 14 }}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <PurpleBlob />
    </KeyboardAvoidingView>
  );
}
