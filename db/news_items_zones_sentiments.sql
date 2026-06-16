-- ============================================================
-- Le Terminal — Mise à jour des contraintes CHECK de news_items
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================
-- Problème : la contrainte d'origine n'autorisait pas zone='international'
-- ni zone='flash', ni les sentiments 'Positif'/'Négatif'. Toute insertion
-- pour la zone International (et Flash) était donc REJETÉE → page vide.
-- On remplace les deux contraintes par des versions élargies.

-- Zone : on autorise toutes les zones réellement utilisées par le pipeline.
alter table public.news_items
  drop constraint if exists news_items_zone_check;
alter table public.news_items
  add constraint news_items_zone_check
  check (zone in ('europe','ameriques','asie','institutions','marches','crypto','international','flash'));

-- Sentiment : on autorise le nouveau jeu (Positif/Négatif/Neutre) ET l'ancien
-- (Risk-on/Risk-off/Hawkish/Dovish) pour ne pas casser les lignes historiques.
alter table public.news_items
  drop constraint if exists news_items_sentiment_check;
alter table public.news_items
  add constraint news_items_sentiment_check
  check (sentiment in ('Positif','Négatif','Neutre','Risk-on','Risk-off','Hawkish','Dovish'));
