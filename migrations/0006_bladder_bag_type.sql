-- Add bag_type column to bladder_logs for day/night bag distinction
-- Nullable: existing rows default to "day" at the application layer
ALTER TABLE bladder_logs ADD COLUMN IF NOT EXISTS bag_type text;
