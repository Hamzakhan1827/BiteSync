import React from 'react';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { View, Text } from 'react-native';

const ACCENT = '#10b981';
const INK = '#0b1220';

export function CraveSyncMark({
  size = 32,
  tileColor = INK,
  accent = ACCENT,
}: {
  size?: number;
  tileColor?: string;
  accent?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      {/* Emerald circle */}
      <Circle cx="48" cy="48" r="44" fill={accent} />
      {/* Inner ring for depth */}
      <Circle cx="48" cy="48" r="34" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
      {/* Fork + spoon handles */}
      <G stroke="#fff" strokeWidth="4" strokeLinecap="round">
        <Line x1="40" y1="32" x2="40" y2="64" />
        <Line x1="56" y1="32" x2="56" y2="64" />
      </G>
      {/* Spoon bowl */}
      <Circle cx="56" cy="34" r="5" fill="#fff" />
    </Svg>
  );
}

export function CraveSyncLogo({
  size = 24,
  accent = ACCENT,
  textColor = '#ffffff',
  tileColor = INK,
}: {
  size?: number;
  accent?: string;
  textColor?: string;
  tileColor?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <CraveSyncMark size={Math.round(size * 1.4)} tileColor={tileColor} accent={accent} />
      <Text style={{ fontWeight: '700', fontSize: size, letterSpacing: -0.5, color: textColor }}>
        Crave<Text style={{ color: accent }}>Sync</Text>
      </Text>
    </View>
  );
}

export default CraveSyncLogo;
