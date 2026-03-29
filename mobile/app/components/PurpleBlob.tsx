import { View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Ellipse } from 'react-native-svg';

export function PurpleBlob() {
  const { width } = useWindowDimensions();
  const height = 380;

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
          {/* Large central orb */}
          <SvgRadialGradient id="orb1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%"   stopColor="#b44dff" stopOpacity="1"    />
            <Stop offset="25%"  stopColor="#9333ea" stopOpacity="0.95" />
            <Stop offset="55%"  stopColor="#7c3aed" stopOpacity="0.75" />
            <Stop offset="80%"  stopColor="#4c1d95" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#1e0038" stopOpacity="0"    />
          </SvgRadialGradient>

          {/* Smaller left orb */}
          <SvgRadialGradient id="orb2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%"   stopColor="#c084fc" stopOpacity="0.95" />
            <Stop offset="40%"  stopColor="#9333ea" stopOpacity="0.75" />
            <Stop offset="75%"  stopColor="#5b21b6" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#2e1065" stopOpacity="0"    />
          </SvgRadialGradient>
        </Defs>

        {/* Large orb — centered horizontally, sits at bottom, top ~40% up */}
        <Ellipse
          cx={width * 0.5}
          cy={height * 0.78}
          rx={width * 0.58}
          ry={height * 0.60}
          fill="url(#orb1)"
        />

        {/* Smaller orb — bottom-left, partially cropped */}
        <Ellipse
          cx={width * 0.14}
          cy={height * 0.98}
          rx={width * 0.28}
          ry={height * 0.30}
          fill="url(#orb2)"
        />
      </Svg>
    </View>
  );
}
