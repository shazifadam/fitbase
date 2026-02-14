-- Insert default tiers
-- Note: This will only work if a trainer exists
-- We'll make tier_id nullable in clients table for now

-- Make tier_id nullable in clients table
ALTER TABLE clients ALTER COLUMN tier_id DROP NOT NULL;
