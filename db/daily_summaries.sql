-- Table des résumés quotidiens (page Archive du Calendrier Éco)
-- À exécuter une fois dans Supabase → SQL Editor.
create table if not exists public.daily_summaries (
  id          bigint generated always as identity primary key,
  day         date        not null,                 -- jour (heure de Paris)
  zone        text        not null,                 -- europe|ameriques|asie|marches|institutions|international|crypto|flash
  summary     text        not null,                 -- synthèse FR
  summary_en  text,                                  -- synthèse EN
  item_count  int         not null default 0,        -- nb d'annonces ce jour-là
  top_sentiment text,                                -- sentiment dominant (facultatif)
  created_at  timestamptz not null default now(),
  unique (day, zone)
);

create index if not exists daily_summaries_day_idx on public.daily_summaries (day desc);

-- Lecture publique (anon) ; écriture réservée à la service key (cron).
alter table public.daily_summaries enable row level security;
create policy "daily_summaries read" on public.daily_summaries
  for select using (true);
