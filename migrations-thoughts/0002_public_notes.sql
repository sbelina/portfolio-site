-- Opt-in public field notes. A thought is public only when the owner marks it (#public or the switch).
ALTER TABLE thoughts ADD COLUMN public INTEGER NOT NULL DEFAULT 0;
ALTER TABLE thoughts ADD COLUMN published_at INTEGER;
CREATE INDEX IF NOT EXISTS thoughts_public ON thoughts (public, published_at DESC);
