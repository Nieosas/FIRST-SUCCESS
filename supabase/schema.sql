-- ===========================================================================
-- PhoneDeck — phone accessories shop schema
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query).
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  category    text not null,
  price_cents integer not null check (price_cents >= 0),
  image_url   text,
  stock       integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users (id) on delete set null,
  email           text not null,
  customer_name   text not null,
  address_line1   text not null,
  address_line2   text,
  city            text not null,
  state           text,
  postal_code     text,
  country         text not null,
  subtotal_cents  integer not null check (subtotal_cents >= 0),
  shipping_cents  integer not null default 0 check (shipping_cents >= 0),
  total_cents     integer not null check (total_cents >= 0),
  status          text not null default 'confirmed',
  created_at      timestamptz not null default now()
);

create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  product_id       uuid references public.products (id) on delete set null,
  product_name     text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity         integer not null check (quantity > 0),
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists products_category_idx on public.products (category);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Products are publicly readable (catalog is public). Writes happen via the
-- service-role key in server code only.
drop policy if exists "products are publicly readable" on public.products;
create policy "products are publicly readable"
  on public.products for select using (true);

-- Users can only read their own orders.
drop policy if exists "users can read their own orders" on public.orders;
create policy "users can read their own orders"
  on public.orders for select using (auth.uid() = user_id);

-- Users can read order items belonging to their own orders.
drop policy if exists "users can read their own order items" on public.order_items;
create policy "users can read their own order items"
  on public.order_items for select
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Cart (per-user, shared across web + mobile)
-- ---------------------------------------------------------------------------

create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity   integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_user_product_key unique (user_id, product_id)
);

create index if not exists cart_items_user_id_idx on public.cart_items (user_id);

alter table public.cart_items enable row level security;

-- Users can only read/write their own cart rows.
drop policy if exists "users can read their own cart items" on public.cart_items;
create policy "users can read their own cart items"
  on public.cart_items for select using (auth.uid() = user_id);

drop policy if exists "users can insert their own cart items" on public.cart_items;
create policy "users can insert their own cart items"
  on public.cart_items for insert with check (auth.uid() = user_id);

drop policy if exists "users can update their own cart items" on public.cart_items;
create policy "users can update their own cart items"
  on public.cart_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users can delete their own cart items" on public.cart_items;
create policy "users can delete their own cart items"
  on public.cart_items for delete using (auth.uid() = user_id);

-- Expose cart_items to Supabase Realtime so cart changes sync instantly
-- across the web app and the mobile app. Idempotent.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'cart_items'
  ) then
    alter publication supabase_realtime add table public.cart_items;
  end if;
end;
$$;

-- Atomic cart helpers. They run with the caller's privileges (security
-- invoker), so row-level security still applies and auth.uid() scopes every
-- operation to the signed-in user.

create or replace function public.add_cart_item(p_product_id uuid, p_quantity integer default 1)
returns void
language sql
set search_path = public
as $$
  insert into public.cart_items (user_id, product_id, quantity)
  values (auth.uid(), p_product_id, greatest(coalesce(p_quantity, 1), 1))
  on conflict (user_id, product_id)
  do update set quantity = public.cart_items.quantity + excluded.quantity, updated_at = now();
$$;

create or replace function public.set_cart_quantity(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
set search_path = public
as $$
begin
  if coalesce(p_quantity, 0) <= 0 then
    delete from public.cart_items
    where user_id = auth.uid() and product_id = p_product_id;
  else
    insert into public.cart_items (user_id, product_id, quantity)
    values (auth.uid(), p_product_id, p_quantity)
    on conflict (user_id, product_id)
    do update set quantity = excluded.quantity, updated_at = now();
  end if;
end;
$$;

create or replace function public.remove_cart_item(p_product_id uuid)
returns void
language sql
set search_path = public
as $$
  delete from public.cart_items
  where user_id = auth.uid() and product_id = p_product_id;
$$;

create or replace function public.clear_cart()
returns void
language sql
set search_path = public
as $$
  delete from public.cart_items where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

insert into public.products (name, slug, description, category, price_cents, image_url, stock) values
  (
    'Clear Phone Case',
    'clear-phone-case',
    'Crystal-clear shock-absorbent case with raised edges to protect the screen and camera.',
    'Cases',
    1599,
    'https://images.unsplash.com/photo-1771142061210-95e97225641e?w=1080&q=80',
    120
  ),
  (
    'Tempered Glass Screen Protector',
    'tempered-glass-screen-protector',
    '9H-hardness tempered glass with oleophobic coating for a smooth, fingerprint-free finish.',
    'Screen Protectors',
    999,
    'https://images.unsplash.com/photo-1750041888982-67a58e6c9014?w=1080&q=80',
    200
  ),
  (
    'USB-C Fast Charger 30W',
    'usb-c-fast-charger-30w',
    'Compact 30W USB-C wall charger with GaN technology for fast, efficient charging.',
    'Chargers',
    2499,
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1080&q=80',
    90
  ),
  (
    'Braided USB-C Cable 2m',
    'braided-usb-c-cable-2m',
    'Durable braided 2-meter USB-C cable rated for 100W power delivery and fast data transfer.',
    'Cables',
    1299,
    'https://images.unsplash.com/photo-1572721546624-05bf65ad7679?w=1080&q=80',
    150
  ),
  (
    'MagSafe Wireless Charger',
    'magsafe-wireless-charger',
    'Magnetic 15W wireless charging pad that snaps into place for perfectly aligned charging.',
    'Chargers',
    3999,
    'https://images.unsplash.com/photo-1545235616-db3cd822ad8c?w=1080&q=80',
    75
  ),
  (
    'Power Bank 10000mAh',
    'power-bank-10000mah',
    'Slim 10000mAh portable battery with USB-C fast charging and dual output ports.',
    'Power Banks',
    2999,
    'https://images.unsplash.com/photo-1566554738544-d962991c3fee?w=1080&q=80',
    60
  ),
  (
    'Silicone Case',
    'silicone-case',
    'Soft-touch silicone case available in a range of colors with a microfiber lining.',
    'Cases',
    1499,
    'https://images.unsplash.com/photo-1535157412991-2ef801c1748b?w=1080&q=80',
    110
  ),
  (
    'Magnetic Car Mount',
    'magnetic-car-mount',
    'Strong magnetic vent mount that holds your phone securely while you drive.',
    'Mounts',
    1999,
    'https://images.unsplash.com/photo-1771227241320-8fc5388259c7?w=1080&q=80',
    80
  ),
  (
    'Wireless Earbuds',
    'wireless-earbuds',
    'True wireless earbuds with active noise cancellation and a 30-hour charging case.',
    'Audio',
    4999,
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=1080&q=80',
    45
  ),
  (
    'Bluetooth Speaker Mini',
    'bluetooth-speaker-mini',
    'Pocket-sized Bluetooth speaker with punchy sound and 12 hours of playback.',
    'Audio',
    3499,
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1080&q=80',
    55
  ),
  (
    'PopSocket Grip',
    'popsocket-grip',
    'Collapsible phone grip and stand that sticks to the back of your case.',
    'Grips',
    899,
    'https://images.unsplash.com/photo-1760744633470-86915d6446e3?w=1080&q=80',
    130
  ),
  (
    'Privacy Screen Protector',
    'privacy-screen-protector',
    'Tempered-glass privacy filter that keeps your screen visible only to you.',
    'Screen Protectors',
    1499,
    'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=1080&q=80',
    95
  )
on conflict (slug) do nothing;
