import React from 'react';

/**
 * Le Terminal market stat — a ticker / KPI block. Mono tabular numerals,
 * directional colour on the delta, optional glowing dot. Use for prices,
 * portfolio metrics, and animated counters.
 */
export function Stat({
  label,
  value,
  delta = null,
  direction = 'neutral',
  size = 'md',
  style = {},
  ...rest
}) {
  const dirColor = {
    up: 'var(--bull)',
    down: 'var(--bear)',
    neutral: 'var(--neutral)',
  }[direction];

  const glyph = { up: '▲', down: '▼', neutral: '—' }[direction];

  const valueSize = { sm: '20px', md: '30px', lg: '44px' }[size];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontFamily: 'var(--font-mono)',
        ...style,
      }}
      {...rest}
    >
      {label && (
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          fontSize: valueSize,
          lineHeight: 1,
          fontWeight: 500,
          color: 'var(--text-title)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      {delta !== null && (
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: dirColor,
            fontVariantNumeric: 'tabular-nums',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span style={{ fontSize: '9px' }}>{glyph}</span>
          {delta}
        </span>
      )}
    </div>
  );
}
