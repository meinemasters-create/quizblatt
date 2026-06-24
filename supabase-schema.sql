-- ============================================================
-- Quizblatt Generator – Supabase SQL Schema
-- Im Supabase SQL-Editor ausführen (einmalig)
-- ============================================================

-- 1. PIN-Sharing Sessions (kein RLS, Zugriff nur über service_role in Functions)
CREATE TABLE IF NOT EXISTS quiz_sessions (
  pin        TEXT        PRIMARY KEY,
  questions  JSONB       NOT NULL,
  opts       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alte Sessions automatisch löschen (nach 7 Tagen)
-- (Optional: Supabase Scheduled Functions oder pg_cron verwenden)

-- 2. Quiz-Ordner für angemeldete Nutzer
CREATE TABLE IF NOT EXISTS quiz_folders (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Gespeicherte Quizze
CREATE TABLE IF NOT EXISTS saved_quizzes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id  UUID        REFERENCES quiz_folders(id) ON DELETE SET NULL,
  title      TEXT        NOT NULL,
  questions  JSONB       NOT NULL,
  opts       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Row Level Security aktivieren ───────────────────────────────────────────
ALTER TABLE quiz_folders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_quizzes ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies: Jeder Nutzer sieht nur seine eigenen Daten ────────────────
CREATE POLICY "Eigene Ordner lesen und verwalten"
  ON quiz_folders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Eigene Quizze lesen und verwalten"
  ON saved_quizzes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Hinweis ─────────────────────────────────────────────────────────────────
-- Supabase aktiviert E-Mail-Bestätigung standardmäßig.
-- Für den Schulbetrieb: Authentication → Email → "Enable email confirmations" deaktivieren
-- Oder: Magic-Link-Login aktivieren (sicherer, kein Passwort nötig)
