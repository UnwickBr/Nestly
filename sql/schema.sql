-- Nestly schema for NeonDB (Postgres).
-- Run this once against your database (Neon SQL editor, or `psql "$DATABASE_URL" -f sql/schema.sql`).

create table if not exists households (
  id uuid primary key,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  household_id uuid not null references households(id),
  created_at timestamptz not null default now()
);

create table if not exists invites (
  id uuid primary key,
  from_user_id uuid not null references users(id),
  from_household_id uuid not null references households(id),
  to_email text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists idx_users_household on users (household_id);
create index if not exists idx_invites_to_email_status on invites (to_email, status);
create index if not exists idx_invites_from_user_status on invites (from_user_id, status);

create table if not exists items (
  id uuid primary key,
  household_id uuid not null references households(id),
  name text not null,
  category text not null,
  priority text not null default 'Média',
  status text not null default 'Desejado',
  quantity integer not null default 1,
  planned_price numeric not null default 0,
  paid_price numeric,
  store text not null default '',
  link text not null default '',
  added_by text not null,
  notes text not null default '',
  is_favorite boolean not null default false,
  is_wishlist boolean not null default false,
  image text not null default '',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key,
  household_id uuid not null references households(id),
  user_name text not null,
  action text not null,
  item_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_items_household on items (household_id);
create index if not exists idx_activities_household_created on activities (household_id, created_at desc);
