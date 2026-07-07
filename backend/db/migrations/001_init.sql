CREATE TABLE IF NOT EXISTS spec_history (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  spec TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_spec_history_created_at ON spec_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spec_history_url ON spec_history(url);
