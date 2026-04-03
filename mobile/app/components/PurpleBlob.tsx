import { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Ellipse } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export function PurpleBlob() {
  const { width } = useWindowDimensions();
  const height = 420;

  // Breathing scale for the whole blob layer
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 3200, easing: Easing.inOut(Easing.sine) }),
        withTiming(0.97, { duration: 3200, easing: Easing.inOut(Easing.sine) }),
      ),
      -1,
      false,
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height,
        pointerEvents: 'none',
      }, containerStyle]}
    >
      <Svg width={width} height={height}>
        <Defs>
          <SvgRadialGradient
            id="orb1"
            cx={width * 0.5}
            cy={height * 0.78}
            rx={width * 0.60}
            ry={height * 0.62}
            fx={width * 0.5}
            fy={height * 0.78}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%"   stopColor="#b44dff" stopOpacity="1"    />
            <Stop offset="25%"  stopColor="#9333ea" stopOpacity="0.95" />
            <Stop offset="55%"  stopColor="#7c3aed" stopOpacity="0.75" />
            <Stop offset="80%"  stopColor="#4c1d95" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#1e0038" stopOpacity="0"    />
          </SvgRadialGradient>

          <SvgRadialGradient
            id="orb2"
            cx={width * 0.15}
            cy={height * 0.98}
            rx={width * 0.28}
            ry={height * 0.30}
            fx={width * 0.15}
            fy={height * 0.98}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%"   stopColor="#c084fc" stopOpacity="0.95" />
            <Stop offset="40%"  stopColor="#9333ea" stopOpacity="0.75" />
            <Stop offset="75%"  stopColor="#5b21b6" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#2e1065" stopOpacity="0"    />
          </SvgRadialGradient>
        </Defs>

        <Ellipse
          cx={width * 0.5}
          cy={height * 0.78}
          rx={width * 0.60}
          ry={height * 0.62}
          fill="url(#orb1)"
        />

        <Ellipse
          cx={width * 0.15}
          cy={height * 0.98}
          rx={width * 0.28}
          ry={height * 0.30}
          fill="url(#orb2)"
        />
      </Svg>
    </Animated.View>
  );
}
