-- Supabase/PostgreSQL schema for ai-sticker-plantform
-- Tables: users, games

create table if not exists public.users (
  id text primary key,
  email text unique,
  name text,
  image text,
  password text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.games (
  id text primary key,
  title text not null,
  description text,
  prompt text not null,
  "htmlContent" text not null,
  "isPublic" boolean not null default false,
  "userId" text not null references public.users(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists games_user_id_idx on public.games ("userId");
create index if not exists games_is_public_idx on public.games ("isPublic");
create index if not exists games_created_at_idx on public.games ("createdAt");
