import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import Svg, { Circle, Path, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';

function ScooterIcon({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <SvgGrad id="ringGrad" x1="0" y1="0" x2="120" y2="120">
          <Stop offset="0%" stopColor="#ede9fe" />
          <Stop offset="100%" stopColor="#ddd6fe" />
        </SvgGrad>
      </Defs>
      {/* Concentric rings */}
      <Circle cx="60" cy="60" r="58" stroke="#ede9fe" strokeWidth="1.5" fill="none" />
      <Circle cx="60" cy="60" r="48" stroke="#ddd6fe" strokeWidth="1.5" fill="none" />
      <Circle cx="60" cy="60" r="38" stroke="#c4b5fd" strokeWidth="1.5" fill="none" />
      {/* Rider silhouette */}
      <Circle cx="60" cy="28" r="9" fill="#1e1b4b" />
      <Path d="M52 42 Q60 36 68 42 L72 64 L48 64 Z" fill="#1e1b4b" />
      {/* Shield badge */}
      <Path
        d="M68 52 L76 58 L76 68 C76 74 72 79 68 81 C64 79 60 74 60 68 L60 58 Z"
        fill="#7c3aed"
      />
      <Path
        d="M65 64 L67 67 L72 61"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Scooter body */}
      <Path d="M36 72 Q44 66 55 68 L72 68 Q80 68 84 72" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Circle cx="40" cy="78" r="7" fill="#1e1b4b" />
      <Circle cx="80" cy="78" r="7" fill="#1e1b4b" />
      <Circle cx="40" cy="78" r="3" fill="white" />
      <Circle cx="80" cy="78" r="3" fill="white" />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'space-between', paddingTop: 80, paddingBottom: 48 }}>

        {/* Top: Branding */}
        <View style={{ alignItems: 'center' }}>
          {/* Scooter illustration */}
          <View style={{ marginBottom: 28 }}>
            <ScooterIcon size={160} />
          </View>

          {/* App name */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 }}>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 44, color: '#7c3aed', letterSpacing: -0.5 }}>
              Quick
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 44, color: '#1e1b4b', letterSpacing: -0.5 }}>
              Cover
            </Text>
          </View>

          {/* Icon row under name */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#c4b5fd', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, color: '#7c3aed' }}>👤</Text>
            </View>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 12 }}>⚡</Text>
            </View>
            <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#c4b5fd', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, color: '#7c3aed' }}>✓</Text>
            </View>
          </View>

          {/* Tagline */}
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: '#7c3aed', textAlign: 'center', lineHeight: 36 }}>
            Every delivery.
          </Text>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: '#1e1b4b', textAlign: 'center', lineHeight: 36 }}>
            We've got
          </Text>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: '#1e1b4b', textAlign: 'center', lineHeight: 36, marginBottom: 16 }}>
            your back.
          </Text>

          {/* Sub-copy */}
          <Text style={{ color: '#64748b', textAlign: 'center', fontSize: 13, lineHeight: 20, paddingHorizontal: 8 }}>
            When heavy rain, curfews, or sudden closures stop deliveries,
            QuickCover helps support you with simple disruption coverage.
          </Text>
        </View>

        {/* Bottom: CTAs */}
        <View>
          <TouchableOpacity
            onPress={() => router.push('/login-form')}
            style={{
              width: '100%',
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              backgroundColor: '#2d1b69',
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 17 }}>Log In</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={{ color: '#7c3aed', fontWeight: '700', fontSize: 14 }}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
}
