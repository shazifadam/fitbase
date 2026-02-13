-- Create progress table
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  weight DECIMAL(5,2),
  waist DECIMAL(5,2),
  fat_percent DECIMAL(5,2),
  height DECIMAL(5,2),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_progress_client_id ON progress(client_id);
CREATE INDEX idx_progress_recorded_at ON progress(recorded_at);

-- Enable RLS
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Trainers can view client progress"
  ON progress FOR SELECT
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can create client progress"
  ON progress FOR INSERT
  WITH CHECK (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can update client progress"
  ON progress FOR UPDATE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can delete client progress"
  ON progress FOR DELETE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
