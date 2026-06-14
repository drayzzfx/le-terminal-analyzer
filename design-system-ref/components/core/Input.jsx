import React from 'react';

/**
 * Le Terminal text input. Dark field, hairline border that focuses to
 * glacial-blue with a soft ring. Mono font option for tickers / numerals.
 */
export function Input({
  label = null,
  placeholder = '',
  value,
  defaultValue,
  onChange,
  type = 'text',
  mono = false,
  prefix = null,
  disabled = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <span
          style={{
            fontFamily: 'var(--font-text)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: 'var(--ls-caps)',
            color: focus ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color var(--dur-fast) var(--ease-out)',
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-void)',
          border: `1px solid ${focus ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--r-sm)',
          padding: '0 12px',
          boxShadow: focus ? '0 0 0 3px var(--accent-glow-soft)' : 'none',
          transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {prefix && <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{prefix}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-title)',
            fontFamily: mono ? 'var(--font-mono)' : 'var(--font-text)',
            fontSize: '14px',
            fontVariantNumeric: mono ? 'tabular-nums' : 'normal',
            padding: '11px 0',
            ...style,
          }}
          {...rest}
        />
      </div>
    </label>
  );
}
