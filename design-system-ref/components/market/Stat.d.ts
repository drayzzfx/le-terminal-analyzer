import * as React from 'react';

export interface StatProps {
  /** Uppercase mono label (ticker, KPI name) */
  label?: React.ReactNode;
  /** Primary numeric value (pre-formatted string) */
  value: React.ReactNode;
  /** Delta string, e.g. "+2.18%" */
  delta?: React.ReactNode;
  /** Direction drives colour + glyph */
  direction?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

/**
 * Market stat / ticker block with tabular mono numerals and directional delta.
 *
 * @startingPoint section="Market" subtitle="Ticker / KPI with directional delta" viewport="700x150"
 */
export function Stat(props: StatProps): React.ReactElement;
