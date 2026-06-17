-- ============================================================
-- Le Terminal — Rapport long stocké pour les archives
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================
-- La page d'archive « Rapport approfondi » doit rester longue et aérée même
-- une fois les annonces (news_items) purgées. On stocke donc, au moment de la
-- génération du soir, un rapport détaillé (sections « ## ») en plus du résumé
-- court affiché sur les cartes.
--   • summary / summary_en  → résumé court (cartes Archive)  [déjà existant]
--   • report  / report_en   → rapport long et structuré (page de détail)  [nouveau]

alter table public.daily_summaries
  add column if not exists report text;
alter table public.daily_summaries
  add column if not exists report_en text;
