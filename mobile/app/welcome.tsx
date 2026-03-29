import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { PurpleBlob } from './components/PurpleBlob';

export default function WelcomeScreen() {
  const router = useRouter();

  const textOpacity = useSharedValue(0);
  const textY       = useSharedValue(28);
  const btn1Opacity = useSharedValue(0);
  const btn1Y       = useSharedValue(20);
  const btn2Opacity = useSharedValue(0);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));
  const btn1Style = useAnimatedStyle(() => ({
    opacity: btn1Opacity.value,
    transform: [{ translateY: btn1Y.value }],
  }));
  const btn2Style = useAnimatedStyle(() => ({
    opacity: btn2Opacity.value,
  }));

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    textOpacity.value = withDelay(80,  withTiming(1, { duration: 600, easing: ease }));
    textY.value       = withDelay(80,  withTiming(0, { duration: 600, easing: ease }));
    btn1Opacity.value = withDelay(320, withTiming(1, { duration: 500, easing: ease }));
    btn1Y.value       = withDelay(320, withTiming(0, { duration: 500, easing: ease }));
    btn2Opacity.value = withDelay(480, withTiming(1, { duration: 400, easing: ease }));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d1a' }}>
      <StatusBar style="light" backgroundColor="#0d0d1a" />

      <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'flex-end', paddingBottom: 130 }}>

        {/* Tagline — PlayfairDisplay per Figma */}
        <Animated.Text
          style={[
            {
              fontSize: 32,
              fontFamily: 'PlayfairDisplay_700Bold',
              color: '#0d0d1a',
              lineHeight: 42,
              letterSpacing: 0,
              marginBottom: 48,
            },
            textStyle,
          ]}
        >
          Secure every delivery, the smart way.
        </Animated.Text>

        {/* Get Started — Figma: #101828 bg, borderRadius 30, Montserrat 500 24px */}
        <Animated.View style={btn1Style}>
          <TouchableOpacity
            onPress={() => router.push('/signup')}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#101828',
              borderRadius: 30,
              paddingVertical: 18,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{
              color: '#FFFFFF',
              fontFamily: 'Montserrat_500Medium',
              fontSize: 24,
              lineHeight: 29,
            }}>
              Get Started
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Log In — Figma: color #4A5565, Montserrat 600 16px */}
        <Animated.View style={[btn2Style, { alignItems: 'center' }]}>
          <TouchableOpacity
            onPress={() => router.push('/login-form')}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 40, right: 40 }}
          >
            <Text style={{
              color: '#4A5565',
              fontFamily: 'Montserrat_600SemiBold',
              fontSize: 16,
              lineHeight: 20,
            }}>
              Log In
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </View>

      <PurpleBlob />
    </View>
  );
}
