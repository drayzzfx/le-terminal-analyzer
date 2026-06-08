# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
