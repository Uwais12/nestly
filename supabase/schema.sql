-- SQL schema for Supabase
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  display_name text
);

create type if not exists public.tag as enum (
  'Inbox','Food','Travel','Tech','Fitness','Home','Style','Finance','Learning','Events','DIY','Beauty','Health','Parenting','Pets','Other'
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  platform text,
  title text,
  short_title text,
  caption text,
  author text,
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_done boolean default false
);

create table if not exists public.item_tags (
  item_id uuid references public.items(id) on delete cascade,
  tag public.tag not null,
  confidence numeric,
  primary key (item_id, tag)
);

create table if not exists public.notes (
  item_id uuid references public.items(id) on delete cascade,
  body text,
  updated_at timestamptz default now(),
  primary key (item_id)
);

-- Collections
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.collection_items (
  collection_id uuid references public.collections(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  added_at timestamptz default now(),
  primary key (collection_id, item_id)
);

-- Optional user settings (appearance, notifications, etc.)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  appearance text default 'system',
  notifications_enabled boolean default false,
  updated_at timestamptz default now()
);

create index if not exists items_text_idx on public.items using gin
  (to_tsvector('simple', coalesce(short_title,'') || ' ' || coalesce(title,'') || ' ' || coalesce(caption,'') || ' ' || coalesce(author,'')));

alter table public.items enable row level security;
alter table public.item_tags enable row level security;
alter table public.notes enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.user_settings enable row level security;

create policy if not exists "items by owner" on public.items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "tags by owner" on public.item_tags
  for all using (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()))
  with check (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()));

create policy if not exists "notes by owner" on public.notes
  for all using (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()))
  with check (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()));

create policy if not exists "collections by owner" on public.collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "collection_items by owner" on public.collection_items
  for all using (exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid()));

create policy if not exists "user_settings by owner" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


