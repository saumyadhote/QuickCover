import { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { PurpleBlob } from './components/PurpleBlob';

function HeroGraphic({ size = 240 }: { size?: number }) {
  return (
    <Svg width={size} height={(size * 300) / 280} viewBox="0 0 280 300" fill="none">
      <Circle cx="140" cy="130" r="118" stroke="rgba(168,85,247,0.18)" strokeWidth="1.5" fill="none" />
      <Circle cx="140" cy="130" r="96"  stroke="rgba(168,85,247,0.25)" strokeWidth="1.5" strokeDasharray="8 5" fill="none" />
      <Circle cx="140" cy="130" r="74"  stroke="rgba(168,85,247,0.32)" strokeWidth="1.5" fill="none" />
      <Circle cx="140" cy="130" r="52"  stroke="rgba(168,85,247,0.40)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
      <Path d="M140 60 L190 84 L190 130 C190 162 140 180 140 180 C140 180 90 162 90 130 L90 84 Z" fill="#c084fc" opacity="0.25" />
      <Path d="M140 66 L184 88 L184 130 C184 159 140 175 140 175 C140 175 96 159 96 130 L96 88 Z" fill="#a855f7" />
      <Path d="M112 128 L130 148 L168 106" stroke="#ffffff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Line x1="60" y1="218" x2="220" y2="218" stroke="rgba(168,85,247,0.3)" strokeWidth="1" />
      <Circle cx="60"  cy="218" r="16" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" />
      <Circle cx="60"  cy="213" r="4"  fill="#a855f7" />
      <Path d="M52 224 C52 219 68 219 68 224" stroke="#a855f7" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Circle cx="140" cy="218" r="16" fill="#a855f7" />
      <Path d="M143 208 L136 218 L141 218 L137 228 L145 217 L140 217 Z" fill="#ffffff" />
      <Circle cx="220" cy="218" r="16" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" />
      <Path d="M213 218 L218 223 L227 212" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const fadeToWelcome = useCallback(() => {
    opacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }, (done) => {
      if (done) runOnJS(router.replace)('/welcome' as any);
    });
    scale.value = withTiming(1.06, { duration: 500 });
  }, []);

  useEffect(() => {
    // Fade in on mount
    opacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
    scale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
  }, []);

  useEffect(() => {
    if (loading || user) return;
    const timer = setTimeout(fadeToWelcome, 2500);
    return () => clearTimeout(timer);
  }, [loading, user]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d1a' }} onTouchEnd={() => { if (!loading && !user) fadeToWelcome(); }}>
      <StatusBar style="light" backgroundColor="#0d0d1a" />
      <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, animStyle]}>
        <HeroGraphic size={220} />
      </Animated.View>
      <PurpleBlob />
    </View>
  );
}
