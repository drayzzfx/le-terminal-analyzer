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

## Bascule de langue FR/EN (`lang.js`) — NE PAS recâbler

La bascule FR/EN est gérée **exclusivement** par **`lang.js`**, un module isolé et robuste, branché par **délégation d'événement** (un seul écouteur de clic sur `document` qui capte toute pastille `.lt-nav__pill` / `#ltLangPill`). Il fonctionne même si `menu.js` est cassé/absent (système `data-en` autonome), et délègue à `menu.js` la traduction riche quand il est sain.

**Règles permanentes (pour ne plus jamais casser le bouton) :**
- **Toute page** (existante ou nouvelle) doit charger `<script src="./lang.js"></script>` en dernier, avant `</body>`.
- La pastille de langue est un simple `<span class="lt-nav__pill" id="ltLangPill" title="Changer de langue">FR</span>` — **JAMAIS** d'`onclick` ni d'`addEventListener` local dessus (sinon double déclenchement). La délégation de `lang.js` suffit.
- Le texte traduisible reste en FR dans le HTML, l'anglais dans l'attribut `data-en` (le FR d'origine est mémorisé dans `data-fr` au 1er passage).
- Ne pas réintroduire de wiring de langue dans `menu.js`/inline : `lang.js` est la source de vérité.

## Bannières d'articles de blog — GABARIT DE SÉRIE (obligatoire)

Toutes les bannières héro des articles (`/blog/img/<slug>.webp`) suivent **un seul et même gabarit**. Toute nouvelle bannière (ou refonte) doit être **jumelle** des existantes (`gestion-risque-prop-firm`, `pourquoi-journal-trading`, `quest-ce-quun-setup`, `trader-avec-chatgpt`, `prompt-trading-ia`). Avant d'en créer une, **regarder ces images de référence** et reproduire le gabarit — ne pas réinventer.

**Dimensions (identiques pour TOUTES) :** héro WebP **1600×900** (qualité 88), OG **1200×630** JPG (`resize((1200,675)).crop((0,22,1200,652))`, qualité 86). Mettre à jour `width="1600" height="900"` sur l'article ET la vignette du listing.

**Composition du gabarit (à respecter au pixel près) :**
- **Logo** : le VRAI logo chromé embarqué `<img src="/logo-nav.webp" width="50">` + `LE TERMINAL` (Inter 700, ~27px, `letter-spacing:0.2em`, blanc) + séparateur + `BLOG` (JetBrains Mono 700, ~19px, **bleu `#7FB8E8`**). **JAMAIS** un « T » dessiné à la main.
- **Pas d'eyebrow/pastille « TRADING ». Pas de bandeau « règle d'or » en bas.** (La série n'en a pas.)
- **Titre** : **Anton**, CAPITALES condensées, **~76–84px** (`line-height:0.96`), remplit la zone y≈175–430. Blanc métallique brillant `linear-gradient(178deg,#FFFFFF 8%,#EDF1F6 48%,#C4CDD8 82%,#9AA5B2 100%)` **+ un seul mot focal en bleu** `linear-gradient(178deg,#A9D2F5,#7FB8E8,#5A97CE)`.
- **Barre** bleue courte (74×4) sous le titre, puis **sous-titre ~24px** (Inter, `#C4CCD6`, 2–3 lignes) **+ une ligne de clôture bleue** `#7FB8E8` en gras.
- **Marque centrale** : grand **octogone métallique + chevron bleu** (~300px, motif récurrent), bien visible ; panneaux à droite.
- **Panneaux droite** : fond `rgba(20,25,33,.94)`, radius 16, en-tête JetBrains Mono bleu `#8FB9E4`. Contenu propre spécifique à l'article.
- **Piliers (bas, pleine largeur, 4–5)** : icône trait fin dans un **CERCLE** (`border-radius:50%`, ring 1.5px, sans fond) + **intitulé bleu `#7FB8E8`** + description grise. **Jamais** de carré arrondi ni d'intitulé doré.
- Palette : bleu glacial dominant, or `#E8C268` avec parcimonie, sémantiques vert `#4ADE9C` / rouge `#F0647A`. Zéro emoji.

**⚠️ PIÈGE CRITIQUE — police Anton au screenshot :** `fonts.css` charge Anton en `font-display:swap`, donc la capture Chromium headless part **avant** qu'Anton soit chargée → le titre sort dans une police de repli (sans-serif large et fade). **Solution obligatoire :** générer un CSS avec les `@font-face` **embarqués en base64** (Anton + Inter 400/600/700/800 + JetBrains Mono 400/700 depuis `fonts/*.woff2`), le lier dans le HTML temporaire, et rendre avec `--virtual-time-budget=6000`. **Toujours vérifier** sur le screenshot que le titre est bien condensé (Anton) avant de publier.

**Workflow de fabrication (fichiers temporaires `__*.html`/`__fe.css` à supprimer avant commit) :**
1. Écrire la bannière en HTML/CSS 1600×900 (`body{width:1600px;height:900px;overflow:hidden}`) + lier le CSS de polices base64.
2. Servir `python3 -m http.server 8901` puis Chromium `--headless --window-size=1600,1000 --virtual-time-budget=6000 --screenshot`, puis **cropper (0,0,1600,900)** (contourne un bug d'ancrage du bandeau bas à 900px exact).
3. Vérifier le rendu au screenshot (titre Anton, rien qui déborde), convertir WebP + OG, remplacer les fichiers, **supprimer les temporaires**, commit.

Le texte des panneaux/piliers doit être **recopié fidèlement** depuis le visuel fourni par le client — ne pas reformuler ni abréger. Auteur des articles = **« Les fondateurs du Terminal »** (Adrien & Romain), JSON-LD `author` = Organization « Le Terminal ».
