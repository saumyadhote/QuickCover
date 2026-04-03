import { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Ellipse } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

export function PurpleBlob() {
  const { width } = useWindowDimensions();
  const height = 420;

  // Breathing scale for the main orb
  const scale = useSharedValue(1);
  // Subtle horizontal drift for the accent orb
  const drift = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 3200, easing: Easing.inOut(Easing.sine) }),
        withTiming(0.97, { duration: 3200, easing: Easing.inOut(Easing.sine) }),
      ),
      -1,
      false,
    );
    drift.value = withRepeat(
      withSequence(
        withTiming(18, { duration: 4000, easing: Easing.inOut(Easing.sine) }),
        withTiming(-10, { duration: 4000, easing: Easing.inOut(Easing.sine) }),
      ),
      -1,
      false,
    );
  }, []);

  const orb1Props = useAnimatedProps(() => ({
    rx: width * 0.60 * scale.value,
    ry: height * 0.62 * scale.value,
  }));

  const orb2Props = useAnimatedProps(() => ({
    cx: width * 0.15 + drift.value,
  }));

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height,
        pointerEvents: 'none',
      }}
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

        <AnimatedEllipse
          cx={width * 0.5}
          cy={height * 0.78}
          rx={width * 0.60}
          ry={height * 0.62}
          fill="url(#orb1)"
          animatedProps={orb1Props}
        />

        <AnimatedEllipse
          cx={width * 0.15}
          cy={height * 0.98}
          rx={width * 0.28}
          ry={height * 0.30}
          fill="url(#orb2)"
          animatedProps={orb2Props}
        />
      </Svg>
    </View>
  );
}
