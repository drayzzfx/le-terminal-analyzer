import * as React from 'react';

export interface InputProps {
  /** Uppercase caption above the field */
  label?: React.ReactNode;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  /** Use mono + tabular figures (tickers, prices, amounts) */
  mono?: boolean;
  /** Leading node (icon, currency glyph) */
  prefix?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/** Dark text field; border focuses to glacial-blue with a soft ring. */
export function Input(props: InputProps): React.ReactElement;
