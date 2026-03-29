import { View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Ellipse } from 'react-native-svg';

export function PurpleBlob() {
  const { width } = useWindowDimensions();
  // Use a fixed logical width for the viewBox so orbs stay centred regardless of device
  const vw = 400;
  const vh = 380;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: vh,
        pointerEvents: 'none',
      }}
    >
      {/* preserveAspectRatio="none" + width/height 100% fills the container exactly */}
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${vw} ${vh}`}
        preserveAspectRatio="none"
      >
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

        {/* Large orb — centred at 50% of vw, raised so top edge is ~40% up the blob */}
        <Ellipse
          cx={vw * 0.5}
          cy={vh * 0.78}
          rx={vw * 0.60}
          ry={vh * 0.62}
          fill="url(#orb1)"
        />

        {/* Smaller orb — bottom-left corner, partially cropped */}
        <Ellipse
          cx={vw * 0.14}
          cy={vh * 0.98}
          rx={vw * 0.26}
          ry={vh * 0.28}
          fill="url(#orb2)"
        />
      </Svg>
    </View>
  );
}
