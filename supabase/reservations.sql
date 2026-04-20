create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'reservation_status'
  ) then
    create type public.reservation_status as enum ('pending', 'confirmed', 'rejected');
  end if;
end;
$$;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  reservation_date date not null,
  reservation_time time not null,
  guest_count integer not null check (guest_count > 0 and guest_count <= 20),
  status public.reservation_status not null default 'pending',
  status_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.update_reservations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists reservations_updated_at on public.reservations;
create trigger reservations_updated_at
before update on public.reservations
for each row
execute function public.update_reservations_updated_at();

alter table public.reservations enable row level security;

drop policy if exists reservations_select_authenticated on public.reservations;
create policy reservations_select_authenticated
on public.reservations
for select
to authenticated
using (true);

drop policy if exists reservations_insert_public on public.reservations;
create policy reservations_insert_public
on public.reservations
for insert
to anon, authenticated
with check (
  status = 'pending'::public.reservation_status
  and reviewed_by is null
  and reviewed_at is null
);

drop policy if exists reservations_update_staff on public.reservations;
create policy reservations_update_staff
on public.reservations
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'cashier')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'cashier')
  )
);

create index if not exists reservations_created_at_idx on public.reservations(created_at desc);
create index if not exists reservations_status_idx on public.reservations(status);
create index if not exists reservations_date_time_idx on public.reservations(reservation_date, reservation_time);
