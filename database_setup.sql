-- ゴルフコンペアプリ用データベース設定

-- アプリケーション状態テーブル
CREATE TABLE app_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count INTEGER DEFAULT 0,
  name TEXT DEFAULT '',
  display_name TEXT DEFAULT '',
  player_scores JSONB DEFAULT '[]',
  score_records JSONB DEFAULT '[]',
  groups JSONB DEFAULT '[]',
  current_hole INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スコアテーブル
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS（Row Level Security）を無効化（開発用）
ALTER TABLE app_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE scores DISABLE ROW LEVEL SECURITY;

-- 初期データを挿入
INSERT INTO app_state (id, count, name, display_name, player_scores, score_records, groups, current_hole)
VALUES (1, 0, '', '', '[]', '[]', '[]', 1)
ON CONFLICT (id) DO NOTHING;
