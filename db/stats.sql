-- ============================================================================
--  Le Terminal — Progression du joueur rattachée au COMPTE (dashboard/gamification)
--  À exécuter dans Supabase → SQL Editor. Idempotent.
--
--  Stocke, par compte, les données de progression qui étaient jusqu'ici en
--  localStorage (donc perdues au changement d'appareil / à la déconnexion) :
--    - usage        : temps par outil + nombre de visites (temps d'écran)
--    - goals        : objectifs
--    - notes        : notes du journal (jnl_notes)
--    - eco_unlocked : progression Éco
--    - currency     : devise du journal
--  Alimenté par /api/stats (clé service). Les niveaux/XP se recalculent côté
--  client à partir de ces données + des analyses/trades déjà en base.
-- ============================================================================

alter table public.user_profiles add column if not exists stats jsonb;
