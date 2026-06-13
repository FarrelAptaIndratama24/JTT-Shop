-- =============================================================================
-- JTT Shop – Supabase Schema (Marketplace Edition)
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- Drop existing trigger/functions if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ─── PROFILES (formerly users) ──────────────────────────────────────────────────
create table if not exists profiles (
  id          text        primary key,           -- Supports UUID strings and seed IDs ("u1")
  username    text,
  full_name   text        not null,
  avatar_url  text,
  role        text        not null default 'user',  -- user | admin
  created_at  timestamptz not null default now()
);

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────
create table if not exists categories (
  id    text primary key,                        -- e.g. "cat-1"
  name  text not null unique,
  slug  text not null unique
);

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────
create table if not exists products (
  id            text        primary key,         -- e.g. "p1"
  name          text        not null,
  slug          text        not null unique,
  description   text,
  price         numeric     not null,
  rating        numeric     default 0,
  reviews_count integer     default 0,
  brand         text,
  image_url     text,
  category_id   text        references categories(id) on delete set null,
  seller_id     text        references profiles(id) on delete set null, -- Product owner
  specs         jsonb,                           -- { weight, length, tip, joint, shaft }
  features      jsonb,                           -- text[]
  stock         integer     not null default 0,
  created_at    timestamptz not null default now()
);

-- ─── PRODUCT IMAGES ──────────────────────────────────────────────────────────
create table if not exists product_images (
  id           text        primary key,
  product_id   text        references products(id) on delete cascade,
  image_url    text        not null,
  is_thumbnail boolean     default false
);

-- ─── COMMUNITY POSTS ─────────────────────────────────────────────────────────
create table if not exists community_posts (
  id             text        primary key,        -- e.g. "post1"
  user_id        text        references profiles(id) on delete cascade,
  title          text        not null,
  content        text,
  likes          integer     default 0,
  comments_count integer     default 0,
  tags           jsonb,                          -- fallback jsonb
  created_at     timestamptz not null default now()
);

-- ─── COMMUNITY TAGS ──────────────────────────────────────────────────────────
create table if not exists community_tags (
  id      text primary key,
  post_id text references community_posts(id) on delete cascade,
  tag     text not null
);

-- ─── COMMENTS (includes replies via parent_id) ────────────────────────────────
create table if not exists comments (
  id          text        primary key,           -- e.g. "c1", "r1"
  product_id  text        references products(id) on delete cascade,
  post_id     text        references community_posts(id) on delete cascade,
  user_id     text        references profiles(id) on delete cascade,
  content     text        not null,
  parent_id   text        references comments(id) on delete cascade,  -- null = top-level
  created_at  timestamptz not null default now()
);

-- ─── ORDERS (Phase 2 Addition) ───────────────────────────────────────────────
create table if not exists orders (
  id               text        primary key,
  user_id          text        references profiles(id) on delete cascade,
  total_price      numeric     not null,
  status           text        not null default 'pending',  -- pending | completed | cancelled
  whatsapp_message text,
  shipping_address text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── ORDER ITEMS (Phase 2 Addition) ──────────────────────────────────────────
create table if not exists order_items (
  id             text    primary key,
  order_id       text    references orders(id) on delete cascade,
  product_id     text    references products(id) on delete cascade,
  quantity       integer not null default 1,
  price_snapshot numeric not null
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_seller   on products(seller_id);
create index if not exists idx_comments_product  on comments(product_id);
create index if not exists idx_comments_post     on comments(post_id);
create index if not exists idx_comments_parent   on comments(parent_id);
create index if not exists idx_posts_user        on community_posts(user_id);
create index if not exists idx_tags_post         on community_tags(post_id);
create index if not exists idx_images_product    on product_images(product_id);
create index if not exists idx_orders_user       on orders(user_id);
create index if not exists idx_order_items_order on order_items(order_id);

-- ─── Profile Sync Trigger on Signup ──────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url, role, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Enable Row Level Security (RLS) ──────────────────────────────────────────
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table community_posts enable row level security;
alter table community_tags enable row level security;
alter table comments enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- ─── RLS Policies ────────────────────────────────────────────────────────────

-- 1. Profiles Policies
create policy "Allow public read profiles" on profiles for select using (true);
create policy "Allow auth insert own profile" on profiles for insert with check (auth.uid()::text = id);
create policy "Allow owner update own profile" on profiles for update using (auth.uid()::text = id);

-- 2. Categories Policies
create policy "Allow public read categories" on categories for select using (true);
create policy "Allow admin manage categories" on categories for all using (
  exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
);

-- 3. Products Policies (Marketplace: ownership-based)
create policy "Allow public read products" on products for select using (true);

create policy "Allow auth insert products" on products for insert
  with check (auth.uid() is not null and seller_id = auth.uid()::text);

create policy "Allow owner/admin update products" on products for update using (
  auth.uid()::text = seller_id
  or exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
);

create policy "Allow owner/admin delete products" on products for delete using (
  auth.uid()::text = seller_id
  or exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
);

-- 4. Product Images Policies (ownership via parent product)
create policy "Allow public read product_images" on product_images for select using (true);

create policy "Allow product owner insert images" on product_images for insert
  with check (
    exists (
      select 1 from products
      where products.id = product_images.product_id
        and products.seller_id = auth.uid()::text
    )
    or exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
  );

create policy "Allow owner/admin delete product_images" on product_images for delete using (
  exists (
    select 1 from products
    where products.id = product_images.product_id
      and (
        products.seller_id = auth.uid()::text
        or exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
      )
  )
);

-- 5. Community Posts Policies
create policy "Allow public read community_posts" on community_posts for select using (true);
create policy "Allow auth insert community_posts" on community_posts for insert with check (auth.uid() is not null);
create policy "Allow owner/admin manage community_posts" on community_posts for all using (
  auth.uid()::text = user_id or exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
);

-- 6. Community Tags Policies
create policy "Allow public read community_tags" on community_tags for select using (true);
create policy "Allow auth manage community_tags" on community_tags for all using (auth.uid() is not null);

-- 7. Comments Policies
create policy "Allow public read comments" on comments for select using (true);
create policy "Allow auth insert comments" on comments for insert with check (auth.uid() is not null);
create policy "Allow owner/admin manage comments" on comments for all using (
  auth.uid()::text = user_id or exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
);

-- 8. Orders Policies
create policy "Allow owner/admin read own orders" on orders for select using (
  auth.uid()::text = user_id or exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
);
create policy "Allow auth insert own orders" on orders for insert with check (auth.uid()::text = user_id);
create policy "Allow admin update orders" on orders for update using (
  exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
);

-- 9. Order Items Policies
create policy "Allow owner/admin read own order_items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and (orders.user_id = auth.uid()::text or exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')))
);
create policy "Allow auth insert order_items" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()::text)
);
