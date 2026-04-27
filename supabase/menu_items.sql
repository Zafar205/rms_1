create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'app_role'
  ) then
    create type public.app_role as enum ('admin', 'cashier');
  end if;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role public.app_role not null default 'cashier',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.update_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.update_profiles_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := lower(coalesce(new.raw_user_meta_data ->> 'role', 'cashier'));

  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when requested_role = 'admin' then 'admin'::public.app_role else 'cashier'::public.app_role end
  )
  on conflict (id) do update
    set
      email = excluded.email,
      role = excluded.role,
      updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

insert into public.profiles (id, email, role)
select
  u.id,
  u.email,
  case
    when lower(coalesce(u.raw_user_meta_data ->> 'role', 'cashier')) = 'admin'
      then 'admin'::public.app_role
    else 'cashier'::public.app_role
  end as role
from auth.users u
on conflict (id) do update
  set
    email = excluded.email,
    role = excluded.role,
    updated_at = timezone('utc', now());

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price_pkr integer not null check (price_pkr > 0),
  description text not null,
  image text not null default '/biryani.jpeg',
  alt text not null default '',
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.update_menu_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists menu_items_updated_at on public.menu_items;
create trigger menu_items_updated_at
before update on public.menu_items
for each row
execute function public.update_menu_items_updated_at();

alter table public.menu_items enable row level security;

drop policy if exists menu_items_select_all on public.menu_items;
create policy menu_items_select_all
on public.menu_items
for select
to anon, authenticated
using (true);

drop policy if exists menu_items_write_all on public.menu_items;
drop policy if exists menu_items_write_admin_only on public.menu_items;
create policy menu_items_write_admin_only
on public.menu_items
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name = upper(trim(name))),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.update_menu_categories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists menu_categories_updated_at on public.menu_categories;
create trigger menu_categories_updated_at
before update on public.menu_categories
for each row
execute function public.update_menu_categories_updated_at();

alter table public.menu_categories enable row level security;

drop policy if exists menu_categories_select_all on public.menu_categories;
create policy menu_categories_select_all
on public.menu_categories
for select
to anon, authenticated
using (true);

drop policy if exists menu_categories_write_admin_only on public.menu_categories;
create policy menu_categories_write_admin_only
on public.menu_categories
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

insert into public.menu_categories (name)
select distinct upper(trim(mi.category))
from public.menu_items mi
where trim(mi.category) <> ''
on conflict (name) do nothing;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null default 'Walk-in Customer',
  customer_phone text,
  subtotal_pkr integer not null check (subtotal_pkr >= 0),
  tax_pkr integer not null default 0 check (tax_pkr >= 0),
  total_pkr integer not null check (total_pkr >= 0),
  status text not null default 'pending' constraint orders_status_valid check (status in ('pending', 'confirmed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.orders
  add column if not exists status text;

update public.orders
set status = 'pending'
where status is null or status not in ('pending', 'confirmed');

alter table public.orders
  alter column status set default 'pending';

alter table public.orders
  alter column status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_status_valid'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_status_valid check (status in ('pending', 'confirmed'));
  end if;
end;
$$;

create or replace function public.update_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
before update on public.orders
for each row
execute function public.update_orders_updated_at();

alter table public.orders enable row level security;

drop policy if exists orders_select_authenticated on public.orders;
create policy orders_select_authenticated
on public.orders
for select
to authenticated
using (true);

drop policy if exists orders_insert_authenticated on public.orders;
create policy orders_insert_authenticated
on public.orders
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists orders_delete_authenticated on public.orders;
create policy orders_delete_authenticated
on public.orders
for delete
to authenticated
using (true);

drop policy if exists orders_update_authenticated on public.orders;
create policy orders_update_authenticated
on public.orders
for update
to authenticated
using (true)
with check (true);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  item_price_pkr integer not null check (item_price_pkr > 0),
  quantity integer not null check (quantity > 0),
  line_total_pkr integer not null check (line_total_pkr > 0),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.order_items enable row level security;

drop policy if exists order_items_select_authenticated on public.order_items;
create policy order_items_select_authenticated
on public.order_items
for select
to authenticated
using (true);

drop policy if exists order_items_insert_authenticated on public.order_items;
create policy order_items_insert_authenticated
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.created_by = auth.uid()
  )
);

create index if not exists menu_items_category_idx on public.menu_items(category);
create index if not exists menu_items_available_idx on public.menu_items(is_available);
create index if not exists menu_categories_name_idx on public.menu_categories(name);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_created_by_idx on public.orders(created_by);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_menu_item_id_idx on public.order_items(menu_item_id);