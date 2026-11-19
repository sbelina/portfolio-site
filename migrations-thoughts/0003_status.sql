-- To do / Doing / Done. NULL means no status (a plain thought).
ALTER TABLE thoughts ADD COLUMN status TEXT CHECK (status IN ('todo', 'doing', 'done'));
CREATE INDEX IF NOT EXISTS thoughts_status ON thoughts (status, created_at DESC);
