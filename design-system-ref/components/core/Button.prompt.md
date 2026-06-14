Uppercase action button — use exactly one `primary` (glacial-blue) CTA per view; everything else is `secondary` or `ghost`.

```jsx
<Button variant="primary" size="lg" iconRight={<ArrowIcon />}>Ouvrir le terminal</Button>
<Button variant="secondary">Voir les signaux</Button>
<Button variant="ghost" size="sm">Annuler</Button>
```

Variants: `primary` (rare accent CTA), `secondary` (bordered surface, border turns glacial on hover), `ghost` (quiet). Sizes `sm | md | lg`. Pass thin-stroke SVG nodes via `icon` / `iconRight`.
