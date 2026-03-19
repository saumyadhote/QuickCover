import React from 'react';
import { View } from 'react-native';
import Svg, { Text as SvgText, Path, G } from 'react-native-svg';

/**
 * QuickCover wordmark logo.
 * "Quick" in purple (#a855f7), "Cover" in white with a shield replacing the "v".
 * viewBox is 340×80 — wide wordmark, no square padding.
 * The `size` prop controls the rendered height; width scales proportionally.
 */
export function AppLogo({ size = 48 }: { size?: number }) {
  // viewBox aspect ratio: 340 × 80
  const width = (size * 340) / 80;
  const height = size;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 340 80" fill="none">
        {/* "Quick" — purple */}
        <SvgText
          x="0"
          y="62"
          fontSize="68"
          fontWeight="bold"
          fill="#a855f7"
          fontFamily="Georgia, serif"
        >
          Quick
        </SvgText>

        {/* "Co" — white */}
        <SvgText
          x="172"
          y="62"
          fontSize="68"
          fontWeight="bold"
          fill="#ffffff"
          fontFamily="Georgia, serif"
        >
          Co
        </SvgText>

        {/* Shield icon replacing "v" — centered around x=252 */}
        <G transform="translate(238, 10)">
          {/* Shield path: ~28×34px, top center at (14,0) */}
          <Path
            d="M14 0 L28 7 L28 21 C28 30 14 36 14 36 C14 36 0 30 0 21 L0 7 Z"
            fill="#a855f7"
          />
          {/* Checkmark inside shield */}
          <Path
            d="M7 18 L12 24 L22 12"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </G>

        {/* "er" — white, positioned after shield */}
        <SvgText
          x="272"
          y="62"
          fontSize="68"
          fontWeight="bold"
          fill="#ffffff"
          fontFamily="Georgia, serif"
        >
          er
        </SvgText>
      </Svg>
    </View>
  );
}

export default AppLogo;
