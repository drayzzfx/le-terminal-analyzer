-- ============================================================
-- Le Terminal — Ajout du titre anglais sur news_items
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================
-- Désormais le pipeline (api/refresh-news.js) stocke :
--   • title    = le titre TRADUIT EN FRANÇAIS (affiché par défaut sur le site)
--   • title_en = le titre d'origine en anglais (affiché en mode EN)
-- Cette colonne est indispensable : sans elle, l'insertion échoue (colonne inconnue).

alter table public.news_items
  add column if not exists title_en text;
