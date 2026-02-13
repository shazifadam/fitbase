-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  tier_id UUID REFERENCES tiers(id) ON DELETE SET NULL,
  training_programs TEXT[] DEFAULT '{}',
  schedule_set TEXT CHECK (schedule_set IN ('sunday', 'saturday', 'custom')) NOT NULL,
  custom_days TEXT[] DEFAULT '{}',
  session_times JSONB DEFAULT '{}',
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  current_weight DECIMAL(5,2),
  current_waist DECIMAL(5,2),
  current_fat_percent DECIMAL(5,2),
  current_height DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trainer_id, phone)
);

-- Indexes
CREATE INDEX idx_clients_trainer_id ON clients(trainer_id);
CREATE INDEX idx_clients_archived ON clients(is_archived);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_tier_id ON clients(tier_id);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Trainers can view own clients"
  ON clients FOR SELECT
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can create own clients"
  ON clients FOR INSERT
  WITH CHECK (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can update own clients"
  ON clients FOR UPDATE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can delete own clients"
  ON clients FOR DELETE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
