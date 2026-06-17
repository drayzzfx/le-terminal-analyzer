# Handoff — Page d'accueil « Le Terminal »

## Overview
Page d'accueil marketing pour **Le Terminal**, un hub d'outils de trading propulsé par l'IA. Direction artistique « Cinematic Luxury » : salle des marchés privée dans un hangar de jets à minuit — noirs profonds, typographie massive en métal brossé, projecteur bleu glacial, grain de pellicule. L'objectif de la page : présenter les 5 outils, instaurer un climat de luxe froid et de précision, et convertir vers l'accès PRO.

## About the Design Files
Les fichiers de ce paquet sont des **références de design réalisées en HTML/CSS/JSX** — un prototype montrant l'apparence et le comportement voulus, **pas du code de production à copier tel quel**. Le prototype tourne avec React 18 + Babel chargés par CDN et du JSX transpilé dans le navigateur (pratique pour une maquette, à proscrire en production).

La tâche : **recréer ce design dans l'environnement existant de ton site** (Next.js/React, Vue, Astro, Svelte… selon ton stack), avec ses conventions, en convertissant :
- chaque fichier `*.jsx` (chargé via `<script type="text/babel">`) en vrai composant de ton framework ;
- les feuilles de style `*.css` en CSS modules / styled-components / Tailwind selon ton choix — **les tokens CSS (variables) peuvent être repris tels quels** ;
- les composants `Button` / `Badge` (fournis aujourd'hui par `_ds_bundle.js`) par tes propres primitives UI (ou recrée-les, ils sont triviaux — specs plus bas).

Si aucun environnement front n'existe encore, choisis le framework le plus adapté et implémente-y le design.

## Fidelity
**Haute fidélité (hifi).** Couleurs, typographie, espacements, animations et interactions sont définitifs. À recréer au pixel près avec les libs de ton codebase.

## Source files (dans `source/`)
| Fichier | Rôle |
|---|---|
| `marketing/index.html` | Page : ordre des sections + montage React + moteur de scroll (reveal/parallax/progress) |
| `marketing/Hero.jsx` | Hero cinématique (halo, grain, particules, spotlight souris, entrée séquencée) |
| `marketing/Cockpit.jsx` | Panneau « terminal » 3D (tilt souris), mini-graphes |
| `marketing/Tools.jsx` | « Les outils du cockpit » (tableau des départs, sweep + sparklines) + bande de stats + bande graphe live |
| `marketing/LevelUps.jsx` | Bento « Tout ce qui change la donne » (compteurs + mini-visuels animés) |
| `marketing/Screens.jsx` | « Tes outils, au même endroit » : panneaux flottants en perspective 3D |
| `marketing/Showcase.jsx` | « À quoi sert chaque outil » : 5 rangées alternées + visuels custom |
| `marketing/Strategies.jsx` | Section stratégies (Order Blocks, BOS/CHoCH, Killzones…) |
| `marketing/Method.jsx` | Méthode en 4 étapes |
| `marketing/Markets.jsx` | Marquee « Tous les marchés » (tuiles de prix défilantes) |
| `marketing/Pricing.jsx` | Bande tarifs (gratuit + PRO) |
| `marketing/Intro.jsx` | Overlay d'ouverture cinématique (optionnel) |
| `marketing/*.css` | Styles par section (`page.css` = nav-agnostique + hero + board + stats ; puis `markets/levelups/screens/showcase/pricing.css`) |
| `shared/Chrome.jsx` + `chrome.css` | Chrome global : nav fixe + dropdown « Outils » + dock latéral (barre d'onglets sur mobile) |
| `styles.css` + `tokens/*.css` | **Design tokens** (variables CSS) — point d'entrée unique |
| `_ds_bundle.js` | Bundle compilé fournissant `window.LeTerminalDesignSystem_028ecb.{Button,Badge,...}` |
| `assets/le-terminal-logo.jpg` | Logo de référence (métal brossé) |

Un **aperçu hors ligne autonome** (`Le Terminal — Accueil (apercu hors ligne).html`) est à la racine du paquet : ouvre-le dans un navigateur pour voir le rendu cible exact.

---

## Design Tokens (`tokens/`, repris tels quels)
**Couleurs**
- Fonds : `--bg-void #07090C` · `--bg-base #0B0E13` · `--bg-surface #10141B` · `--bg-elevated #161B24`
- Accent glacial (RARE — CTA, liens actifs, lueurs) : `--accent #7FB8E8` · `--accent-deep #5A9BD4` · `--accent-bright #BFDCF5` · `--accent-glow rgba(127,184,232,0.35)` · `--accent-glow-soft rgba(127,184,232,0.12)`
- Texte : `--text-title #F2F4F7` · `--text-body #C3CAD4` · `--text-muted #7E8794`
- Bordures : `--border #3A414C` · `--border-subtle #1C212A`
- Marché : `--bull #4ADE9C` · `--bear #F0647A` · `--neutral #E8C268` (+ variantes `*-glow`)
- Métal brossé (titres) : `--metal-gradient` = `linear-gradient(180deg,#FBFCFE,#C9CFD8,#8A929E,#EEF2F7,#9AA2AE,#6E7682,#B7BEC9)` appliqué en `background-clip:text`

**Typographie** (Google Fonts)
- Display : **Anton**, capitales, `letter-spacing:.01em`, hero `clamp(3.5rem,9vw,7rem)`
- Texte : **Inter** (400/500/600/700), corps `line-height:1.6`
- Chiffres : **JetBrains Mono**, `font-variant-numeric: tabular-nums` partout (prix, deltas, stats)
- Eyebrows/labels : capitales, `letter-spacing:.18em` (`--ls-caps`)

**Espacement** (base 4px) : `--sp-1 4` → `--sp-9 96` → `--sp-10 128`. Conteneurs : `--container 1200px`, `--container-wide 1440px`.
**Rayons** (nets/architecturaux) : `--r-xs 2` · `--r-sm 4` · `--r-md 6` · `--r-lg 10` · `--r-pill 999`.
**Ombres** : `--shadow-md 0 8px 24px /.55` · `--shadow-lg 0 24px 64px /.65` · lueur accent = `0 0 0 1px var(--accent-glow), 0 12px 40px var(--accent-glow)`.
**Motion** : easing cinématique `--ease-out cubic-bezier(0.16,1,0.3,1)` ; durées `--dur-fast 160ms` / `--dur-base 280ms` / `--dur-slow 560ms` / `--dur-reveal 900ms`. Grain `opacity .04`.

---

## Ordre des sections (voir `index.html`)
1. **Chrome** (fixe) : nav `Outils ▾ · Tarifs · Méthode · Communauté` + `FR · Connexion · ACCÈS PRO` ; dock latéral d'outils (→ barre d'onglets en bas sur mobile).
2. **Hero** — eyebrow « PLATEFORME ACTIVE · MIS À JOUR QUOTIDIENNEMENT », titre métal « LE TERMINAL », accroche « Ton hub trading, propulsé par l'IA. », sous-titre, CTA `VOIR LES OUTILS →` + `▷ VOIR LA DÉMO`. 4 chips features.
3. **Tools** « Les outils du cockpit » — 5 rangées (Setup Analyzer / Journal / Calendrier Éco / Bubble Map / Calculateur), faisceau lumineux qui balaie + sparkline ECG par ligne + reflet métal au survol.
4. **Cockpit** — panneau terminal 3D incliné vers la souris (rotateX ~9°).
5. **Stats strip** (cascade).
6. **Markets** « Tous les marchés » — marquee de tuiles de prix (2 rails sens opposés, pause au survol).
7. **Level Ups** « Tout ce qui change la donne » — bento : compteur géant « 30 s » (2×2) + 3 tuiles (87/100, 5, 24/7) + 4 cartes à mini-visuels animés (ondes, orbites, calendrier, bouclier).
8. **Showcase** « À quoi sert chaque outil » — 5 rangées alternées texte/visuel custom.
9. **Screens** « Tes outils, au même endroit » — 3 panneaux flottants en perspective 3D qui surgissent de la profondeur.
10. **Verdict band** (graphe live canvas), **Strategies**, **Method** (4 étapes), **Pricing band**, **Community**, **Footer**.

## Interactions & Behavior
- **Entrée hero séquencée** : halo → titre ligne par ligne → CTA. Si `document.hidden` ou `prefers-reduced-motion` → afficher directement l'état final (jamais d'`opacity:0` figé).
- **Spotlight souris** sur le hero (desktop), **particules de poussière** ≤50 (off mobile/reduced-motion).
- **Scroll engine** (dans `index.html`) : IntersectionObserver ajoute `.is-in` aux `[data-reveal]` / `[data-stagger]` (cascade des enfants) ; hairline de progression ; parallax hero (translateY + fade) et `[data-parallax]`.
- **Hover cartes/outils** : bordure → accent, élévation `translateY(-3/-4px)`, lueur, inclinaison 3D ≤3°.
- **Tout respecte `prefers-reduced-motion`** (animations coupées, états finaux visibles).
- **Responsive** : nav compacte ≤560px (Connexion masqué), dock → barre d'onglets bas ≤760px, bentos et écrans 3D s'empilent.

## Composants à fournir par ton design system
- **Button** — variants `primary` (fond `--accent`, texte `#07090C`, lueur — un seul par vue), `secondary` (fond `--bg-elevated`, bordure `--border` → accent au survol), `ghost` (transparent, bordure `--border-subtle`). Tailles `sm/md/lg`. Capitales, `letter-spacing:.04em`, `border-radius var(--r-sm)`. Accepte `icon` / `iconRight` (SVG trait fin).
- **Badge** — pastille mono capitales, tons `bull/bear/neutral/accent/mute`, `dot` optionnel (point lumineux). `border-radius var(--r-sm)`.

## Assets & icônes
- **Logo** : `assets/le-terminal-logo.jpg` (métal brossé). Remplace par ton SVG vectoriel si dispo.
- **Icônes** : SVG **trait fin** (`stroke-width:1.5`, `currentColor`, `fill:none`) tracées inline dans les `.jsx`. **Aucun emoji.** Glyphes Unicode `▲ ▼ —` comme micro-indicateurs de marché. Substitut CDN conseillé pour étendre : **Lucide**.
- **Polices** : Anton, Inter, JetBrains Mono (Google Fonts). Auto-héberge-les en production.

## Notes
- Le texte est en **français**, registre soutenu mais sec ; titres en CAPITALES ; nombres au format français (espace = séparateur de milliers). Pas de mention d'un fournisseur d'IA tiers — parler de « moteur IA propriétaire ».
- Le prototype transpile le JSX au runtime via Babel : **ne pas expédier ça en prod** — compiler les composants dans ton pipeline.
