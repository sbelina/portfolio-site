-- Private thought archive. Never part of the public build or repository content.
CREATE TABLE IF NOT EXISTS thoughts (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('text', 'web')),
  raw TEXT NOT NULL,              -- exactly as received; never edited
  body TEXT NOT NULL,             -- editable working copy
  title TEXT NOT NULL DEFAULT '',
  title_origin TEXT NOT NULL DEFAULT 'none' CHECK (title_origin IN ('none', 'ai', 'fallback', 'manual')),
  archived INTEGER NOT NULL DEFAULT 0,
  sorted INTEGER NOT NULL DEFAULT 0,
  message_id TEXT UNIQUE          -- email Message-ID, to ignore duplicate deliveries
);
CREATE INDEX IF NOT EXISTS thoughts_created ON thoughts (created_at DESC);
CREATE TABLE IF NOT EXISTS thought_tags (
  thought_id TEXT NOT NULL REFERENCES thoughts (id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('typed', 'ai', 'manual')),
  PRIMARY KEY (thought_id, tag)
);
CREATE INDEX IF NOT EXISTS thought_tags_tag ON thought_tags (tag);
CREATE TABLE IF NOT EXISTS system_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at INTEGER NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL
);
