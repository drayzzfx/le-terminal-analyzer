# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design System — « Cinematic Luxury » (À SUIVRE pour tout travail UI)

Toute création/modification d'interface DOIT respecter le design system « Cinematic Luxury » du client.
La référence complète (tokens, guidelines, composants, UI kits) est versionnée dans **`design-system-ref/`** :
- `design-system-ref/readme.md` — la bible (ton, palette, typo, animation, layout). **À lire avant tout travail UI.**
- `design-system-ref/tokens/` — valeurs exactes (`colors.css`, `fonts.css`, `typography.css`, `spacing.css`).
- `design-system-ref/guidelines/` — fiches spécimen (couleurs, type, espacement, marque).
- `design-system-ref/components/` & `design-system-ref/ui_kits/` — composants React + kits HTML/CSS de référence (dont `ui_kits/app/presentation.css` pour la page Présentation éco).

**Essentiel à respecter :**
- **Esthétique** : salle des marchés privée, à minuit, dans un hangar de jets. Froid, précis, retenu.
- **Palette** : 4 noirs (`#07090C` → `#161B24`) ; **un seul** accent bleu glacial `#7FB8E8`, employé avec parcimonie (CTA, liens, lueurs). Sémantique marché : haussier `#4ADE9C`, baissier `#F0647A`, neutre `#E8C268`. **Pas de violet, pas de néon, pas de dégradé bleu-mauve.**
- **Typo** : Anton (display, CAPITALES massives, métal brossé via `background-clip:text`), Inter (texte), JetBrains Mono (TOUS les chiffres, tabulaires). Titres display en CAPITALES ; eyebrows/labels en capitales interlettrées.
- **Icônes** : SVG trait fin (`stroke-width:1.5`, `fill:none`) uniquement. **JAMAIS d'emoji.**
- **Copy** : français, ton direct/feutré, on **vouvoie** le client (« vous », jamais « tu ») — partout et à chaque fois, y compris pour toute nouvelle page/texte. Chiffres format français (`68 412,50`).
- **Rayons nets** (2/4/6/10px), bordures hairline 1px, ombres froides, conteneur 1200px, base d'espacement 4px.
- **Animation** : ease-out cinématique `cubic-bezier(0.16,1,0.3,1)`, reveals au scroll une seule fois, toujours honorer `prefers-reduced-motion`.

NB : le code de production utilise `design-system.css` + `eco.css` (noms de variables historiques `--v`, `--card`, `--display`…). `design-system-ref/` est la **source de vérité visuelle** : en cas de divergence, s'aligner sur le design system.

### RÈGLE PERMANENTE (obligatoire, sans rappel de l'utilisateur)
Pour **toute page existante** ET **toute nouvelle page/écran**, présente ou future, se baser **par défaut** sur ce design system — l'utilisateur n'a pas à le redemander. Concrètement :
- **Avant** de créer/modifier une page : lire `design-system-ref/readme.md` + les tokens, et réutiliser les variables CSS existantes (`design-system.css` / `eco.css`).
- **Polices** : uniquement Anton (titres display, CAPITALES) / Inter (UI, corps) / JetBrains Mono (chiffres). **Bannir `Bricolage Grotesque`** et toute autre police.
- **Couleurs** : uniquement la palette ci-dessus (4 noirs + accent `#7FB8E8`/`#5A9BD4`/`#BFDCF5` + sémantiques `#4ADE9C`/`#F0647A`/`#E8C268` + gris steel). **Aucun hex hors-palette** (pas de bleu vif, violet, orange, vert/rouge approximatifs). Seule exception tolérée : un logo de marque tierce (ex. « G » Google).
- **Zéro emoji** : remplacer par une icône SVG trait fin (`viewBox 0 0 24 24`, `fill:none`, `stroke:currentColor`). Glyphes tolérés : `→ ← ↗ ★ ✓ ✕ ▲ ▼ —`.
- **Ne jamais casser le fonctionnel** : ne toucher qu'au design (CSS/markup présentationnel), jamais la logique/JS/API/IDs.

### Checklist de conformité (à vérifier après tout changement UI)
```
grep -rn "font-family[^;]*Bricolage" *.html *.css *.js   # → vide
# emoji : scan Python sur [\U0001F000-\U0001FAFF\U00002600-\U000027BF…] hors → ← ★ ✓ ✕ ▲ ▼
# couleurs : tout #hex doit appartenir à la palette DS (sauf logo Google)
node --check <fichiers JS / scripts inline>                # syntaxe intacte
```
État au 2026-06-14 : tout le site est **conforme** sur typographie + emoji + couleurs. Reste optionnel : normaliser les rayons « pilule » 50px des boutons vers l'échelle nette du DS (2/4/6/10px) — à faire si demandé.

## Deployment

This project deploys on **Vercel** with no build step — static HTML files are served directly and `api/` functions run as Vercel serverless functions (Node.js).

To deploy: push to `main` (auto-deploy via Vercel Git integration).

Local dev: open `index.html`, `app.html`, or `landing.html` directly in a browser, or use `npx serve .` for a local static server. API routes require Vercel env vars and must be tested in a Vercel preview deployment.

## Environment Variables

Required in Vercel dashboard:
- `ANTHROPIC_API_KEY` — Claude API (used by `/api/analyze`)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_KEY` — Supabase service role key (used by webhook only)
- `WHOP_API_KEY` — Whop platform API key (pro membership checks)

## Architecture

**No framework, no bundler.** Everything is plain HTML/JS/CSS.

### Pages
- `index.html` — landing/marketing page
- `landing.html` — alternate landing
- `app.html` — main application (~2000+ lines, single-file SPA)

### API (`/api/*.js`)
Each file is an independent Vercel serverless function. All make raw `https.request()` calls — no SDK dependencies.

| File | Purpose |
|---|---|
| `analyze.js` | Proxies chart image + prompt to Claude (`claude-opus-4-5`) and returns analysis JSON |
| `auth.js` | Wraps Supabase Auth REST API (signup/login/logout/user) |
| `history.js` | GET/POST analyses to Supabase `analyses` table |
| `outcomes.js` | PATCH analysis with trade outcome; GET aggregated performance stats |
| `check-pro.js` | Checks `user_profiles` → `pending_activations` → Whop API for pro status |
| `webhook.js` | Receives Whop membership events, updates `user_profiles` or creates `pending_activations` |

### Supabase Tables
- `analyses` — one row per chart analysis (score, verdict, forces, faiblesses, img_data, trade outcome fields)
- `user_profiles` — `id` (matches Supabase auth user id), `email`, `is_pro`, `whop_status`
- `pending_activations` — email-keyed pro activations for users who paid before registering

### Pro membership flow
1. Whop webhook fires → `webhook.js` sets `user_profiles.is_pro = true` (or stores in `pending_activations` if user not registered yet)
2. On login → `check-pro.js` checks in order: `user_profiles` → `pending_activations` → Whop API direct call
3. Pro gate in `app.html` limits free users to N analyses (checked client-side via `isPro` flag)

### `app.html` key sections (by line range)
- **~1–200**: CSS variables, theme, layout
- **~200–800**: UI components (upload zone, score display, tabs)
- **~800–1300**: Analysis flow (`analyzeImage`, prompt construction, result rendering)
- **~1300–1850**: History panel (`loadHistory`, `openHDetail`, history cards)
- **~1850–1960**: Outcome tracking (`setOutcome`, `setResult`, `saveRR`, `saveNotes`, `persistHistoryData`)
- **~1960–2100**: Performance page (`loadPerf`, stats display)
- **~2100+**: Auth overlay, language (FR/EN via `c()` helper), init

### localStorage keys
- `lt_history` — last 50 analyses (without `img_data`), persisted by `persistHistoryData()`
- `ta_token` — Supabase JWT auth token
- `ta_email` — logged-in user email
- `lt_lang` — `'fr'` or `'en'`
