-- ============================================================
-- Le Terminal — Tables pour le système d'automatisation des news
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. TABLE : news_items
-- Stocke les articles RSS résumés par Claude
-- ============================================================
create table if not exists public.news_items (
  id           uuid primary key default gen_random_uuid(),
  guid         text not null unique,
  title        text not null,
  summary      text,
  source       text,
  url          text,
  published_at timestamptz,
  zone         text check (zone in ('europe','ameriques','asie','institutions','marches','crypto')),
  sentiment    text check (sentiment in ('Risk-on','Risk-off','Hawkish','Dovish','Neutre')),
  created_at   timestamptz default now()
);

-- Index pour les requêtes par zone + date
create index if not exists news_items_zone_published
  on public.news_items (zone, published_at desc);

-- Index pour la déduplication par GUID
create unique index if not exists news_items_guid_unique
  on public.news_items (guid);

-- Nettoyage automatique des articles > 7 jours (optionnel — à activer via pg_cron si disponible)
-- select cron.schedule('delete-old-news', '0 3 * * *', 'delete from news_items where published_at < now() - interval ''7 days''');


-- 2. TABLE : flash_alerts
-- Stocke les alertes de mouvements brusques détectées via Twelve Data
-- ============================================================
create table if not exists public.flash_alerts (
  id           uuid primary key default gen_random_uuid(),
  asset        text not null,
  move_pct     numeric(8,4),
  direction    text check (direction in ('up','down')),
  cause_found  boolean default false,
  source_title text,
  source_url   text,
  summary      text,
  detected_at  timestamptz default now()
);

-- Index pour les 10 dernières alertes (utilisé par /api/flash-detect)
create index if not exists flash_alerts_detected
  on public.flash_alerts (detected_at desc);


-- 3. TABLE : feed_errors
-- Log des erreurs de fetch RSS pour diagnostic
-- ============================================================
create table if not exists public.feed_errors (
  id         uuid primary key default gen_random_uuid(),
  source     text,
  url        text,
  error      text,
  created_at timestamptz default now()
);


-- ============================================================
-- RLS (Row Level Security)
-- Les tables news_items et flash_alerts sont publiques en lecture
-- Le cron (service key) peut écrire
-- ============================================================

alter table public.news_items    enable row level security;
alter table public.flash_alerts  enable row level security;
alter table public.feed_errors   enable row level security;

-- Lecture publique (anon key)
create policy "news_items_read_public"
  on public.news_items for select
  using (true);

create policy "flash_alerts_read_public"
  on public.flash_alerts for select
  using (true);

-- Écriture réservée au service role (cron / API serverless avec SUPABASE_SERVICE_KEY)
create policy "news_items_insert_service"
  on public.news_items for insert
  with check (true);  -- La vérification est faite au niveau API (bearer = service key)

create policy "flash_alerts_insert_service"
  on public.flash_alerts for insert
  with check (true);

create policy "flash_alerts_delete_service"
  on public.flash_alerts for delete
  using (true);

create policy "feed_errors_insert_service"
  on public.feed_errors for insert
  with check (true);
