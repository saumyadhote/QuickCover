import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PurpleBlob } from './components/PurpleBlob';

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d1a' }}>
      <StatusBar style="light" backgroundColor="#0d0d1a" />

      {/* Content anchored to lower half */}
      <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'flex-end', paddingBottom: 130 }}>
        <Text
          style={{
            fontSize: 38,
            fontWeight: '800',
            color: '#ffffff',
            fontFamily: SERIF,
            lineHeight: 48,
            marginBottom: 48,
          }}
        >
          Secure every delivery, the smart way.
        </Text>

        {/* Get Started button */}
        <TouchableOpacity
          onPress={() => router.push('/signup')}
          style={{
            backgroundColor: '#1a1a2e',
            borderRadius: 50,
            paddingVertical: 18,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(168,85,247,0.3)',
            marginBottom: 18,
          }}
        >
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 17, fontFamily: SERIF }}>
            Get Started
          </Text>
        </TouchableOpacity>

        {/* Log In link */}
        <TouchableOpacity onPress={() => router.push('/login-form')} style={{ alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>Log In</Text>
        </TouchableOpacity>
      </View>

      <PurpleBlob />
    </View>
  );
}
