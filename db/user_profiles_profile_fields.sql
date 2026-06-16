-- Champs de profil utilisateur (page « Mon profil »)
-- À exécuter une fois dans Supabase → SQL Editor.
alter table public.user_profiles add column if not exists first_name text;
alter table public.user_profiles add column if not exists last_name  text;
alter table public.user_profiles add column if not exists pseudo     text;
alter table public.user_profiles add column if not exists avatar_url text;
