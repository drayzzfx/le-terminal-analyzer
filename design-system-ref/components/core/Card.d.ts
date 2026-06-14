import * as React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  /** Enable hover lift + glacial border glow (tool cards, links) */
  interactive?: boolean;
  /** Resting soft accent glow */
  glow?: boolean;
  /** CSS padding value */
  padding?: string;
  style?: React.CSSProperties;
}

/**
 * Elevated dark surface panel; hairline border lights glacial-blue on hover.
 *
 * @startingPoint section="Core" subtitle="Elevated dark panel with glacial hover" viewport="700x220"
 */
export function Card(props: CardProps): React.ReactElement;
