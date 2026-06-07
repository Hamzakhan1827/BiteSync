import React from 'react';

const ACCENT = '#10b981';
const BG = '#0f172a';

export function CraveSyncMark({ size = 32, accent = ACCENT, bgColor = BG, className, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      role="img"
      aria-label="CraveSync"
      className={className}
      {...rest}
    >
      <rect width="44" height="44" rx="10" fill={bgColor} />
      {/* Left bracket [ */}
      <rect x="7"    y="9"    width="2.5" height="26"  rx="1.25" fill={accent} />
      <rect x="7"    y="9"    width="8.5" height="2.5" rx="1.25" fill={accent} />
      <rect x="7"    y="32.5" width="8.5" height="2.5" rx="1.25" fill={accent} />
      {/* Right bracket ] */}
      <rect x="34.5" y="9"    width="2.5" height="26"  rx="1.25" fill={accent} />
      <rect x="28"   y="9"    width="8.5" height="2.5" rx="1.25" fill={accent} />
      <rect x="28"   y="32.5" width="8.5" height="2.5" rx="1.25" fill={accent} />
      {/* Fork tines */}
      <rect x="14"   y="12"   width="1.8" height="9"   rx="0.9"  fill="white" />
      <rect x="17"   y="12"   width="1.8" height="9"   rx="0.9"  fill="white" />
      <rect x="20"   y="12"   width="1.8" height="9"   rx="0.9"  fill="white" />
      {/* Fork neck */}
      <rect x="14.5" y="20.5" width="6.8" height="1.5" rx="0.75" fill="white" />
      {/* Fork handle */}
      <rect x="16.5" y="21.5" width="2.8" height="10"  rx="1.4"  fill="white" />
      {/* Spoon head */}
      <ellipse cx="28" cy="15.5" rx="2.8" ry="3.5" fill="white" />
      {/* Spoon handle */}
      <rect x="26.8" y="18.5" width="2.4" height="13"  rx="1.2"  fill="white" />
    </svg>
  );
}

export function CraveSyncLogo({ size = 28, accent = ACCENT, bgColor = BG, textColor = '#ffffff', gap = 10, className, ...rest }) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap, lineHeight: 1 }}
      {...rest}
    >
      <CraveSyncMark size={size * 1.4} accent={accent} bgColor={bgColor} />
      <span
        style={{
          fontFamily: 'Inter, "Helvetica Neue", system-ui, -apple-system, sans-serif',
          fontWeight: 700,
          fontSize: size,
          letterSpacing: '-0.02em',
          color: textColor,
        }}
      >
        Crave<span style={{ color: accent }}>Sync</span>
      </span>
    </span>
  );
}

export function CraveSyncWordmark({ height = 32, accent = ACCENT, bgColor = BG, textColor = '#ffffff', className, ...rest }) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, lineHeight: 1 }}
      {...rest}
    >
      <CraveSyncMark size={height} accent={accent} bgColor={bgColor} />
      <span
        style={{
          fontFamily: 'Inter, "Helvetica Neue", system-ui, -apple-system, sans-serif',
          fontWeight: 700,
          fontSize: height * 0.75,
          letterSpacing: '-0.02em',
        }}
      >
        <span style={{ color: textColor }}>Crave</span>
        <span style={{ color: accent }}>Sync</span>
      </span>
    </span>
  );
}

export default CraveSyncLogo;
