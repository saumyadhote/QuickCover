import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export function AppLogo({ size = 80 }: { size?: number }) {
  const stroke = '#FFFFFF';
  const fill = 'rgba(99, 102, 241, 0.7)';
  const shieldFill = 'rgba(124, 58, 237, 0.85)';
  const scooterFill = 'rgba(255, 255, 255, 0.9)';

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        overflow: 'hidden',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.35)',
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="120" y2="120">
            <Stop offset="0%" stopColor="#6d28d9" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#0b1227" stopOpacity="0.9" />
          </LinearGradient>
        </Defs>

        {/* Outer ring */}
        <Circle cx="60" cy="60" r="55" fill="url(#grad)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
        <Circle cx="60" cy="60" r="46" fill="rgba(124, 58, 237, 0.32)" />

        {/* Shield / badge */}
        <Path
          d="M60 28 L80 44 L80 70 C80 81 71 90 60 94 C49 90 40 81 40 70 L40 44 Z"
          fill="rgba(255,255,255,0.9)"
          opacity="0.12"
        />
        <Path
          d="M60 32 L78 48 L78 68 C78 78 70 86 60 89 C50 86 42 78 42 68 L42 48 Z"
          fill="#7765F3"
        />
        <Path
          d="M60 38 L74 50 L60 62 L46 50 Z"
          fill="#fff"
          opacity="0.85"
        />

        {/* Shield outline */}
        <Path
          d="M60 28 L80 44 L80 70 C80 81 71 90 60 94 C49 90 40 81 40 70 L40 44 Z"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
          fill="none"
        />
      </Svg>
    </View>
  );
}

export default AppLogo;
