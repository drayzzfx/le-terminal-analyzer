-- ═══════════════════════════════════════════════════════════════════════════
-- Le Terminal — état utilisateur synchronisé entre appareils
--
-- Table clé/valeur par compte : tout ce qui vivait uniquement dans le
-- localStorage du navigateur (patrimoine, devise du journal, préférences du
-- calendrier, analyses masquées) est désormais rattaché au compte, donc
-- retrouvé à l'identique sur n'importe quel appareil.
--
-- À exécuter une seule fois dans l'éditeur SQL de Supabase.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.user_state (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  key        text        not null,
  value      jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

comment on table public.user_state is
  'État applicatif par utilisateur, une ligne par clé. Écrit par /api/state.';

create index if not exists user_state_user_idx on public.user_state (user_id);

-- ── Sécurité : chacun ne voit et n'écrit que ses propres lignes ───────────
alter table public.user_state enable row level security;

drop policy if exists "user_state_select_own" on public.user_state;
create policy "user_state_select_own" on public.user_state
  for select using (auth.uid() = user_id);

drop policy if exists "user_state_insert_own" on public.user_state;
create policy "user_state_insert_own" on public.user_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_state_update_own" on public.user_state;
create policy "user_state_update_own" on public.user_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_state_delete_own" on public.user_state;
create policy "user_state_delete_own" on public.user_state
  for delete using (auth.uid() = user_id);

-- ── updated_at tenu à jour automatiquement ───────────────────────────────
create or replace function public.user_state_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists user_state_touch on public.user_state;
create trigger user_state_touch before update on public.user_state
  for each row execute function public.user_state_touch();
