import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Small inline shield used between "Co" and "er" in the wordmark
function ShieldIcon({ size = 28 }: { size?: number }) {
  const h = size;
  const w = (size * 22) / 30;
  return (
    <Svg width={w} height={h} viewBox="0 0 22 30" fill="none">
      <Path
        d="M11 0 L22 5.5 L22 16 C22 24 11 29 11 29 C11 29 0 24 0 16 L0 5.5 Z"
        fill="#a855f7"
      />
      <Path
        d="M5 15 L9.5 20 L17 11"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/**
 * QuickCover wordmark.
 * "Quick" purple + "Co" dark + shield icon + "er" dark, all in Georgia.
 * size controls approximate font size (height).
 */
export function AppLogo({ size = 32 }: { size?: number }) {
  const fontSize = size;
  const shieldSize = Math.round(size * 1.1);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize, fontWeight: '800', color: '#a855f7', fontFamily: 'Georgia, serif', lineHeight: fontSize * 1.25 }}>
        Quick
      </Text>
      <Text style={{ fontSize, fontWeight: '800', color: '#1e1b4b', fontFamily: 'Georgia, serif', lineHeight: fontSize * 1.25 }}>
        Co
      </Text>
      <View style={{ marginHorizontal: 1, marginBottom: 2 }}>
        <ShieldIcon size={shieldSize} />
      </View>
      <Text style={{ fontSize, fontWeight: '800', color: '#1e1b4b', fontFamily: 'Georgia, serif', lineHeight: fontSize * 1.25 }}>
        er
      </Text>
    </View>
  );
}

export default AppLogo;
