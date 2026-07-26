import React from 'react';

/**
 * Le Terminal primary action control.
 * Glacial-blue accent reserved for the single primary CTA; everything else
 * is ghost or secondary so the accent stays rare.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconRight = null,
  disabled = false,
  type = 'button',
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: '8px 14px', fontSize: '13px', gap: '6px' },
    md: { padding: '12px 22px', fontSize: '14px', gap: '8px' },
    lg: { padding: '16px 30px', fontSize: '16px', gap: '10px' },
  };

  const base = {
    fontFamily: 'var(--font-text)',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    borderRadius: 'var(--r-sm)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    transition: 'all var(--dur-fast) var(--ease-out)',
    opacity: disabled ? 0.45 : 1,
    ...sizes[size],
  };

  const variants = {
    primary: {
      background: 'var(--accent)',
      color: '#04060B',
      boxShadow: '0 0 0 1px var(--accent-glow), 0 8px 28px var(--accent-glow)',
    },
    secondary: {
      background: 'var(--bg-elevated)',
      color: 'var(--text-title)',
      borderColor: 'var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-body)',
      borderColor: 'var(--border-subtle)',
    },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary') {
          e.currentTarget.style.background = 'var(--accent-bright)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        } else if (variant === 'secondary') {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent-bright)';
        } else {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-title)';
        }
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, {
          background: variants[variant].background,
          color: variants[variant].color,
          borderColor: variants[variant].borderColor || 'transparent',
          transform: 'none',
        });
      }}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
