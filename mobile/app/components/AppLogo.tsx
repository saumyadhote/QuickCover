import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// Fixed 120×120 coordinate space.
// Rings fill the full canvas. Badge at bottom-right.
// No background — transparent so it works on any screen color.

export function AppLogo({ size = 80 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">

        {/* Ring 1 — outermost */}
        <Circle cx="60" cy="60" r="56" stroke="rgba(124,58,237,0.85)" strokeWidth="2" fill="none" />

        {/* Ring 2 — dashed (gap effect) */}
        <Circle cx="60" cy="60" r="45" stroke="rgba(124,58,237,0.70)" strokeWidth="2" fill="none"
          strokeDasharray="14 7" />

        {/* Ring 3 */}
        <Circle cx="60" cy="60" r="34" stroke="rgba(124,58,237,0.65)" strokeWidth="2" fill="none" />

        {/* Ring 4 — innermost */}
        <Circle cx="60" cy="60" r="23" stroke="rgba(124,58,237,0.60)" strokeWidth="2" fill="none" />

        {/* Badge — dark navy circle at bottom-right, sitting on ring 2 */}
        <Circle cx="78" cy="78" r="17" fill="#2d1b69" />

        {/* Shield inside badge */}
        <Path
          d="M78 66 L85.5 70.5 L85.5 76.5 C85.5 82.5 78 85.5 78 85.5 C78 85.5 70.5 82.5 70.5 76.5 L70.5 70.5 Z"
          fill="#7c3aed"
        />

        {/* Checkmark */}
        <Path
          d="M74.5 77.5 L77.5 80.5 L82.5 73"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

      </Svg>
    </View>
  );
}

export default AppLogo;
