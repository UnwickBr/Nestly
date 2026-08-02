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
