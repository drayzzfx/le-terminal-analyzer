# Le Terminal — Design System

> **« Cinematic Luxury »** — Une salle des marchés privée dans un hangar de jets, à minuit. Luxe froid, précision absolue, propulsé par l'IA.

Le Terminal est un hub d'outils de trading. Cette bibliothèque encode son identité visuelle : noirs profonds, typographie massive en métal brossé, projecteurs bleu glacial, et un grain de pellicule cinématographique. L'accent bleu est **rare** — réservé aux CTA, liens actifs et lueurs. Aucun emoji ; iconographie SVG trait fin uniquement.

## Sources
- **Logo de référence** : `assets/le-terminal-logo.jpg` (fourni par le client — wordmark « LE TERMINAL » en métal brossé dans un hangar de jets privés, éclairage bleu froid).
- Brief d'art direction « Cinematic Luxury » fourni par le client (palette, typographie, effets WOW).
- **Produit réel** : https://www.leterminal.net (index.html + eco-selection.html). Le contenu de la page d'accueil (5 outils, stratégies, méthode en 4 étapes, communauté Telegram) est repris de ce site, puis **réhabillé** dans la direction « Cinematic Luxury » (zéro emoji → icônes SVG trait fin, métal brossé, bleu glacial).

---

## CONTENT FUNDAMENTALS

**Langue : français.** Tout le copy est en français.

- **Ton** : direct, confiant, feutré. Énergique mais sans esbroufe — on tutoie le trader comme un pair. Luxe discret : on n'empile pas les superlatifs ni les points d'exclamation.
- **Personne** : on s'adresse au lecteur en **tu** (« Ton hub trading », « Analyse tes setups »), voix authentique du produit Le Terminal. La marque parle peu d'elle-même.
- **Casse** : titres display en **CAPITALES** (Anton). Eyebrows et labels en capitales avec interlettrage large. Corps de texte en casse normale.
- **Vocabulaire** : champ lexical de la précision et du calme — « cockpit », « précision froide », « sans le bruit », « salle des marchés privée », « accès sur invitation », « pupitre ». Lexique financier exact (carnet d'ordres, slippage, latence, régimes de marché, exposition).
- **Chiffres** : toujours en chiffres tabulaires mono, format français (espace comme séparateur de milliers : `68 412,50`). Deltas signés et colorés.
- **Emoji** : **jamais.** Icônes SVG trait fin uniquement.
- **Exemples de copy** :
  - Hero : « Ton hub trading, propulsé par l'IA. Analyse tes setups en quelques secondes, tiens ton journal, consulte le calendrier éco et maîtrise ta gestion du risque. »
  - Eyebrow : « Plateforme active · Mis à jour quotidiennement »
  - CTA : « Voir les outils », « Voir la démo », « Accès PRO »
  - Verdict signature : « GO / ATTENDRE / NO-GO »

---

## VISUAL FOUNDATIONS

**Palette** — quatre noirs (`#07090C` void → `#161B24` elevated) forment la profondeur. Un seul accent : le **bleu glacial `#7FB8E8`**, employé avec parcimonie (CTA, liens actifs, lueurs, focus). Sémantique de marché : `#4ADE9C` haussier, `#F0647A` baissier, `#E8C268` neutre. **Pas de violet, pas de néon, pas de dégradés bleu-mauve.**

**Typographie** — trois familles :
- **Anton** (display) : capitales massives, effet métal brossé via `background-clip: text` + `--metal-gradient` (dégradé argenté vertical). Hero en `clamp(3.5rem → 7rem)`.
- **Inter** (texte) : titres 600/700, corps 400, interligne 1.6.
- **JetBrains Mono** (chiffres) : `font-variant-numeric: tabular-nums` partout pour prix, deltas, tickers, stats.

**Arrière-plans** — sombres, jamais blancs. Le motif signature est l'**atmosphère cinématique** : fond `--bg-void`, **vignettage** radial, **grain de pellicule** (noise SVG, opacity 0.04–0.05, `mix-blend: overlay`), **halo froid** descendant comme un projecteur, et **particules de poussière** discrètes dans le faisceau (≤50, désactivées si `prefers-reduced-motion` ou mobile). Pas d'imagerie chaude ; tout est froid, bleuté, à grain.

**Animation** — easing cinématique `--ease-out: cubic-bezier(0.16,1,0.3,1)` (settle lent). Entrée du hero **séquencée** : halo → titre ligne par ligne → CTA. **Reveal au scroll** : fade + `translateY(36px)`, une seule fois (IntersectionObserver, classe `is-in`). **Compteurs animés** sur les stats (easing cubic, déclenchés à l'entrée en viewport). **Spotlight** qui suit la souris sur le hero (desktop). Tout respecte `prefers-reduced-motion`.

**Hover** — les cartes outils : bordure passe au bleu glacial, élévation `translateY(-3/-4px)`, lueur (`box-shadow` accent), et **inclinaison 3D légère ≤3°** suivant la souris. Liens nav : muted → titre. Boutons primaires : éclaircissent vers `--accent-bright` + lift 1px.

**Press / focus** — focus des champs : bordure glacial + anneau doux `0 0 0 3px` accent-soft. Pas d'effet de shrink ; le langage est celui de l'illumination, pas du rebond.

**Bordures** — hairlines : `--border-subtle #1C212A` (diviseurs, repos des cartes), `--border #3A414C` (bordures visibles, champs). Largeur 1px.

**Rayons** — **architecturaux et nets** : `2/4/6/10px`. Le luxe est dans la retenue ; pas de gros arrondis. Pills (`999px`) réservés aux dots de statut.

**Ombres** — froides et profondes : `--shadow-md` (0 8px 24px /.55), `--shadow-lg` (0 24px 64px /.65), `--shadow-glow` (anneau + halo accent au hover).

**Cartes** — surface `--bg-elevated`, bordure hairline au repos, rayon `--r-lg (10px)`, ombre `--shadow-md`. Au survol (interactif) : bordure accent + lift + lueur.

**Transparence / blur** — `backdrop-filter: blur(8px)` sur la nav fixe (avec dégradé de protection vers le haut). Lueurs en `rgba` accent. Grain en blend overlay.

**Layout** — conteneur `1200px` (large `1440px`). Nav fixe en haut avec dégradé de protection. Sections généreusement espacées (`--sp-9 = 96px` verticaux). Espacement sur base 4px.

---

## ICONOGRAPHY

- **Système** : icônes **SVG dessinées au trait fin** (`stroke-width: 1.5`, `stroke: currentColor`, `linecap/linejoin: round`, `fill: none`). Style cohérent type Lucide/Feather mais tracées à la main dans `ui_kits/marketing/Sections.jsx` (signal, radar, éclair, bouclier, graphique, terminal).
- **Pas de librairie d'icônes liée** actuellement. Si une couverture plus large est requise, **Lucide** (CDN) est le substitut recommandé — même graisse de trait, même esprit. À documenter comme substitution le cas échéant.
- **Couleur d'icône** : `--accent` dans les tuiles d'outils (sur fond `--accent-glow-soft`), `currentColor` ailleurs.
- **Glyphes Unicode** utilisés comme micro-indicateurs de marché : `▲ ▼ —` pour la direction, `▟` comme marque brève dans la nav/footer. Dots de statut = `<span>` rond avec lueur.
- **Emoji** : **jamais.**

> ⚠️ **Substitution de polices** : Anton, Inter et JetBrains Mono sont chargées depuis **Google Fonts** (`tokens/fonts.css`), pas depuis des fichiers locaux. Le compilateur ne détecte donc pas de `@font-face` local (0 font signalée — attendu). Si vous voulez des binaires auto-hébergés livrés aux consommateurs, fournissez-moi les fichiers `.woff2` et je remplacerai l'`@import`.

---

## INDEX (manifeste du dépôt)

**Entrée globale**
- `styles.css` — point d'entrée unique (imports seulement). Les consommateurs lient ce fichier.

**Tokens** (`tokens/`)
- `colors.css` — fonds, accent glacial, texte, bordures, sémantique marché, `--metal-gradient`.
- `fonts.css` — `@import` Google Fonts (Anton, Inter, JetBrains Mono).
- `typography.css` — familles, échelle display/texte, interlignes, interlettrage, graisses.
- `spacing.css` — espacement (base 4px), rayons, bordures, ombres, motion, grain, vignette, layout.

**Composants** (`components/`)
- `core/Button` — bouton d'action en capitales (primary glacial rare, secondary, ghost).
- `core/Badge` — pastille de statut mono (bull/bear/neutral/accent/mute).
- `core/Card` — panneau de surface élevé ; bordure s'illumine au survol.
- `core/Input` — champ texte sombre ; focus glacial + anneau.
- `market/Stat` — bloc ticker/KPI, chiffres tabulaires, delta directionnel.

**UI Kits** (`ui_kits/`)
- `marketing/` — page d'accueil Le Terminal (reprise du produit réel, réhabillée Cinematic Luxury) :
  - `Hero.jsx` — hero cinématique (halo, poussière, aurore, spotlight souris, titre métal) + chips features.
  - `Nav.jsx` — navigation (Outils / Stratégies / Méthode / Communauté + Connexion / Accès PRO) + marquee des stratégies.
  - `Tools.jsx` — les 5 outils réels (Setup Analyzer, Journal, Calendrier Éco, Bubble Map, Calculateur de Pips) + stats produit.
  - `Strategies.jsx` — couverture des stratégies + features (Order Blocks & FVG, BOS/CHoCH, Killzones, Verdict GO/ATTENDRE/NO-GO).
  - `Method.jsx` — méthode en 4 étapes + bandeau communauté Telegram + footer.
  - `page.css` — styles + fond atmosphérique animé (grille blueprint, aurore froide qui dérive).
  - **Entrée du hero pilotée CSS, transform-only** : l'état visible est l'état de base, donc les vignettes/print/reduced-motion n'affichent jamais d'écran noir.
  - `Intro.jsx` — séquence d'ouverture cinématique (boot du terminal, sweep métal, volets 3D) jouée une fois par session ; overlay invisible par défaut → jamais de rideau noir sur les vignettes.
  - `LiveTicker` (dans `Nav.jsx`) — bandeau de prix en direct (BTC, ETH, FX, or, indices, actions) avec valeurs qui évoluent en continu.
  - Hero : **parallax 3D à la souris** (titre métal incliné), faisceau de projecteur, shimmer métal continu.

- `app/` — application Le Terminal (recréation des outils, style cinématique en mode app) :
  - `AppShell.jsx` — coquille partagée : sidebar (6 outils + carte PRO) + topbar (fil d'ariane, statut marché, avatar).
  - `SetupAnalyzer.jsx` + `index.html` — outil phare : dépôt de capture (`image-slot`), annotations sur le graphique, jauge de score /100, verdict GO/ATTENDRE/NO-GO, forces, vigilances, niveaux, confluences.
  - `Calculateur.jsx` + `calculateur.html` — calculateur de position **interactif** (capital, risque, paire, sens, entrée/SL/TP → lots, valeur du pip, R:R, validation auto).
  - `journal.html`, `calendrier.html`, `bubble.html`, `eco-selection.html` — pages « Bientôt » (coquille + panneau placeholder) pour que tous les liens du menu résolvent.
  - `app.css` — styles de l'application.

> **Note moteur IA** : aucune mention de « Claude » sur le site (demande client). Le moteur est désigné comme « moteur IA propriétaire ».

**Cartes de spécimens** (`guidelines/`) — fondations visibles dans l'onglet Design System (Colors, Type, Spacing, Brand).

**Skill** — `SKILL.md` (compatible Agent Skills / Claude Code).
