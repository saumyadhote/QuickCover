import { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
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

  const opacity = useSharedValue(0);
  const scale   = useSharedValue(0.92);

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
    opacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
    scale.value   = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
  }, []);

  useEffect(() => {
    if (loading || user) return;
    const timer = setTimeout(fadeToWelcome, 2500);
    return () => clearTimeout(timer);
  }, [loading, user]);

  return (
    <View
      style={{ flex: 1, backgroundColor: '#0d0d1a' }}
      onTouchEnd={() => { if (!loading && !user) fadeToWelcome(); }}
    >
      <StatusBar style="light" backgroundColor="#0d0d1a" />

      {/* Shield sits in the top 60% of screen, safely above the blob zone */}
      <Animated.View style={[{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        bottom: '38%',
        alignItems: 'center',
        justifyContent: 'center',
      }, animStyle]}>
        <HeroGraphic size={240} />
      </Animated.View>

      <PurpleBlob />
    </View>
  );
}
