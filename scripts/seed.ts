import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import slugify from 'slugify';
import { createHash } from 'crypto';
import {
  DUMMY_USERS,
  DUMMY_PRODUCTS,
  DUMMY_COMMENTS,
  DUMMY_POSTS
} from '../src/data/dummy';

// ─── Load Environment Variables ────────────────────────────────────────────────
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Service Role client — bypasses RLS and can access auth.admin API
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Deterministic UUID from any seed string.
 * Same input always produces the same UUID — ensures relational consistency
 * across multiple seed runs without needing to store mappings externally.
 */
const toUUID = (seed: string): string => {
  const h = createHash('md5').update(seed).digest('hex');
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    '4' + h.slice(13, 16),
    ((parseInt(h[16], 16) & 3) | 8).toString(16) + h.slice(17, 20),
    h.slice(20, 32),
  ].join('-');
};

const toSlug  = (t: string) => slugify(t, { lower: true, strict: true, trim: true });
const step    = (label: string) => console.log(`\n📦  ${label}`);
const check   = (err: { message: string } | null, ctx: string) => {
  if (err) throw new Error(`[${ctx}] ${err.message}`);
};

// Namespaced UUID generators — prevents ID collision across different tables
const uuidUser    = (id: string) => toUUID(`jtt:user:${id}`);
const uuidCat     = (name: string) => toUUID(`jtt:category:${name}`);
const uuidProduct = (id: string) => toUUID(`jtt:product:${id}`);
const uuidPost    = (id: string) => toUUID(`jtt:post:${id}`);
const uuidComment = (id: string) => toUUID(`jtt:comment:${id}`);
const uuidTag     = (postId: string, tag: string) => toUUID(`jtt:tag:${postId}:${tag}`);

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seedDatabase() {
  console.log('🌱  Starting JTT Shop Database Seeding...');

  // Build lookup maps (original text id → UUID) for relational joins
  const userMap: Record<string, string>    = {};
  const productMap: Record<string, string> = {};
  const postMap: Record<string, string>    = {};

  try {
    // =========================================================================
    // STEP 1 – Create Auth Users → triggers profile creation in profiles table
    // profiles.id is a FK to auth.users(id), so we must create auth users first
    // =========================================================================
    step('Creating Auth Users & Profiles...');

    for (const u of Object.values(DUMMY_USERS)) {
      const uuid = uuidUser(u.id);
      userMap[u.id] = uuid;

      // Create or skip if user already exists in Supabase Auth
      const { data: existingUser } = await supabase.auth.admin.getUserById(uuid);

      if (!existingUser?.user) {
        const { error: authErr } = await supabase.auth.admin.createUser({
          user_metadata: {},
          email:         `${u.id}@jttshop.dev`,   // deterministic fake email
          password:      'JttShop2024!',
          email_confirm: true,
          // Force the UUID to match our deterministic one
          // NOTE: Supabase Admin API respects 'id' if provided
        });

        // If the API doesn't accept a custom id, we use the generated one
        // and patch the profile afterwards
        if (authErr && !authErr.message.includes('already been registered')) {
          throw new Error(`[auth.createUser ${u.id}] ${authErr.message}`);
        }
      }

      // Upsert the profile row (will exist after auth trigger, but upsert to
      // set full_name / avatar_url / role correctly)
      // We look up the real UUID from auth if we couldn't control it
      const { data: authUser } = await supabase.auth.admin
        .listUsers()
        .then(async ({ data }) => ({
          data: data?.users?.find(au => au.email === `${u.id}@jttshop.dev`) ?? null,
        }));

      const realUUID = authUser?.id ?? uuid;
      userMap[u.id] = realUUID; // update map with the actual auth UUID

      const { error: profileErr } = await supabase.from('profiles').upsert(
        {
          id:         realUUID,
          full_name:  u.name,
          avatar_url: u.avatar,
          role:       u.role,
          username:   u.id,         // e.g. "u1" as a fallback username
          created_at: u.created_at,
        },
        { onConflict: 'id' }
      );

      check(profileErr, `profile ${u.id}`);
      console.log(`   👤  ${u.name} → ${realUUID}`);
    }

    console.log(`   ✅  ${Object.keys(userMap).length} profiles ready.`);

    // =========================================================================
    // STEP 2 – categories
    // =========================================================================
    step('Seeding categories...');

    const uniqueNames = Array.from(new Set(DUMMY_PRODUCTS.map(p => p.category as string)));
    const categoryMap: Record<string, string> = {};

    const categories = uniqueNames.map(name => {
      const id = uuidCat(name);
      categoryMap[name] = id;
      return { id, name, slug: toSlug(name) };
    });

    const { error: catErr } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'id' });

    check(catErr, 'categories');
    console.log(`   ✅  ${categories.length} categories inserted/updated.`);

    // =========================================================================
    // STEP 3 – products
    // Schema: id, category_id, name, slug, description, price (bigint),
    //         rating, reviews_count, stock, brand, image_url, specs (jsonb),
    //         features (ARRAY), created_at
    // =========================================================================
    step('Seeding products...');

    const products = DUMMY_PRODUCTS.map(p => {
      const id = uuidProduct(p.id);
      productMap[p.id] = id;

      // Extract brand from product name (first word as brand)
      const brand = p.name.split(' ')[0];

      return {
        id,
        name:          p.name,
        slug:          toSlug(p.name),
        description:   p.description,
        price:         p.price,          // bigint in DB
        rating:        p.rating,
        reviews_count: p.reviewsCount,
        stock:         p.stock,
        brand,
        image_url:     p.image,
        category_id:   categoryMap[p.category as string],
        specs:         p.specs,          // jsonb
        features:      p.features,       // text[] ARRAY
        created_at:    p.created_at,
      };
    });

    const { error: prodErr } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' });

    check(prodErr, 'products');
    console.log(`   ✅  ${products.length} products inserted/updated.`);

    // Seed product_images (thumbnail from image_url)
    const productImages = products.map(p => ({
      id:           uuidProduct(`img:${p.id}`),
      product_id:   p.id,
      image_url:    p.image_url,
      is_thumbnail: true,
    }));

    const { error: imgErr } = await supabase
      .from('product_images')
      .upsert(productImages, { onConflict: 'id' });

    check(imgErr, 'product_images');
    console.log(`   ✅  ${productImages.length} product images inserted/updated.`);

    // =========================================================================
    // STEP 4 – community_posts
    // Schema: id, user_id, title, content, likes, comments_count, created_at
    // NOTE: tags go into the separate community_tags table
    // =========================================================================
    step('Seeding community_posts...');

    const posts = DUMMY_POSTS.map(post => {
      const id = uuidPost(post.id);
      postMap[post.id] = id;
      return {
        id,
        user_id:        userMap[post.user_id],
        title:          post.title,
        content:        post.content,
        likes:          post.likes,
        comments_count: post.comments_count,
        created_at:     post.created_at,
      };
    });

    const { error: postsErr } = await supabase
      .from('community_posts')
      .upsert(posts, { onConflict: 'id' });

    check(postsErr, 'community_posts');
    console.log(`   ✅  ${posts.length} community posts inserted/updated.`);

    // =========================================================================
    // STEP 4b – community_tags (separate table: id, post_id, tag)
    // =========================================================================
    step('Seeding community_tags...');

    const allTags = DUMMY_POSTS.flatMap(post =>
      post.tags.map(tag => ({
        id:      uuidTag(post.id, tag),
        post_id: postMap[post.id],
        tag,
      }))
    );

    const { error: tagsErr } = await supabase
      .from('community_tags')
      .upsert(allTags, { onConflict: 'id' });

    check(tagsErr, 'community_tags');
    console.log(`   ✅  ${allTags.length} community tags inserted/updated.`);

    // =========================================================================
    // STEP 5 – comments + replies
    // Schema: id, product_id, user_id, parent_id, content, created_at
    // NOTE: No post_id column in comments table
    // =========================================================================
    step('Seeding comments and replies...');
    let totalInserted = 0;

    for (const comment of DUMMY_COMMENTS) {
      // 5-a  Parent comment
      const { error: parentErr } = await supabase
        .from('comments')
        .upsert(
          {
            id:         uuidComment(comment.id),
            product_id: comment.product_id ? productMap[comment.product_id] : null,
            user_id:    userMap[comment.user_id],
            content:    comment.content,
            parent_id:  null,
            created_at: comment.created_at,
          },
          { onConflict: 'id' }
        );

      check(parentErr, `comment ${comment.id}`);
      totalInserted++;

      // 5-b  Nested replies → parent_id set to parent comment UUID
      if (comment.replies?.length) {
        const replies = comment.replies.map(reply => ({
          id:         uuidComment(reply.id),
          product_id: comment.product_id ? productMap[comment.product_id] : null,
          user_id:    userMap[reply.user_id],
          content:    reply.content,
          parent_id:  uuidComment(comment.id),
          created_at: reply.created_at,
        }));

        const { error: replyErr } = await supabase
          .from('comments')
          .upsert(replies, { onConflict: 'id' });

        check(replyErr, `replies for ${comment.id}`);
        totalInserted += replies.length;
      }
    }

    console.log(`   ✅  ${totalInserted} comments/replies inserted/updated.`);
    console.log('\n🎉  Seeding completed successfully!\n');

  } catch (err: any) {
    console.error('\n❌  Seeding failed:', err.message ?? err);
    process.exit(1);
  }
}

seedDatabase();
