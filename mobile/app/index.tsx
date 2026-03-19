import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMockData } from '../context/MockDataContext';
import Svg, { Circle, Path, G } from 'react-native-svg';

// Shield with rings — the large hero graphic
function HeroShield({ size = 220 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 260;

  return (
    <Svg width={size} height={size} viewBox="0 0 260 260" fill="none">
      {/* Concentric rings */}
      <Circle cx="130" cy="130" r="120" stroke="rgba(168,85,247,0.18)" strokeWidth="1.5" fill="none" />
      <Circle cx="130" cy="130" r="100" stroke="rgba(168,85,247,0.22)" strokeWidth="1.5" fill="none" />
      <Circle cx="130" cy="130" r="80"  stroke="rgba(168,85,247,0.28)" strokeWidth="1.5" fill="none" />
      <Circle cx="130" cy="130" r="60"  stroke="rgba(168,85,247,0.35)" strokeWidth="1.5" fill="none" />

      {/* Shield body — purple fill */}
      <Path
        d="M130 62 L178 84 L178 130 C178 158 130 176 130 176 C130 176 82 158 82 130 L82 84 Z"
        fill="#a855f7"
      />
      {/* Shield inner lighter highlight */}
      <Path
        d="M130 72 L170 91 L170 130 C170 153 130 168 130 168 C130 168 90 153 90 130 L90 91 Z"
        fill="#c084fc"
        opacity="0.35"
      />

      {/* Checkmark — dark/black */}
      <Path
        d="M108 128 L124 146 L154 112"
        stroke="#1e1b4b"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Small icons below shield on the ring */}
      {/* Person icon at left */}
      <G transform="translate(46, 154)">
        <Circle cx="10" cy="10" r="10" fill="rgba(168,85,247,0.15)" />
        <Circle cx="10" cy="7" r="3" fill="#a855f7" />
        <Path d="M4 16 C4 12 16 12 16 16" stroke="#a855f7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </G>

      {/* Lightning / zap icon at center */}
      <G transform="translate(120, 154)">
        <Circle cx="10" cy="10" r="10" fill="rgba(168,85,247,0.15)" />
        <Path d="M12 4 L7 11 L11 11 L8 18 L14 10 L10 10 Z" fill="#a855f7" />
      </G>

      {/* Check icon at right */}
      <G transform="translate(194, 154)">
        <Circle cx="10" cy="10" r="10" fill="rgba(168,85,247,0.15)" />
        <Path d="M5 10 L9 14 L15 7" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </G>
    </Svg>
  );
}

// Wordmark: "Quick" purple + "Cover" dark
function WordMark() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 }}>
      <Text style={{ fontSize: 42, fontWeight: '800', color: '#a855f7', fontFamily: 'Georgia' }}>Quick</Text>
      <Text style={{ fontSize: 42, fontWeight: '800', color: '#1e1b4b', fontFamily: 'Georgia' }}>Cover</Text>
    </View>
  );
}

export default function LandingScreen() {
  const router = useRouter();
  const { loading } = useMockData();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>

      {/* Hero shield graphic */}
      <HeroShield size={220} />

      {/* Wordmark */}
      <WordMark />

      {/* Tagline */}
      <Text style={{ fontSize: 26, fontWeight: '800', color: '#a855f7', textAlign: 'left', alignSelf: 'flex-start', lineHeight: 32 }}>
        Every delivery.
      </Text>
      <Text style={{ fontSize: 26, fontWeight: '800', color: '#1e1b4b', textAlign: 'left', alignSelf: 'flex-start', lineHeight: 36, marginBottom: 16 }}>
        We've got{'\n'}your back.
      </Text>

      {/* Description */}
      <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20, textAlign: 'left', alignSelf: 'flex-start', marginBottom: 36 }}>
        When heavy rain, curfews, or sudden closures stop deliveries,{'\n'}
        QuickCover helps support you with simple disruption coverage.
      </Text>

      {/* Log In button */}
      <TouchableOpacity
        onPress={() => router.push('/login')}
        disabled={loading}
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

    </View>
  );
}
