-- Add is_standby column to workspaces table
-- Used to visually mark paused clients (e.g. Ecomfisc) without removing them from the DB

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS is_standby boolean NOT NULL DEFAULT false;

-- Mark Ecomfisc as standby
UPDATE workspaces
  SET is_standby = true
  WHERE lower(name) = 'ecomfisc' OR lower(slug) = 'ecomfisc';
