-- WishlistApp Supabase schema
-- Run this in the Supabase dashboard: SQL Editor > New query > Run

-- Per-user wishlist items (synced)
create table if not exists public.wishes (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  price numeric,
  currency text default '$',
  image_uri text,
  link text default '',
  notes text default '',
  priority text default 'medium',
  categories text[] default '{}',
  saved_amount numeric default 0,
  completed boolean default false,
  completed_at bigint,
  created_at bigint,
  updated_at bigint default (extract(epoch from now()) * 1000)::bigint
);

-- Wishes shared between users via a code
create table if not exists public.shared_wishes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  owner_id uuid references auth.users(id) on delete cascade,
  owner_email text not null,
  wish_id text,
  title text not null,
  price numeric,
  currency text default '$',
  image_uri text,
  link text default '',
  notes text default '',
  priority text default 'medium',
  categories text[] default '{}',
  created_at bigint default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists wishes_owner_idx on public.wishes(owner_id);
create index if not exists shared_wishes_owner_idx on public.shared_wishes(owner_id);
create index if not exists shared_wishes_code_idx on public.shared_wishes(code);

-- Row level security
alter table public.wishes enable row level security;
alter table public.shared_wishes enable row level security;

drop policy if exists "users read own wishes" on public.wishes;
create policy "users read own wishes" on public.wishes
  for select using (auth.uid() = owner_id);

drop policy if exists "users insert own wishes" on public.wishes;
create policy "users insert own wishes" on public.wishes
  for insert with check (auth.uid() = owner_id);

drop policy if exists "users update own wishes" on public.wishes;
create policy "users update own wishes" on public.wishes
  for update using (auth.uid() = owner_id);

drop policy if exists "users delete own wishes" on public.wishes;
create policy "users delete own wishes" on public.wishes
  for delete using (auth.uid() = owner_id);

drop policy if exists "owner read own shared wishes" on public.shared_wishes;
create policy "owner read own shared wishes" on public.shared_wishes
  for select using (auth.uid() = owner_id);

drop policy if exists "owner insert own shared wishes" on public.shared_wishes;
create policy "owner insert own shared wishes" on public.shared_wishes
  for insert with check (auth.uid() = owner_id);

drop policy if exists "owner delete own shared wishes" on public.shared_wishes;
create policy "owner delete own shared wishes" on public.shared_wishes
  for delete using (auth.uid() = owner_id);

-- Fetch a shared wish by its code without exposing every code
-- (security definer bypasses RLS for this one lookup)
create or replace function public.get_shared_wish(p_code text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select to_jsonb(s)
  from public.shared_wishes s
  where s.code = upper(trim(p_code))
  limit 1;
$$;

revoke all on function public.get_shared_wish(text) from public;
grant execute on function public.get_shared_wish(text) to anon, authenticated;
