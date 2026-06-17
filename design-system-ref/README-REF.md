# design-system-ref — Référence visuelle « Le Terminal »

Copie de référence du **design system « Cinematic Luxury »** fourni par le client.
Sert de **source de vérité** pour toute création/modification d'interface (voir le bloc
« Design System » de `CLAUDE.md` à la racine).

Ce dossier ne fait **pas** partie du runtime déployé — c'est de la documentation/référence.
Le code de production reste `index.html`, `app.html`, `eco-*.html`, `design-system.css`, `eco.css`, etc.

## Contenu
- `readme.md` — la bible (ton, palette, typographie, animation, layout, iconographie). À lire en premier.
- `SKILL.md` — résumé d'usage du design system.
- `tokens/` — valeurs exactes en CSS custom properties : `colors.css`, `fonts.css`, `typography.css`, `spacing.css`.
- `guidelines/` — fiches spécimen (`*.card.html`).
- `components/` — composants React de référence (Button, Badge, Card, Input, Stat) + extraits HTML.
- `ui_kits/` — kits complets : `app/` (dont `presentation.css`/`presentation.html`, `calendrier`, `journal`…), `marketing/`, `shared/` (chrome/nav).
- `styles.css` — point d'entrée unique qui importe tous les tokens.
- `assets/le-terminal-logo.jpg` — logo de référence (métal brossé).

## Exclu volontairement (poids / non pertinent)
Les exports bundlés (`export/`, `Le Terminal - Accueil.html`), les `uploads/` et les artefacts
de build (`_ds_bundle.js`) ne sont pas inclus. Demander le zip d'origine si besoin.
