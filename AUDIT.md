# 🔎 Audit complet — Le Terminal

> Revue professionnelle pré-lancement.
> Date : 2026-06-20 · Périmètre : code réel (historique Git, 28 endpoints API, 28 pages, CSS/JS), sécurité, monétisation, conformité design system, robustesse.

---

## Verdict global

Produit **abouti côté expérience, design et fonctionnalités** — clairement de qualité « lançable » sur la forme.
**Mais il n'est pas encore prêt à ouvrir les paiements** en l'état : la monétisation et l'accès Premium ne sont **pas verrouillés côté serveur**. Ce sont 3 correctifs ciblés (quelques heures de travail), pas une refonte. Une fois faits → **go**.

---

## 🟢 Ce qui est très bien

- **Design system tenu de bout en bout.** Scan global : **zéro `Bricolage`**, **zéro emoji hors-charte** (1 glyphe `✗` égaré dans `app.html`, broutille), palette et typographies (Anton / Inter / JetBrains Mono) respectées partout. L'identité « Cinematic Luxury » est cohérente sur les 28 pages.
- **Internationalisation FR/EN robuste** (`lang.js` en délégation, autonome) et **vouvoiement** appliqué partout. Le bouton de langue ne casse plus.
- **PWA propre** : `manifest.json`, service worker versionné (`lt-cache-v14`) en **network-first** sur HTML/JS/CSS (pas de cache périmé) et cache-first sur les assets.
- **Accessibilité de base solide** : `lang` + `viewport` sur **toutes** les pages, icônes SVG (pas d'images de texte), `prefers-reduced-motion` honoré, navigation clavier ajoutée (modales du compte).
- **Aucun secret exposé côté client** (`config.js` ne sort que l'URL + clé anon Supabase, ce qui est public par design).
- **`check-pro` bien fait côté serveur** : token → `user_profiles` → `pending_activations` → API Whop, dans le bon ordre.
- **Architecture serverless saine** : 28 fonctions indépendantes, sans dépendances lourdes, faciles à déployer sur Vercel.
- **Richesse fonctionnelle réelle** : analyseur IA, journal avec analytics poussées, patrimoine, calendrier éco, espace compte + gamification.

---

## 🔴 Bloquants avant d'ouvrir les paiements (sécurité / monétisation)

### 1. `/api/analyze` est un proxy ouvert, sans authentification ni quota
N'importe qui peut appeler cet endpoint directement (CORS `*`) et consommer **votre clé Anthropic sans limite**.
Conséquences : la limite « 3 analyses gratuites » se contourne en 10 secondes, et un acteur malveillant peut **faire exploser votre facture IA**. La limite n'existe qu'**côté client** (`tokens.js` n'est appelé que par le navigateur, honnêtement).
**→ Exiger un token utilisateur et décompter le quota dans `analyze.js`, côté serveur.**

### 2. `/api/webhook` (Whop) ne vérifie pas la signature
Le code lit le `req.body`, prend l'e-mail et passe `is_pro = true` **sans aucune vérification HMAC** de l'en-tête `whop-signature`. Autrement dit, **n'importe qui peut s'octroyer (ou octroyer à n'importe quel e-mail) un accès Premium gratuit** en envoyant une fausse requête. Faille la plus grave pour le business.
**→ Vérifier la signature du webhook avec le secret Whop avant tout octroi.**

### 3. Le gating Premium est purement côté client
`isPro` vient de `localStorage.lt_pro='1'` — modifiable à la main. Combiné au point 1, **l'offre payante n'est pas réellement protégée**.
**→ Toute ressource « Premium » doit valider le statut côté serveur (via le token), pas via un flag local.**

> Ces trois points se renforcent : tant qu'ils ne sont pas corrigés, le Premium est « décoratif ».
> Bonne nouvelle : `check-pro` et `tokens.js` existent déjà — il s'agit surtout de **les brancher dans `analyze.js`** et d'ajouter la **vérif de signature** au webhook.

---

## 🟡 Importants (à traiter rapidement, pas forcément bloquants J-0)

- **RLS Supabase à vérifier absolument.** Aucune politique RLS n'est versionnée dans `db/`. Plusieurs endpoints passent le token utilisateur (bien **si** RLS activé), mais `trades.js` lit avec la clé anon. Si RLS n'est pas activé sur `analyses`, `user_profiles`, `pending_activations`, `portfolio_holdings`, `journal`… **les données d'un utilisateur pourraient être lisibles par un autre.** À confirmer dans le tableau de bord Supabase.
- **IDs de plans Whop = placeholders** dans `checkout.js` (`PLAN_ID_MENSUEL/ANNUEL`), récupérés à chaud via `/api/whop-plans`. À **tester de bout en bout** : un vrai paiement doit aboutir, sinon bascule sur l'URL de repli.
- **Aucun rate-limiting** sur les endpoints (notamment `analyze`, `auth`). Risque d'abus / coût. Une limite par IP suffirait pour démarrer.
- **CORS `*` sur 34 endpoints** : tout site tiers peut appeler vos API. À restreindre au domaine (au moins pour les endpoints sensibles).
- **Persistance localStorage** : journal, notes (images en base64) et historique vivent surtout en local → **risque de quota 5 Mo, perte au changement d'appareil, pas de synchro**. La synchro Supabase existe mais partielle. À clarifier comme « source de vérité ».
- **SEO incomplet pour un site vitrine** : pas de `robots.txt`, pas de `sitemap.xml`, pas de cartes sociales `og:`/`twitter:` (seule la `meta description` est présente). Impact direct sur l'acquisition.

---

## 🔵 Axes d'amélioration (qualité / pérennité)

- **Conformité réglementaire (France/UE).** Produit para-financier : vérifier la **bannière cookies/consentement (RGPD)**, la politique de confidentialité, et les **mentions AMF/disclaimer** (déjà présentes sur le patrimoine — à généraliser et faire valider).
- **Maintenabilité.** `app.html` (4 260 lignes), `journal.html` (3 273), `index.html` (1 462) en fichier unique avec JS/CSS inline : fonctionne, mais lourd à faire évoluer et propice aux régressions. Pas de build ni de tests. À terme : découper + un minimum de tests sur les parcours critiques (auth, paiement, analyse).
- **Performance.** Charger en différé les gros scripts d'animation (`home-anim.js`, 724 lignes), `defer`/lazy sur le superflu, alléger les images base64.
- **Observabilité.** Pas de suivi d'erreurs (type Sentry) ni d'analytics. Indispensable le jour du lancement pour voir ce qui casse côté vrais utilisateurs.
- **États vides / erreurs / hors-ligne** : 92 `fetch` pour 34 `.catch` — beaucoup sont protégés, mais une passe sur les messages d'erreur réseau visibles par l'utilisateur serait saine.

---

## 🎯 Ordre de priorité (avant d'ouvrir les paiements)

1. 🔴 **Vérifier la signature du webhook Whop** (`api/webhook.js`).
2. 🔴 **Authentifier + décompter le quota dans `api/analyze.js`** (refuser sans token / quota épuisé).
3. 🔴 **Activer/valider la RLS Supabase** sur toutes les tables utilisateur.
4. 🟡 Tester le **parcours de paiement Whop** de bout en bout (plan IDs réels).
5. 🟡 `robots.txt` + `sitemap.xml` + cartes `og:`/`twitter:`, et restreindre le CORS.
6. 🔵 Cookies/RGPD + disclaimer, puis observabilité (suivi d'erreurs).

---

## Synthèse

**Le produit est bon.** L'expérience, le design, le périmètre fonctionnel et la cohérence sont au niveau d'un lancement.
**Ce qui bloque, c'est uniquement le verrouillage serveur de la monétisation et la sécurité du webhook** — sans quoi vous risquez (a) que le Premium ne serve à rien, (b) une facture IA incontrôlée. Ces correctifs sont rapides et rentables.

### Légende des priorités
- 🔴 Bloquant lancement (sécurité / argent)
- 🟡 Important (à traiter vite)
- 🔵 Amélioration (qualité / pérennité)
- 🟢 Déjà bien / atout
