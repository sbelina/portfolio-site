-- Trash (restorable for 30 days), due dates, and pictures from texts.
ALTER TABLE thoughts ADD COLUMN deleted_at INTEGER;
ALTER TABLE thoughts ADD COLUMN due_date TEXT CHECK (due_date IS NULL OR due_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]');
CREATE INDEX IF NOT EXISTS thoughts_deleted ON thoughts (deleted_at);
CREATE INDEX IF NOT EXISTS thoughts_due ON thoughts (due_date);
CREATE TABLE IF NOT EXISTS media (
  key TEXT PRIMARY KEY,           -- R2 object key: <thought id>/<media id>.<ext>
  thought_id TEXT NOT NULL REFERENCES thoughts (id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS media_thought ON media (thought_id);
