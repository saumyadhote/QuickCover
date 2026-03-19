import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Line } from 'react-native-svg';

// Shield with concentric rings — matches reference design exactly
function HeroGraphic({ size = 240 }: { size?: number }) {
  // All coords in a 280×300 viewBox
  // Shield centered at (140, 140), rings around it, three icon circles at bottom
  return (
    <Svg width={size} height={(size * 300) / 280} viewBox="0 0 280 300" fill="none">

      {/* ── Concentric rings ── */}
      <Circle cx="140" cy="130" r="118" stroke="rgba(168,85,247,0.12)" strokeWidth="1.5" fill="none" />
      <Circle cx="140" cy="130" r="96"  stroke="rgba(168,85,247,0.18)" strokeWidth="1.5" strokeDasharray="8 5" fill="none" />
      <Circle cx="140" cy="130" r="74"  stroke="rgba(168,85,247,0.24)" strokeWidth="1.5" fill="none" />
      <Circle cx="140" cy="130" r="52"  stroke="rgba(168,85,247,0.30)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />

      {/* ── Shield — large, purple outline + fill, no background circle ── */}
      {/* Outer shield (slightly lighter for depth) */}
      <Path
        d="M140 60 L190 84 L190 130 C190 162 140 180 140 180 C140 180 90 162 90 130 L90 84 Z"
        fill="#c084fc"
        opacity="0.25"
      />
      {/* Main shield fill */}
      <Path
        d="M140 66 L184 88 L184 130 C184 159 140 175 140 175 C140 175 96 159 96 130 L96 88 Z"
        fill="#a855f7"
      />

      {/* Checkmark — bold, very dark navy */}
      <Path
        d="M112 128 L130 148 L168 106"
        stroke="#1e1b4b"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── Horizontal line connecting the three small circles ── */}
      <Line x1="60" y1="218" x2="220" y2="218" stroke="rgba(168,85,247,0.3)" strokeWidth="1" />

      {/* ── Three small icon circles ── */}
      {/* Left: person */}
      <Circle cx="60"  cy="218" r="16" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5" />
      <Circle cx="60"  cy="213" r="4"  fill="#a855f7" />
      <Path d="M52 224 C52 219 68 219 68 224" stroke="#a855f7" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Center: lightning — filled purple */}
      <Circle cx="140" cy="218" r="16" fill="#a855f7" />
      <Path d="M143 208 L136 218 L141 218 L137 228 L145 217 L140 217 Z" fill="#ffffff" />

      {/* Right: checkmark */}
      <Circle cx="220" cy="218" r="16" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5" />
      <Path d="M213 218 L218 223 L227 212" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

    </Svg>
  );
}

export default function LandingScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: '#ffffff', paddingHorizontal: 28, paddingTop: 40, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero graphic — centered */}
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <HeroGraphic size={240} />
      </View>

      {/* Wordmark — left aligned, Georgia, large */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
        <Text style={{ fontSize: 44, fontWeight: '800', color: '#a855f7', fontFamily: 'Georgia, serif' }}>Quick</Text>
        <Text style={{ fontSize: 44, fontWeight: '800', color: '#1e1b4b', fontFamily: 'Georgia, serif' }}>Cover</Text>
      </View>

      {/* Tagline — left aligned */}
      <View style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#a855f7', fontFamily: 'Georgia, serif', lineHeight: 36 }}>
          Every{'\n'}delivery.
        </Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#1e1b4b', fontFamily: 'Georgia, serif', lineHeight: 36 }}>
          We've got{'\n'}your back.
        </Text>
      </View>

      {/* Description — left aligned */}
      <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20, marginBottom: 40 }}>
        When heavy rain, curfews, or sudden closures stop deliveries, QuickCover helps support you with simple disruption coverage.
      </Text>

      {/* Log In button */}
      <TouchableOpacity
        onPress={() => router.push('/login-form')}
        style={{ backgroundColor: '#3b1f8c', borderRadius: 14, paddingVertical: 18, alignItems: 'center', width: '100%', marginBottom: 20 }}
      >
        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 17, fontFamily: 'Georgia, serif' }}>Log In</Text>
      </TouchableOpacity>

      {/* Sign Up link */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#94a3b8', fontSize: 14 }}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={{ color: '#a855f7', fontWeight: '700', fontSize: 14 }}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
