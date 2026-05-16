create extension if not exists pgcrypto;

create table if not exists public.supporters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  message text,
  is_anonymous boolean not null default false,
  status text not null default 'verified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint supporters_display_name_len check (char_length(display_name) between 2 and 40),
  constraint supporters_message_len check (message is null or char_length(message) <= 120),
  constraint supporters_status_check check (status in ('verified', 'hidden', 'blocked'))
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  reason text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),

  constraint contact_name_len check (char_length(name) between 2 and 60),
  constraint contact_email_len check (char_length(email) between 5 and 120),
  constraint contact_reason_len check (char_length(reason) between 2 and 80),
  constraint contact_message_len check (char_length(message) between 10 and 2000)
);

alter table public.supporters enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Public can read verified supporters" on public.supporters;
create policy "Public can read verified supporters"
on public.supporters
for select
using (status = 'verified');

drop policy if exists "Authenticated users can create own supporter" on public.supporters;
create policy "Authenticated users can create own supporter"
on public.supporters
for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'verified'
);

drop policy if exists "Authenticated users can update own supporter" on public.supporters;
create policy "Authenticated users can update own supporter"
on public.supporters
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Anyone can submit contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

create or replace function public.get_signal_wall()
returns table (
  id uuid,
  signal_number bigint,
  display_name text,
  message text,
  is_anonymous boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    s.id,
    row_number() over (order by s.created_at asc) as signal_number,
    case
      when s.is_anonymous then 'Anonymous Supporter'
      else s.display_name
    end as display_name,
    s.message,
    s.is_anonymous,
    s.created_at
  from public.supporters s
  where s.status = 'verified'
  order by s.created_at desc;
$$;

create or replace function public.get_signal_stats()
returns table (
  total_supporters bigint
)
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint as total_supporters
  from public.supporters
  where status = 'verified';
$$;
