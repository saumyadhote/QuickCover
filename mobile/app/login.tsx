import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

function ScooterIcon({ size = 120 }: { size?: number }) {
  // All coords in 240×240 space. Dark circle r=88 centered at 120,120.
  // Scooter icon is white, contained within the dark circle.
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">

      {/* ── Concentric rings (outermost → innermost, ring 2 dashed) ── */}
      <Circle cx="120" cy="120" r="118" stroke="rgba(124,58,237,0.30)" strokeWidth="1.5" fill="none" />
      <Circle cx="120" cy="120" r="100" stroke="rgba(124,58,237,0.40)" strokeWidth="1.5" fill="none" strokeDasharray="15 8" />
      <Circle cx="120" cy="120" r="82"  stroke="rgba(124,58,237,0.50)" strokeWidth="1.5" fill="none" />
      <Circle cx="120" cy="120" r="64"  stroke="rgba(124,58,237,0.60)" strokeWidth="1.5" fill="none" />

      {/* ── Dark filled center circle ── */}
      <Circle cx="120" cy="120" r="56" fill="#0d0d1a" />

      {/* ── Rider head ── */}
      <Circle cx="120" cy="83" r="11" fill="white" />

      {/* ── Handlebars (horizontal bar across shoulders) ── */}
      <Path d="M100 101 L140 101" stroke="white" strokeWidth="5" strokeLinecap="round" />

      {/* ── Upper body / torso ── */}
      <Path
        d="M106 101 C104 108 103 114 103 120 L137 120 C137 114 136 108 134 101 Z"
        fill="white"
      />

      {/* ── Step-through gap (arch cutout at bottom of body) ── */}
      <Path
        d="M103 120 L103 130 Q103 140 110 143 L130 143 Q137 140 137 130 L137 120 Z"
        fill="white"
      />
      {/* cutout oval */}
      <Path
        d="M112 128 Q112 138 120 139 Q128 138 128 128 Q128 121 120 121 Q112 121 112 128 Z"
        fill="#0d0d1a"
      />

      {/* ── Scooter footboard / platform ── */}
      <Path d="M103 143 L103 148 L137 148 L137 143 Z" fill="white" />

      {/* ── Rear wheel ── */}
      <Circle cx="105" cy="156" r="12" fill="white" />
      <Circle cx="105" cy="156" r="5"  fill="#0d0d1a" />

      {/* ── Front wheel ── */}
      <Circle cx="135" cy="156" r="12" fill="white" />
      <Circle cx="135" cy="156" r="5"  fill="#0d0d1a" />

      {/* ── Shield badge — overlaps bottom-right edge of dark circle ── */}
      {/* Navy backing circle so badge stands out */}
      <Circle cx="162" cy="162" r="20" fill="#0d0d1a" />
      {/* Purple shield */}
      <Path
        d="M162 150 L170 154.5 L170 161 C170 167 162 170 162 170 C162 170 154 167 154 161 L154 154.5 Z"
        fill="#7c3aed"
      />
      {/* White checkmark */}
      <Path
        d="M158 161 L161 164.5 L167 157"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

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
            <Text style={{ fontFamily: 'Georgia', fontWeight: '700', fontSize: 44, color: '#7c3aed', letterSpacing: -0.5 }}>
              Quick
            </Text>
            <Text style={{ fontFamily: 'Georgia', fontWeight: '700', fontSize: 44, color: '#1e1b4b', letterSpacing: -0.5 }}>
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
          <Text style={{ fontFamily: 'Georgia', fontWeight: '700', fontSize: 28, color: '#7c3aed', textAlign: 'center', lineHeight: 36 }}>
            Every delivery.
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontWeight: '700', fontSize: 28, color: '#1e1b4b', textAlign: 'center', lineHeight: 36 }}>
            We've got
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontWeight: '700', fontSize: 28, color: '#1e1b4b', textAlign: 'center', lineHeight: 36, marginBottom: 16 }}>
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
