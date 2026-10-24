-- Migration aditiva: capas dos jogos e perfis derivados do Supabase Auth.
-- Executar manualmente no SQL Editor do projeto Supabase após revisar.
alter table public.jogos add column if not exists capa_url text;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url, updated_at)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      nullif(new.raw_user_meta_data ->> 'global_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), '')
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', '')
    ),
    now()
  )
  on conflict (id) do update set
    username = excluded.username,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_profile_sync on auth.users;
create trigger on_auth_user_profile_sync
  after insert or update of raw_user_meta_data on auth.users
  for each row execute procedure public.sync_profile_from_auth();

insert into public.profiles (id, username, avatar_url)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'username', ''),
    nullif(u.raw_user_meta_data ->> 'global_name', ''),
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(u.raw_user_meta_data ->> 'name', ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), '')
  ),
  coalesce(nullif(u.raw_user_meta_data ->> 'avatar_url', ''), nullif(u.raw_user_meta_data ->> 'picture', ''))
from auth.users u
on conflict (id) do nothing;
