import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as SvgRG, Stop, Ellipse, Circle, Path } from 'react-native-svg';
import { AppLogo } from './components/AppLogo';

function ShieldGlow({ size = 200 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 280 280" fill="none">
      <Circle cx="140" cy="140" r="120" stroke="rgba(192,132,252,0.18)" strokeWidth="1"   fill="none" />
      <Circle cx="140" cy="140" r="102" stroke="rgba(192,132,252,0.26)" strokeWidth="1"   fill="none" />
      <Circle cx="140" cy="140" r="84"  stroke="rgba(192,132,252,0.36)" strokeWidth="1.2" fill="none" />
      <Circle cx="140" cy="140" r="66"  stroke="rgba(192,132,252,0.50)" strokeWidth="1.2" fill="none" strokeDasharray="5 4" />
      <Circle cx="140" cy="140" r="50"  stroke="rgba(192,132,252,0.65)" strokeWidth="1.5" fill="none" />
      <Path d="M140 76 L190 100 L190 146 C190 178 140 198 140 198 C140 198 90 178 90 146 L90 100 Z" fill="#c084fc" opacity="0.18" />
      <Path d="M140 82 L184 104 L184 146 C184 175 140 194 140 194 C140 194 96 175 96 146 L96 104 Z" fill="#a855f7" opacity="0.85" />
      <Path d="M116 140 L133 158 L168 116" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function WelcomeBlobs() {
  const { width } = useWindowDimensions();
  const h = 500;
  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: h, pointerEvents: 'none' }}>
      <Svg width={width} height={h}>
        <Defs>
          <SvgRG id="wb1" cx={width * 0.5} cy={h * 0.72} rx={width * 0.65} ry={h * 0.60} fx={width * 0.5} fy={h * 0.72} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#7c3aed" stopOpacity="1"    />
            <Stop offset="30%"  stopColor="#6d28d9" stopOpacity="0.90" />
            <Stop offset="65%"  stopColor="#4c1d95" stopOpacity="0.60" />
            <Stop offset="100%" stopColor="#1e0038" stopOpacity="0"    />
          </SvgRG>
          <SvgRG id="wb2" cx={width * 0.82} cy={h * 0.40} rx={width * 0.45} ry={h * 0.42} fx={width * 0.82} fy={h * 0.40} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#a855f7" stopOpacity="0.80" />
            <Stop offset="50%"  stopColor="#7c3aed" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#4c1d95" stopOpacity="0"    />
          </SvgRG>
          <SvgRG id="wb3" cx={width * 0.12} cy={h * 0.55} rx={width * 0.38} ry={h * 0.36} fx={width * 0.12} fy={h * 0.55} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#c084fc" stopOpacity="0.65" />
            <Stop offset="60%"  stopColor="#7c3aed" stopOpacity="0.30" />
            <Stop offset="100%" stopColor="#4c1d95" stopOpacity="0"    />
          </SvgRG>
        </Defs>
        <Ellipse cx={width * 0.5}  cy={h * 0.72} rx={width * 0.65} ry={h * 0.60} fill="url(#wb1)" />
        <Ellipse cx={width * 0.82} cy={h * 0.40} rx={width * 0.45} ry={h * 0.42} fill="url(#wb2)" />
        <Ellipse cx={width * 0.12} cy={h * 0.55} rx={width * 0.38} ry={h * 0.36} fill="url(#wb3)" />
      </Svg>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const logoY         = useRef(new Animated.Value(-16)).current;
  const shieldOpacity = useRef(new Animated.Value(0)).current;
  const shieldScale   = useRef(new Animated.Value(0.82)).current;
  const shieldPulse   = useRef(new Animated.Value(1)).current;
  const textOpacity   = useRef(new Animated.Value(0)).current;
  const textY         = useRef(new Animated.Value(22)).current;
  const btn1Opacity   = useRef(new Animated.Value(0)).current;
  const btn1Y         = useRef(new Animated.Value(18)).current;
  const btn2Opacity   = useRef(new Animated.Value(0)).current;
  const btn2Y         = useRef(new Animated.Value(12)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const ease   = Easing.out(Easing.cubic);
    const easeIn = Easing.out(Easing.back(1.08));

    Animated.parallel([
      Animated.timing(logoOpacity,   { toValue: 1, duration: 550, easing: ease,   useNativeDriver: true }),
      Animated.timing(logoY,         { toValue: 0, duration: 550, easing: ease,   useNativeDriver: true }),
      Animated.sequence([Animated.delay(180), Animated.timing(shieldOpacity, { toValue: 1, duration: 500, easing: ease,   useNativeDriver: true })]),
      Animated.sequence([Animated.delay(180), Animated.timing(shieldScale,   { toValue: 1, duration: 600, easing: easeIn, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(360), Animated.timing(textOpacity,   { toValue: 1, duration: 520, easing: ease,   useNativeDriver: true })]),
      Animated.sequence([Animated.delay(360), Animated.timing(textY,         { toValue: 0, duration: 520, easing: ease,   useNativeDriver: true })]),
      Animated.sequence([Animated.delay(540), Animated.timing(btn1Opacity,   { toValue: 1, duration: 440, easing: ease,   useNativeDriver: true })]),
      Animated.sequence([Animated.delay(540), Animated.timing(btn1Y,         { toValue: 0, duration: 440, easing: ease,   useNativeDriver: true })]),
      Animated.sequence([Animated.delay(660), Animated.timing(btn2Opacity,   { toValue: 1, duration: 380, easing: ease,   useNativeDriver: true })]),
      Animated.sequence([Animated.delay(660), Animated.timing(btn2Y,         { toValue: 0, duration: 380, easing: ease,   useNativeDriver: true })]),
    ]).start();

    const t = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shieldPulse, { toValue: 1.04, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(shieldPulse, { toValue: 0.97, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, 900);

    const nav = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => router.replace('/login-form'));
    }, 2000);

    return () => { clearTimeout(t); clearTimeout(nav); };
  }, []);

  return (
    <Animated.View style={{ flex: 1, backgroundColor: '#0d0d1a', opacity: screenOpacity }}>
      <StatusBar style="light" backgroundColor="#0d0d1a" />

      <WelcomeBlobs />

      <LinearGradient
        colors={['rgba(13,13,26,0.55)', 'rgba(13,13,26,0)', 'rgba(13,13,26,0)', 'rgba(13,13,26,0.72)', 'rgba(13,13,26,0.97)']}
        locations={[0, 0.12, 0.45, 0.70, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}
      />

      <Animated.View style={{
        position: 'absolute', top: 58, left: 0, right: 0,
        alignItems: 'center', zIndex: 2,
        opacity: logoOpacity, transform: [{ translateY: logoY }],
      }}>
        <AppLogo size={26} />
      </Animated.View>

      <Animated.View style={[{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: '30%' as any,
        alignItems: 'center', justifyContent: 'center', zIndex: 2,
      }, {
        opacity: shieldOpacity,
        transform: [{ scale: Animated.multiply(shieldScale, shieldPulse) }],
      }]}>
        <ShieldGlow size={220} />
      </Animated.View>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 28, paddingBottom: 52, zIndex: 2,
      }}>
        <Animated.Text style={{
          fontSize: 30,
          fontFamily: 'PlayfairDisplay_700Bold',
          color: '#ffffff',
          lineHeight: 40,
          marginBottom: 40,
          opacity: textOpacity,
          transform: [{ translateY: textY }],
        }}>
          Secure every delivery,{'\n'}the smart way.
        </Animated.Text>

        <Animated.View style={{ marginBottom: 14, opacity: btn1Opacity, transform: [{ translateY: btn1Y }] }}>
          <TouchableOpacity
            onPress={() => router.push('/signup')}
            activeOpacity={0.82}
            style={{ backgroundColor: '#ffffff', borderRadius: 50, paddingVertical: 17, alignItems: 'center' }}
          >
            <Text style={{ color: '#0d0d1a', fontFamily: 'Montserrat_700Bold', fontSize: 16, letterSpacing: 0.2 }}>
              Get Started
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: btn2Opacity, transform: [{ translateY: btn2Y }] }}>
          <TouchableOpacity
            onPress={() => router.push('/login-form')}
            activeOpacity={0.82}
            style={{ backgroundColor: '#7c3aed', borderRadius: 50, paddingVertical: 17, alignItems: 'center' }}
          >
            <Text style={{ color: '#ffffff', fontFamily: 'Montserrat_600SemiBold', fontSize: 16, letterSpacing: 0.2 }}>
              Log In
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
