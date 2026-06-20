-- ============================================================================
--  Le Terminal — Politiques RLS (Row Level Security)
--  À exécuter dans Supabase → SQL Editor.  Script IDEMPOTENT : réexécutable
--  sans risque (drop policy if exists + enable RLS).
--
--  PRINCIPE
--  --------
--  Les endpoints serveur qui utilisent la clé SERVICE_ROLE (lecture de
--  l'historique/journal, profil, tokens, check-pro, webhook, analyze)
--  CONTOURNENT la RLS : ils continueront de fonctionner à l'identique.
--  La RLS protège les accès DIRECTS faits avec la clé anon ou un token
--  utilisateur (notamment portfolio_holdings, et l'écriture analyses/journal).
--
--  Hypothèse : les colonnes user_id (analyses, journal_trades,
--  portfolio_holdings) et user_profiles.id sont de type uuid (cas standard
--  Supabase). Si l'une d'elles était en `text`, remplacez `auth.uid()` par
--  `auth.uid()::text` dans la comparaison correspondante.
-- ============================================================================


-- 1) ANALYSES (Setup Analyzer) — strictement privé par utilisateur ------------
--    Écriture via token utilisateur (user_id = soi), lecture serveur via clé
--    service (bypass RLS). La policy couvre aussi outcomes.js (token).
alter table public.analyses enable row level security;

drop policy if exists "analyses_owner" on public.analyses;
create policy "analyses_owner" on public.analyses
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- 2) JOURNAL_TRADES — strictement privé par utilisateur -----------------------
alter table public.journal_trades enable row level security;

drop policy if exists "journal_owner" on public.journal_trades;
create policy "journal_owner" on public.journal_trades
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- 3) PORTFOLIO_HOLDINGS — strictement privé par utilisateur -------------------
--    IMPORTANT : l'API n'envoie pas user_id lors de l'upsert ; on garantit donc
--    son auto-remplissage avec l'identité du porteur du token. Sans cela, la
--    RLS rejetterait les insertions (user_id NULL).
alter table public.portfolio_holdings
  alter column user_id set default auth.uid();

alter table public.portfolio_holdings enable row level security;

drop policy if exists "portfolio_owner" on public.portfolio_holdings;
create policy "portfolio_owner" on public.portfolio_holdings
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- (Optionnel) Nettoyage des lignes orphelines créées avant la RLS (user_id NULL) :
-- delete from public.portfolio_holdings where user_id is null;


-- 4) USER_PROFILES — lecture de SA fiche uniquement ---------------------------
--    Aucune écriture côté utilisateur : is_pro / tokens / whop_status ne se
--    modifient QUE via la clé service (webhook, check-pro, tokens, analyze).
--    → On n'autorise que le SELECT de sa propre ligne ; pas d'INSERT/UPDATE
--      /DELETE pour le rôle authenticated (ce qui empêche un client de
--      s'auto-attribuer is_pro=true ou des tokens).
alter table public.user_profiles enable row level security;

drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own" on public.user_profiles
  for select
  to authenticated
  using (id = auth.uid());


-- 5) PENDING_ACTIVATIONS — réservé au serveur (clé service) -------------------
--    Contient les e-mails des personnes ayant payé avant inscription : aucune
--    exposition publique. RLS activée SANS policy → anon/authenticated n'ont
--    aucun accès ; seule la clé service (bypass RLS) peut lire/écrire.
alter table public.pending_activations enable row level security;
-- (volontairement : aucune policy)


-- ============================================================================
-- 6) OPTIONNEL — TRADE_SHARES (Mur des Trades) — PUBLIC --------------------
--    Cette table est alimentée/lue via la clé ANON (fonctionnalité publique).
--    NE PAS activer la RLS sans policy, sinon le mur cesse de fonctionner.
--    Si vous souhaitez la verrouiller, décommentez et adaptez :
--
-- alter table public.trade_shares enable row level security;
-- drop policy if exists "wall_public_read" on public.trade_shares;
-- create policy "wall_public_read" on public.trade_shares
--   for select to anon, authenticated using (true);
-- -- NB : l'insertion publique actuelle se fait via la clé anon. La restreindre
-- --      (ex. réserver le partage aux comptes connectés) est une décision
-- --      produit qui nécessiterait d'authentifier l'endpoint /api/trades.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- VÉRIFICATION (à lancer après) : liste l'état RLS + les policies
--   select relname as table, relrowsecurity as rls_active
--   from pg_class where relname in
--   ('analyses','journal_trades','portfolio_holdings','user_profiles','pending_activations');
--
--   select schemaname, tablename, policyname, cmd
--   from pg_policies where schemaname = 'public' order by tablename;
-- ----------------------------------------------------------------------------
