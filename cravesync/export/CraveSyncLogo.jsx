// CraveSyncLogo.jsx — drop-in React component for the CraveSync mark + wordmark.
// No deps. Tailwind-friendly. SSR-safe. Backgrounds are transparent.
// Mark: "Emblem badge" — emerald circle, inner white ring, fork + spoon in white.
//
// Usage:
//   import { CraveSyncLogo, CraveSyncMark, CraveSyncWordmark } from './CraveSyncLogo';
//   <CraveSyncLogo />                            // mark + "CraveSync" text
//   <CraveSyncMark size={32} />                  // icon only (favicon, app icon)
//   <CraveSyncWordmark className="h-6 w-auto" /> // pure-SVG horizontal wordmark

import React from 'react';

const ACCENT = '#10b981';
const INK = '#0b1220';

export function CraveSyncMark({ size = 32, tileColor = INK, accent = ACCENT, className, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      role="img"
      aria-label="CraveSync"
      className={className}
      {...rest}
    >
      <circle cx="48" cy="48" r="44" fill={accent} />
      <circle cx="48" cy="48" r="34" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
      <g stroke="#fff" strokeWidth="4" strokeLinecap="round">
        <line x1="40" y1="32" x2="40" y2="64" />
        <line x1="56" y1="32" x2="56" y2="64" />
      </g>
      <circle cx="56" cy="34" r="5" fill="#fff" />
    </svg>
  );
}

export function CraveSyncLogo({ size = 28, accent = ACCENT, textColor = '#ffffff', tileColor = INK, gap = 10, className, ...rest }) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap, lineHeight: 1 }}
      {...rest}
    >
      <CraveSyncMark size={size * 1.4} tileColor={tileColor} accent={accent} />
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

export function CraveSyncWordmark({ height = 32, accent = ACCENT, textColor = '#ffffff', className, ...rest }) {
  return (
    <svg
      viewBox="0 0 320 64"
      height={height}
      fill="none"
      role="img"
      aria-label="CraveSync"
      className={className}
      {...rest}
    >
      <g transform="scale(0.667)">
        <circle cx="48" cy="48" r="44" fill={accent} />
        <circle cx="48" cy="48" r="34" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
        <g stroke="#fff" strokeWidth="4" strokeLinecap="round">
          <line x1="40" y1="32" x2="40" y2="64" />
          <line x1="56" y1="32" x2="56" y2="64" />
        </g>
        <circle cx="56" cy="34" r="5" fill="#fff" />
      </g>
      <text x="76" y="46" fontFamily='Inter, "Helvetica Neue", system-ui, sans-serif' fontWeight="700" fontSize="44" letterSpacing="-1.2" fill={textColor}>Crave</text>
      <text x="216" y="46" fontFamily='Inter, "Helvetica Neue", system-ui, sans-serif' fontWeight="700" fontSize="44" letterSpacing="-1.2" fill={accent}>Sync</text>
    </svg>
  );
}

export default CraveSyncLogo;
