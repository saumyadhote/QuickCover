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

  // Staggered entrance animations
  const textOpacity  = useSharedValue(0);
  const textY        = useSharedValue(28);
  const btn1Opacity  = useSharedValue(0);
  const btn1Y        = useSharedValue(20);
  const btn2Opacity  = useSharedValue(0);

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
    textOpacity.value  = withDelay(80,  withTiming(1,   { duration: 600, easing: ease }));
    textY.value        = withDelay(80,  withTiming(0,   { duration: 600, easing: ease }));
    btn1Opacity.value  = withDelay(320, withTiming(1,   { duration: 500, easing: ease }));
    btn1Y.value        = withDelay(320, withTiming(0,   { duration: 500, easing: ease }));
    btn2Opacity.value  = withDelay(480, withTiming(1,   { duration: 400, easing: ease }));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d1a' }}>
      <StatusBar style="light" backgroundColor="#0d0d1a" />

      <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'flex-end', paddingBottom: 130 }}>

        <Animated.Text
          style={[
            {
              fontSize: 32,
              fontFamily: 'PlayfairDisplay_700Bold',
              color: '#ffffff',
              lineHeight: 42,
              letterSpacing: 0,
              marginBottom: 48,
            },
            textStyle,
          ]}
        >
          Secure every delivery, the smart way.
        </Animated.Text>

        {/* Get Started */}
        <Animated.View style={btn1Style}>
          <TouchableOpacity
            onPress={() => router.push('/signup')}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#1a1a2e',
              borderRadius: 50,
              paddingVertical: 18,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(168,85,247,0.35)',
              marginBottom: 18,
            }}
          >
            <Text style={{ color: '#ffffff', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16 }}>
              Get Started
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Log In */}
        <Animated.View style={[btn2Style, { alignItems: 'center' }]}>
          <TouchableOpacity onPress={() => router.push('/login-form')} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 40, right: 40 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15 }}>
              Log In
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </View>

      <PurpleBlob />
    </View>
  );
}
