import React from 'react';

/**
 * Le Terminal surface card. Elevated dark panel with hairline border that
 * lights glacial-blue on hover, with subtle lift + glow. Set `interactive`
 * for the hover behaviour (tool cards, links).
 */
export function Card({
  children,
  interactive = false,
  glow = false,
  padding = 'var(--sp-5)',
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);

  return (
    <div
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        position: 'relative',
        background: 'var(--bg-elevated)',
        border: `1px solid ${hover ? 'var(--accent)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--r-lg)',
        padding,
        boxShadow: hover
          ? '0 0 0 1px var(--accent-glow), 0 24px 64px rgba(0,0,0,0.6), 0 0 40px var(--accent-glow)'
          : glow
          ? '0 0 30px var(--accent-glow-soft)'
          : 'var(--shadow-md)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
