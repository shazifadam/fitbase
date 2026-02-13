-- Create tiers table
CREATE TABLE IF NOT EXISTS tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  max_concurrent_clients INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tiers_trainer_id ON tiers(trainer_id);

-- Enable RLS
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Trainers can view own tiers"
  ON tiers FOR SELECT
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can create own tiers"
  ON tiers FOR INSERT
  WITH CHECK (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can update own tiers"
  ON tiers FOR UPDATE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can delete own tiers"
  ON tiers FOR DELETE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_tiers_updated_at
  BEFORE UPDATE ON tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
