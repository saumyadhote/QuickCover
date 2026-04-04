import { useEffect, useCallback, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { PurpleBlob } from './components/PurpleBlob';

function HeroGraphic({ size = 260 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 280 280" fill="none">
      <Circle cx="140" cy="140" r="128" stroke="rgba(168,85,247,0.20)" strokeWidth="1"   fill="none" />
      <Circle cx="140" cy="140" r="110" stroke="rgba(168,85,247,0.30)" strokeWidth="1"   fill="none" />
      <Circle cx="140" cy="140" r="92"  stroke="rgba(168,85,247,0.42)" strokeWidth="1.2" fill="none" />
      <Circle cx="140" cy="140" r="74"  stroke="rgba(168,85,247,0.55)" strokeWidth="1.2" fill="none" strokeDasharray="6 4" />
      <Circle cx="140" cy="140" r="56"  stroke="rgba(168,85,247,0.70)" strokeWidth="1.5" fill="none" />
      <Path d="M140 72 L194 98 L194 146 C194 180 140 200 140 200 C140 200 86 180 86 146 L86 98 Z" fill="#c084fc" opacity="0.22" />
      <Path d="M140 78 L188 102 L188 146 C188 177 140 196 140 196 C140 196 92 177 92 146 L92 102 Z" fill="#a855f7" />
      <Path d="M114 140 L133 160 L170 114" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.80)).current;
  const pulse      = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale   = useRef(new Animated.Value(0.7)).current;
  const pulseLoop  = useRef<Animated.CompositeAnimation | null>(null);

  const fadeToWelcome = useCallback(() => {
    pulseLoop.current?.stop();
    Animated.parallel([
      Animated.timing(opacity,     { toValue: 0,    duration: 480, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(scale,       { toValue: 1.10, duration: 480, useNativeDriver: true }),
      Animated.timing(ringOpacity, { toValue: 0,    duration: 300, useNativeDriver: true }),
    ]).start(() => router.replace('/welcome' as any));
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 750, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(scale,   { toValue: 1, duration: 750, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(ringOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(ringScale, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    const t = setTimeout(() => {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.04, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.98, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    }, 900);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading || user) return;
    const timer = setTimeout(fadeToWelcome, 2600);
    return () => clearTimeout(timer);
  }, [loading, user]);

  return (
    <View
      style={{ flex: 1, backgroundColor: '#0d0d1a' }}
      onTouchEnd={() => { if (!loading && !user) fadeToWelcome(); }}
    >
      <StatusBar style="light" backgroundColor="#0d0d1a" />

      <Animated.View style={[{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        bottom: '38%',
        alignItems: 'center',
        justifyContent: 'center',
      } as any, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}>
        <Svg width={320} height={320} viewBox="0 0 320 320" fill="none">
          <Circle cx="160" cy="160" r="148" stroke="rgba(168,85,247,0.10)" strokeWidth="1" fill="none" />
          <Circle cx="160" cy="160" r="130" stroke="rgba(168,85,247,0.15)" strokeWidth="1" fill="none" />
        </Svg>
      </Animated.View>

      <Animated.View style={[{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        bottom: '38%',
        alignItems: 'center',
        justifyContent: 'center',
      } as any, { opacity, transform: [{ scale: Animated.multiply(scale, pulse) }] }]}>
        <HeroGraphic size={240} />
      </Animated.View>

      <PurpleBlob />
    </View>
  );
}
