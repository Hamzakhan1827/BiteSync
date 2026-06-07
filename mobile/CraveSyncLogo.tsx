import React from 'react';
import Svg, { Rect, Ellipse } from 'react-native-svg';
import { View, Text } from 'react-native';

const ACCENT = '#10b981';
const BG = '#0f172a';

export function CraveSyncMark({
  size = 32,
  accent = ACCENT,
  bgColor = BG,
}: {
  size?: number;
  accent?: string;
  bgColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Rect width="44" height="44" rx="10" fill={bgColor} />
      {/* Left bracket [ */}
      <Rect x="7"    y="9"    width="2.5" height="26"  rx="1.25" fill={accent} />
      <Rect x="7"    y="9"    width="8.5" height="2.5" rx="1.25" fill={accent} />
      <Rect x="7"    y="32.5" width="8.5" height="2.5" rx="1.25" fill={accent} />
      {/* Right bracket ] */}
      <Rect x="34.5" y="9"    width="2.5" height="26"  rx="1.25" fill={accent} />
      <Rect x="28"   y="9"    width="8.5" height="2.5" rx="1.25" fill={accent} />
      <Rect x="28"   y="32.5" width="8.5" height="2.5" rx="1.25" fill={accent} />
      {/* Fork tines */}
      <Rect x="14"   y="12"   width="1.8" height="9"   rx="0.9"  fill="white" />
      <Rect x="17"   y="12"   width="1.8" height="9"   rx="0.9"  fill="white" />
      <Rect x="20"   y="12"   width="1.8" height="9"   rx="0.9"  fill="white" />
      {/* Fork neck */}
      <Rect x="14.5" y="20.5" width="6.8" height="1.5" rx="0.75" fill="white" />
      {/* Fork handle */}
      <Rect x="16.5" y="21.5" width="2.8" height="10"  rx="1.4"  fill="white" />
      {/* Spoon head */}
      <Ellipse cx="28" cy="15.5" rx="2.8" ry="3.5" fill="white" />
      {/* Spoon handle */}
      <Rect x="26.8" y="18.5" width="2.4" height="13"  rx="1.2"  fill="white" />
    </Svg>
  );
}

export function CraveSyncLogo({
  size = 24,
  accent = ACCENT,
  bgColor = BG,
  textColor = '#ffffff',
}: {
  size?: number;
  accent?: string;
  bgColor?: string;
  textColor?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <CraveSyncMark size={Math.round(size * 1.5)} accent={accent} bgColor={bgColor} />
      <Text style={{ fontWeight: '700', fontSize: size, letterSpacing: -0.5, color: textColor }}>
        Crave<Text style={{ color: accent }}>Sync</Text>
      </Text>
    </View>
  );
}

export default CraveSyncLogo;
