-- =============================================================================
-- JTT Shop – Marketplace Migration Script
-- Run this on an EXISTING database to upgrade to marketplace architecture
-- Run in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- ─── Step 1: Add seller_id column to products ────────────────────────────────
alter table products add column if not exists seller_id text references profiles(id) on delete set null;

-- ─── Step 2: Create index on seller_id ───────────────────────────────────────
create index if not exists idx_products_seller on products(seller_id);

-- ─── Step 3: Backfill existing products with admin as owner ──────────────────
-- Assigns all existing products to the first admin user found
update products
set seller_id = (select id from profiles where role = 'admin' limit 1)
where seller_id is null;

-- ─── Step 4: Normalize roles (buyer/seller → user) ──────────────────────────
update profiles set role = 'user' where role in ('buyer', 'seller');

-- ─── Step 5: Update default role in profiles table ───────────────────────────
alter table profiles alter column role set default 'user';

-- ─── Step 6: Update profile sync trigger ─────────────────────────────────────
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

-- ─── Step 7: Drop old product RLS policies ───────────────────────────────────
drop policy if exists "Allow admin manage products" on products;
drop policy if exists "Allow public read products" on products;
drop policy if exists "Allow admin manage product_images" on product_images;
drop policy if exists "Allow public read product_images" on product_images;

-- ─── Step 8: Create new marketplace RLS policies for products ────────────────

-- SELECT: public
create policy "Allow public read products" on products for select using (true);

-- INSERT: any authenticated user (seller_id must match their own uid)
create policy "Allow auth insert products" on products for insert
  with check (auth.uid() is not null and seller_id = auth.uid()::text);

-- UPDATE: owner or admin only
create policy "Allow owner/admin update products" on products for update using (
  auth.uid()::text = seller_id
  or exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
);

-- DELETE: owner or admin only
create policy "Allow owner/admin delete products" on products for delete using (
  auth.uid()::text = seller_id
  or exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
);

-- ─── Step 9: Create new marketplace RLS policies for product_images ──────────

-- SELECT: public
create policy "Allow public read product_images" on product_images for select using (true);

-- INSERT: owner of parent product or admin
create policy "Allow product owner insert images" on product_images for insert
  with check (
    exists (
      select 1 from products
      where products.id = product_images.product_id
        and products.seller_id = auth.uid()::text
    )
    or exists (select 1 from profiles where id = auth.uid()::text and role = 'admin')
  );

-- DELETE: owner of parent product or admin
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

-- ─── Step 10: Create Supabase Storage bucket (optional — may need Dashboard) ─
-- Note: If this fails, create the bucket manually in Supabase Dashboard → Storage
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

-- ─── Done! ───────────────────────────────────────────────────────────────────
-- Verify: SELECT id, name, seller_id FROM products;
-- Verify: SELECT id, role FROM profiles;
