-- ============================================================
-- Le Terminal Analyzer — Table analyses + RLS policies
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Crée la table analyses si elle n'existe pas encore
create table if not exists public.analyses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  pair         text,
  direction    text,
  tf           text,
  score        numeric(4,2),
  verdict      text,
  score_label  text,
  forces       text,
  faiblesses   text,
  recommandations text,
  macro        text,
  scenarios    text,
  annotations  text,
  img_data     text,
  trade_taken  boolean,
  trade_result text,
  rr_realized  numeric(8,2),
  trade_notes  text,
  created_at   timestamptz default now()
);

-- Active RLS
alter table public.analyses enable row level security;

-- Supprime les anciennes policies si elles existent (évite les doublons)
drop policy if exists "analyses_select_own" on public.analyses;
drop policy if exists "analyses_insert_own" on public.analyses;
drop policy if exists "analyses_update_own" on public.analyses;
drop policy if exists "analyses_delete_own" on public.analyses;

-- Chaque utilisateur ne voit que SES propres analyses
create policy "analyses_select_own"
  on public.analyses for select
  using (auth.uid() = user_id);

-- Chaque utilisateur ne peut créer que ses propres analyses
create policy "analyses_insert_own"
  on public.analyses for insert
  with check (auth.uid() = user_id);

-- Chaque utilisateur peut modifier ses propres analyses (outcomes, notes, RR)
create policy "analyses_update_own"
  on public.analyses for update
  using (auth.uid() = user_id);

-- Chaque utilisateur peut supprimer ses propres analyses
create policy "analyses_delete_own"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- Index pour charger les analyses d'un user rapidement
create index if not exists analyses_user_created
  on public.analyses (user_id, created_at desc);
