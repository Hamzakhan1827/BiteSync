import React from 'react';
import Svg, { Rect, Path, G } from 'react-native-svg';
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
      <Rect x="4" y="4" width="88" height="88" rx="22" fill={tileColor} />
      <Path
        fillRule="evenodd"
        d="M42 14h18c9 0 16 6 16 14 0 6-3 11-8 13 6 2 10 7 10 14 0 9-7 17-17 17H42V14Zm8 9v18h11c5 0 9-3 9-9s-4-9-9-9H50Zm0 27v22h13c6 0 10-4 10-11s-4-11-10-11H50Z"
        fill={accent}
      />
      <Path
        d="M55 27c5-1 10 2 10 6 0 3-2 6-5 7"
        stroke={accent}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <G fill={accent}>
        <Rect x="22" y="11" width="2.6" height="13" rx="1.2" />
        <Rect x="28" y="11" width="2.6" height="13" rx="1.2" />
        <Rect x="34" y="11" width="2.6" height="13" rx="1.2" />
        <Path d="M20 24h20v3c0 5-3 9-7 10v33a3 3 0 1 1-6 0V37c-4-1-7-5-7-10v-3Z" />
      </G>
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
        Bite<Text style={{ color: accent }}>Sync</Text>
      </Text>
    </View>
  );
}

export default CraveSyncLogo;
