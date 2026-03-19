import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown } from 'lucide-react-native';
import { useAuth, RegisterData } from '../context/AuthContext';
import { AppLogo } from './components/AppLogo';

const PLATFORMS = ['Blinkit', 'Swiggy', 'Zomato', 'Zepto', 'Dunzo', 'Other'];

export default function SignupScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [driverId, setDriverId] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('Blinkit');
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !driverId.trim() || !password) {
      setError('Name, email, Driver ID and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data: RegisterData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        driverId: driverId.trim(),
        platform: selectedPlatform.toLowerCase(),
      };
      await register(data);
      router.replace('/onboarding' as any);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#020617]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background ambient glows */}
      <View className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <View className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-purple-600/20 rounded-full blur-[120px]" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="mb-4">
            <AppLogo size={90} />
          </View>
          <Text className="text-2xl font-extrabold text-white text-center">Create Account</Text>
          <Text className="text-slate-400 text-center mt-2 text-sm px-4">
            Enter your details to start your income protection.
          </Text>
        </View>

        {/* Form card */}
        <View style={{ backgroundColor: '#1e2538', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(51,65,85,0.6)', padding: 24 }}>

          {/* Full Name */}
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</Text>
          <TextInput
            className="bg-slate-800/60 text-white rounded-xl px-4 py-3.5 mb-4 text-base border border-slate-700/50"
            placeholder="Arjun Kumar"
            placeholderTextColor="#64748b"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />

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

          {/* Phone */}
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Phone Number</Text>
          <TextInput
            className="bg-slate-800/60 text-white rounded-xl px-4 py-3.5 mb-4 text-base border border-slate-700/50"
            placeholder="+91 98765 43210"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Gig Platform */}
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Gig Platform</Text>
          <TouchableOpacity
            onPress={() => setShowPlatformPicker(!showPlatformPicker)}
            className="bg-slate-800/60 rounded-xl px-4 py-3.5 mb-1 border border-slate-700/50 flex-row justify-between items-center"
          >
            <Text className="text-white text-base">{selectedPlatform}</Text>
            <View style={{ transform: [{ rotate: showPlatformPicker ? '180deg' : '0deg' }] }}>
              <ChevronDown color="#64748b" size={18} />
            </View>
          </TouchableOpacity>

          {showPlatformPicker && (
            <View className="bg-slate-900 rounded-xl border border-slate-700/50 mb-4 overflow-hidden">
              {PLATFORMS.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => { setSelectedPlatform(p); setShowPlatformPicker(false); }}
                  className={`px-4 py-3 ${p !== PLATFORMS[PLATFORMS.length - 1] ? 'border-b border-slate-800' : ''}`}
                >
                  <Text className={`text-base ${selectedPlatform === p ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {!showPlatformPicker && <View className="mb-4" />}

          {/* Driver / Partner ID */}
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Driver / Partner ID</Text>
          <Text className="text-slate-500 text-xs mb-2">Your unique ID from your gig platform partner portal</Text>
          <TextInput
            className="bg-slate-800/60 text-white rounded-xl px-4 py-3.5 mb-4 text-base border border-slate-700/50"
            placeholder="e.g. BLK-2024-78432"
            placeholderTextColor="#64748b"
            autoCapitalize="characters"
            value={driverId}
            onChangeText={setDriverId}
          />

          {/* Password */}
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</Text>
          <TextInput
            className="bg-slate-800/60 text-white rounded-xl px-4 py-3.5 mb-4 text-base border border-slate-700/50"
            placeholder="Min. 8 characters"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Confirm Password */}
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</Text>
          <TextInput
            className="bg-slate-800/60 text-white rounded-xl px-4 py-3.5 mb-4 text-base border border-slate-700/50"
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {/* Error */}
          {error ? (
            <Text className="text-red-400 text-sm mb-4 text-center">{error}</Text>
          ) : null}

          {/* Register button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="w-full bg-blue-600 py-4 rounded-2xl flex-row justify-center items-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white font-bold text-lg tracking-wide">Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-500 text-sm">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text className="text-blue-400 font-bold text-sm">Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
