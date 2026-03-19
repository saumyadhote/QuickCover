import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, G } from 'react-native-svg';

function HeroShield({ size = 200 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 260 260" fill="none">
      {/* Concentric rings */}
      <Circle cx="130" cy="130" r="118" stroke="rgba(168,85,247,0.15)" strokeWidth="1" fill="none" />
      <Circle cx="130" cy="130" r="100" stroke="rgba(168,85,247,0.20)" strokeWidth="1" strokeDasharray="8 6" fill="none" />
      <Circle cx="130" cy="130" r="80"  stroke="rgba(168,85,247,0.25)" strokeWidth="1" fill="none" />
      <Circle cx="130" cy="130" r="60"  stroke="rgba(168,85,247,0.30)" strokeWidth="1" strokeDasharray="6 5" fill="none" />

      {/* Dark circle background for shield */}
      <Circle cx="130" cy="118" r="44" fill="#1e1b4b" />

      {/* Shield body — purple */}
      <Path
        d="M130 86 L154 97 L154 118 C154 134 130 142 130 142 C130 142 106 134 106 118 L106 97 Z"
        fill="#a855f7"
      />

      {/* Delivery person icon inside shield (simplified) */}
      <Circle cx="130" cy="104" r="6" fill="#ffffff" />
      <Path d="M118 122 C118 114 142 114 142 122" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M122 122 L122 130 L138 130 L138 122" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Small verified badge on bottom-right of circle */}
      <Circle cx="163" cy="145" r="11" fill="#a855f7" />
      <Path d="M157 145 L161 149 L169 140" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Three small icon circles below */}
      <Circle cx="90"  cy="172" r="14" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5" />
      <Circle cx="130" cy="172" r="14" fill="#a855f7" />
      <Circle cx="170" cy="172" r="14" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5" />

      {/* Person icon (left circle) */}
      <Circle cx="90" cy="169" r="3" fill="#a855f7" />
      <Path d="M85 177 C85 173 95 173 95 177" stroke="#a855f7" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Lightning icon (center circle — filled) */}
      <Path d="M132 165 L127 173 L131 173 L128 181 L135 172 L131 172 Z" fill="#ffffff" />

      {/* Check icon (right circle) */}
      <Path d="M165 172 L169 176 L175 167" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export default function LandingScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero graphic */}
      <HeroShield size={200} />

      {/* Wordmark */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 12, marginBottom: 20 }}>
        <Text style={{ fontSize: 40, fontWeight: '800', color: '#a855f7', fontFamily: 'Georgia' }}>Quick</Text>
        <Text style={{ fontSize: 40, fontWeight: '800', color: '#1e1b4b', fontFamily: 'Georgia' }}>Cover</Text>
      </View>

      {/* Tagline */}
      <Text style={{ fontSize: 24, fontWeight: '800', color: '#a855f7', textAlign: 'center', lineHeight: 30 }}>
        Every delivery.
      </Text>
      <Text style={{ fontSize: 24, fontWeight: '800', color: '#1e1b4b', textAlign: 'center', lineHeight: 32, marginBottom: 16 }}>
        We've got{'\n'}your back.
      </Text>

      {/* Description */}
      <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 40, paddingHorizontal: 8 }}>
        When heavy rain, curfews, or sudden closures stop deliveries, QuickCover helps support you with simple disruption coverage.
      </Text>

      {/* Log In button */}
      <TouchableOpacity
        onPress={() => router.push('/login')}
        style={{ backgroundColor: '#3b1f8c', borderRadius: 16, paddingVertical: 16, alignItems: 'center', width: '100%', marginBottom: 20 }}
      >
        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 17 }}>Log In</Text>
      </TouchableOpacity>

      {/* Sign Up link */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: '#64748b', fontSize: 14 }}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={{ color: '#a855f7', fontWeight: '700', fontSize: 14 }}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
