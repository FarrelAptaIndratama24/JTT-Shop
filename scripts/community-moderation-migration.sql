-- ============================================================
-- Migration: Create community_moderation table
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS community_moderation (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content_type  TEXT NOT NULL DEFAULT 'post'
                CHECK (content_type IN ('post', 'comment')),
  title         TEXT,
  content       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'reported')),
  report_count  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_moderation_status
  ON community_moderation(status);

CREATE INDEX IF NOT EXISTS idx_community_moderation_user_id
  ON community_moderation(user_id);

CREATE INDEX IF NOT EXISTS idx_community_moderation_created_at
  ON community_moderation(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_moderation_content_type
  ON community_moderation(content_type);

-- 3. Enable Row Level Security
ALTER TABLE community_moderation ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Admin/moderator can read all rows
CREATE POLICY "Admin and moderator can read all moderation items"
  ON community_moderation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Admin/moderator can update status
CREATE POLICY "Admin and moderator can update moderation items"
  ON community_moderation FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Admin/moderator can delete
CREATE POLICY "Admin and moderator can delete moderation items"
  ON community_moderation FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Any authenticated user can insert (e.g. when reporting or creating content)
CREATE POLICY "Authenticated users can insert moderation items"
  ON community_moderation FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Seed sample data for testing (optional — remove in production)
-- Uncomment the block below to insert test data

/*
INSERT INTO community_moderation (user_id, content_type, title, content, status, report_count)
VALUES
  (
    (SELECT id FROM profiles LIMIT 1),
    'post',
    'Tips merawat cue carbon',
    'Berikut adalah beberapa tips untuk merawat cue carbon agar tetap awet dan performa tetap optimal. Pertama, selalu gunakan tip cleaner setelah bermain. Kedua, simpan cue di tempat yang tidak lembab.',
    'pending',
    0
  ),
  (
    (SELECT id FROM profiles LIMIT 1),
    'comment',
    NULL,
    'Setuju banget! Cue carbon memang butuh perawatan khusus. Saya sudah pakai metode ini dan hasilnya sangat memuaskan.',
    'approved',
    0
  ),
  (
    (SELECT id FROM profiles LIMIT 1),
    'post',
    'Jual cue bekas murah',
    'Ini konten spam yang menjual barang di luar platform. Harap dihapus oleh moderator.',
    'reported',
    3
  ),
  (
    (SELECT id FROM profiles LIMIT 1),
    'comment',
    NULL,
    'Komentar yang tidak pantas dan melanggar aturan komunitas.',
    'rejected',
    1
  );
*/
