import * as React from 'react';

export interface ButtonProps {
  children?: React.ReactNode;
  /** primary = rare glacial-blue CTA; secondary = bordered surface; ghost = quiet */
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Thin-stroke SVG icon node placed before the label */
  icon?: React.ReactNode;
  /** Thin-stroke SVG icon node placed after the label */
  iconRight?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

/**
 * Uppercase action button. Use exactly one `primary` per view — the glacial
 * accent must stay rare.
 *
 * @startingPoint section="Core" subtitle="Uppercase action button, glacial CTA" viewport="700x150"
 */
export function Button(props: ButtonProps): React.ReactElement;
