-- kyowa-menu-history Supabase Schema
-- Supabase URL: https://zzleqjendqkoizbdvblw.supabase.co
--
-- 注意: `menus` テーブルは既存のため、ここでは作成しません。
--       既存スキーマ:
--         menus (id bigint, date date, menu_name text, nutrition jsonb, created_at timestamptz)

-- =====================
-- 食事履歴テーブル（新規）
-- =====================
CREATE TABLE IF NOT EXISTS meal_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date           DATE NOT NULL UNIQUE,
  day_of_week    TEXT,
  user_name      TEXT,
  timestamp      TIMESTAMPTZ,
  settings       JSONB NOT NULL DEFAULT '{}',
  selected_menus JSONB NOT NULL DEFAULT '[]',
  totals         JSONB NOT NULL DEFAULT '{}',
  achievement    JSONB NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================
-- updated_at 自動更新トリガー
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meal_history_updated_at
  BEFORE UPDATE ON meal_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- Row Level Security
-- =====================
ALTER TABLE meal_history ENABLE ROW LEVEL SECURITY;

-- service_role は全操作可能（サーバーサイドからの書き込みに使用）
CREATE POLICY "service_role full access on meal_history"
  ON meal_history FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- anon / authenticated は読み取りのみ
CREATE POLICY "public read meal_history"
  ON meal_history FOR SELECT
  USING (true);
