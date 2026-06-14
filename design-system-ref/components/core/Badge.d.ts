import * as React from 'react';

export interface BadgeProps {
  children?: React.ReactNode;
  /** Semantic tone — market direction or accent/mute */
  tone?: 'bull' | 'bear' | 'neutral' | 'accent' | 'mute';
  /** Show a glowing leading status dot */
  dot?: boolean;
  style?: React.CSSProperties;
}

/** Small uppercase mono status pill for market state, tags, and live signals. */
export function Badge(props: BadgeProps): React.ReactElement;
