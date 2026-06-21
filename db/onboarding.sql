-- ============================================================================
--  Le Terminal — Données du questionnaire d'accueil (onboarding)
--  À exécuter dans Supabase → SQL Editor. Idempotent.
--
--  Stocke les réponses du questionnaire (niveau, marché, objectif, acquisition)
--  dans user_profiles, alimenté par /api/onboarding (clé service).
-- ============================================================================

alter table public.user_profiles add column if not exists survey jsonb;
alter table public.user_profiles add column if not exists onboarded_at timestamptz;

-- (Analyse) Répartition « Comment nous avez-vous connu ? » :
--   select survey->>'source' as source, count(*)
--   from public.user_profiles where survey is not null
--   group by 1 order by 2 desc;
--
-- (Analyse) Niveau des inscrits :
--   select survey->>'level' as niveau, count(*)
--   from public.user_profiles where survey is not null
--   group by 1 order by 2 desc;
