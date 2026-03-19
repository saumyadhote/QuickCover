import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
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
      const msg = err?.response?.data?.error || 'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#050714]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background ambient glows */}
      <View className="absolute top-[-140px] right-[-120px] w-[580px] h-[580px] bg-purple-600/18 rounded-full blur-[140px]" />
      <View className="absolute bottom-[-120px] left-[-120px] w-[560px] h-[560px] bg-slate-900/40 rounded-full blur-[140px]" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo + heading */}
        <View className="items-center mb-10">
          <View className="mb-6">
            <AppLogo size={100} />
          </View>
          <Text className="text-3xl font-extrabold text-white text-center tracking-wide">Welcome Back</Text>
          <Text className="text-slate-400 text-center mt-3 text-base px-4">
            Sign in to your QuickCover account.
          </Text>
        </View>

        {/* Form card */}
        <BlurView intensity={20} tint="dark" className="w-full rounded-3xl overflow-hidden border border-slate-800/60 p-6">
          <LinearGradient colors={['rgba(30, 41, 59, 0.3)', 'rgba(2, 6, 23, 0.5)']} className="absolute inset-0" />

          {/* Email */}
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Email</Text>
          <TextInput
            className="bg-slate-800/60 text-white rounded-xl px-4 py-3.5 mb-4 text-base border border-slate-700/50"
            placeholder="you@example.com"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</Text>
          <TextInput
            className="bg-slate-800/60 text-white rounded-xl px-4 py-3.5 mb-4 text-base border border-slate-700/50"
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Error */}
          {error ? (
            <Text className="text-red-400 text-sm mb-4 text-center">{error}</Text>
          ) : null}

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="w-full rounded-2xl py-4 flex-row justify-center items-center overflow-hidden"
          >
            <LinearGradient
              colors={['#3b82f6', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute inset-0"
            />
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white font-bold text-lg tracking-wide">Log In</Text>
            )}
          </TouchableOpacity>
        </BlurView>

        {/* Sign up link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-500 text-sm">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text className="text-blue-400 font-bold text-sm">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
