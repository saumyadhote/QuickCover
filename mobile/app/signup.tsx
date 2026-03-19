import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { useAuth, RegisterData } from '../context/AuthContext';
import { AppLogo } from './components/AppLogo';

const PLATFORMS = ['Blinkit', 'Swiggy', 'Zomato', 'Zepto', 'Dunzo', 'Other'];

const inputStyle = {
  backgroundColor: 'rgba(30,41,59,0.8)',
  color: '#ffffff',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  marginBottom: 16,
  fontSize: 15,
  borderWidth: 1,
  borderColor: 'rgba(51,65,85,0.5)',
} as const;

const labelStyle = {
  color: '#94a3b8',
  fontSize: 11,
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  marginBottom: 8,
};

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
      const msg = err?.response?.data?.error || err?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#020617' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{ marginBottom: 16 }}>
            <AppLogo size={40} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#ffffff', textAlign: 'center' }}>Create Account</Text>
          <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 8, fontSize: 13, paddingHorizontal: 16 }}>
            Enter your details to start your income protection.
          </Text>
        </View>

        {/* Form card */}
        <View style={{ backgroundColor: '#1e2538', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(51,65,85,0.6)', padding: 24, marginBottom: 24 }}>

          {/* Full Name */}
          <Text style={labelStyle}>Full Name</Text>
          <TextInput style={inputStyle} placeholder="Arjun Kumar" placeholderTextColor="#64748b" autoCapitalize="words" value={name} onChangeText={setName} />

          {/* Email */}
          <Text style={labelStyle}>Email</Text>
          <TextInput style={inputStyle} placeholder="you@example.com" placeholderTextColor="#64748b" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />

          {/* Phone */}
          <Text style={labelStyle}>Phone Number</Text>
          <TextInput style={inputStyle} placeholder="+91 98765 43210" placeholderTextColor="#64748b" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

          {/* Gig Platform */}
          <Text style={labelStyle}>Gig Platform</Text>
          <TouchableOpacity
            onPress={() => setShowPlatformPicker(!showPlatformPicker)}
            style={{ ...inputStyle, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ color: '#ffffff', fontSize: 15 }}>{selectedPlatform}</Text>
            <View style={{ transform: [{ rotate: showPlatformPicker ? '180deg' : '0deg' }] }}>
              <ChevronDown color="#64748b" size={18} />
            </View>
          </TouchableOpacity>

          {showPlatformPicker && (
            <View style={{ backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(51,65,85,0.5)', marginBottom: 16, overflow: 'hidden' }}>
              {PLATFORMS.map((p, i) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => { setSelectedPlatform(p); setShowPlatformPicker(false); }}
                  style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: i < PLATFORMS.length - 1 ? 1 : 0, borderBottomColor: 'rgba(30,41,59,1)' }}
                >
                  <Text style={{ fontSize: 15, color: selectedPlatform === p ? '#60a5fa' : '#cbd5e1', fontWeight: selectedPlatform === p ? '700' : '400' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {!showPlatformPicker && <View style={{ marginBottom: 16 }} />}

          {/* Driver ID */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={labelStyle}>Driver / Partner ID</Text>
            <TouchableOpacity
              onPress={() => {
                const prefix = selectedPlatform.slice(0, 3).toUpperCase();
                const year = new Date().getFullYear();
                const num = Math.floor(10000 + Math.random() * 89999);
                setDriverId(`${prefix}-${year}-${num}`);
              }}
              style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(99,102,241,0.15)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' }}
            >
              <Text style={{ color: '#a5b4fc', fontSize: 11, fontWeight: '600' }}>Auto-generate</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: '#64748b', fontSize: 11, marginBottom: 8 }}>Your unique ID from your gig platform partner portal</Text>
          <TextInput style={inputStyle} placeholder="e.g. BLK-2024-78432" placeholderTextColor="#64748b" autoCapitalize="characters" value={driverId} onChangeText={setDriverId} />

          {/* Password */}
          <Text style={labelStyle}>Password</Text>
          <TextInput style={inputStyle} placeholder="Min. 8 characters" placeholderTextColor="#64748b" secureTextEntry value={password} onChangeText={setPassword} />

          {/* Confirm Password */}
          <Text style={labelStyle}>Confirm Password</Text>
          <TextInput style={{ ...inputStyle, marginBottom: error ? 12 : 16 }} placeholder="••••••••" placeholderTextColor="#64748b" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

          {error ? (
            <Text style={{ color: '#f87171', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</Text>
          ) : null}

          {/* Register button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{ backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 17 }}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#64748b', fontSize: 14 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={{ color: '#60a5fa', fontWeight: '700', fontSize: 14 }}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
