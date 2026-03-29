import { View, useWindowDimensions } from 'react-native';
import { LinearGradient, RadialGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Ellipse } from 'react-native-svg';

export function PurpleBlob() {
  const { width } = useWindowDimensions();
  const height = 340;

  // Two orbs matching the Figma design:
  // Large orb centered slightly right-of-center
  // Smaller orb peeking from bottom-left
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
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {/* Large main orb — bright purple center fading out */}
          <SvgRadialGradient id="orb1" cx="50%" cy="60%" r="50%" fx="50%" fy="60%">
            <Stop offset="0%"   stopColor="#9333ea" stopOpacity="0.95" />
            <Stop offset="35%"  stopColor="#7c3aed" stopOpacity="0.85" />
            <Stop offset="70%"  stopColor="#5b21b6" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#3b0764" stopOpacity="0" />
          </SvgRadialGradient>

          {/* Smaller secondary orb — bottom-left, slightly lighter */}
          <SvgRadialGradient id="orb2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%"   stopColor="#a855f7" stopOpacity="0.9" />
            <Stop offset="40%"  stopColor="#7c3aed" stopOpacity="0.7" />
            <Stop offset="80%"  stopColor="#4c1d95" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#2e1065" stopOpacity="0" />
          </SvgRadialGradient>
        </Defs>

        {/* Large orb: centered, extends below screen */}
        <Ellipse
          cx={width * 0.5}
          cy={height * 0.72}
          rx={width * 0.62}
          ry={height * 0.68}
          fill="url(#orb1)"
        />

        {/* Smaller orb: bottom-left, partially hidden */}
        <Ellipse
          cx={width * 0.18}
          cy={height * 0.95}
          rx={width * 0.32}
          ry={height * 0.38}
          fill="url(#orb2)"
        />
      </Svg>
    </View>
  );
}
