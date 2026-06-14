import React from 'react';

/**
 * Le Terminal status / market badge. Sharp corners, mono label, optional
 * leading dot. Semantic tones map to bull/bear/neutral.
 */
export function Badge({
  children,
  tone = 'neutral',
  dot = false,
  style = {},
  ...rest
}) {
  const tones = {
    bull: { color: 'var(--bull)', bg: 'var(--bull-glow)', border: 'rgba(74,222,156,0.4)' },
    bear: { color: 'var(--bear)', bg: 'var(--bear-glow)', border: 'rgba(240,100,122,0.4)' },
    neutral: { color: 'var(--neutral)', bg: 'var(--neutral-glow)', border: 'rgba(232,194,104,0.4)' },
    accent: { color: 'var(--accent-bright)', bg: 'var(--accent-glow-soft)', border: 'var(--accent-glow)' },
    mute: { color: 'var(--text-muted)', bg: 'transparent', border: 'var(--border)' },
  };
  const t = tones[tone] || tones.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: t.color,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 'var(--r-sm)',
        padding: '4px 9px',
        lineHeight: 1,
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '999px',
            background: t.color,
            boxShadow: `0 0 8px ${t.color}`,
          }}
        />
      )}
      {children}
    </span>
  );
}
