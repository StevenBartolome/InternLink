-- Migration: 17_audit_logs.sql
-- Description: Creates the audit_logs table for tracking admin/system security events

CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name     TEXT,
  user_role     TEXT,
  action        TEXT NOT NULL,
  type          TEXT,
  affected_record TEXT,
  ip_address    TEXT,
  metadata      JSONB DEFAULT '{}'::jsonb,
  timestamp     TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast ordering and filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id   ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_type      ON audit_logs (type);

-- RLS: only admins can read audit logs; server writes via service role (bypasses RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
