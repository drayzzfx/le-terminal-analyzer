Market stat / ticker block — tabular mono numerals with a directional delta. Use for prices, portfolio KPIs, animated counters.

```jsx
<Stat label="BTC/USD" value="68 412.50" delta="+2.18%" direction="up" />
<Stat label="P&L jour" value="−1 240 €" delta="−0.42%" direction="down" size="lg" />
```

`direction` (`up | down | neutral`) drives the colour (bull/bear/neutral) and glyph. Sizes `sm | md | lg`.
