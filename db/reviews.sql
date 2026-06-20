-- ============================================================================
--  Le Terminal — Table des avis clients (vrais avis, conformes Omnibus)
--  À exécuter dans Supabase → SQL Editor. Idempotent.
--
--  Principe : seuls des MEMBRES CONNECTÉS peuvent déposer un avis (via
--  /api/reviews, qui vérifie le token) ; l'avis est créé avec approved = false
--  puis publié manuellement (approved = true) après vérification. La lecture
--  publique ne renvoie que les avis approuvés. Aucun faux avis, traçabilité
--  conservée (user_id / e-mail), pas de filtrage sélectif des avis négatifs.
-- ============================================================================

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid,
  user_email   text,
  author_name  text not null,
  role         text,
  rating       int  not null check (rating between 1 and 5),
  body         text not null,
  lang         text default 'fr',
  approved     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Un seul avis par utilisateur (upsert) — évite le spam.
create unique index if not exists reviews_user_uniq
  on public.reviews(user_id) where user_id is not null;

-- RLS : tout passe par l'API (clé service, qui contourne la RLS). On active la
-- RLS sans policy publique → aucun accès direct anon/authenticated à la table.
alter table public.reviews enable row level security;

-- (Optionnel) Modération depuis le SQL Editor :
--   Publier un avis :   update public.reviews set approved = true  where id = '...';
--   Retirer un avis :   update public.reviews set approved = false where id = '...';
--   Lister à modérer :  select id, author_name, rating, body, created_at
--                       from public.reviews where approved = false order by created_at desc;
