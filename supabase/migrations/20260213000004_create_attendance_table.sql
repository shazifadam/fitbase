-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'attended', 'missed', 'rescheduled')) DEFAULT 'scheduled',
  rescheduled_to TIMESTAMPTZ,
  rescheduled_from TIMESTAMPTZ,
  reschedule_reason TEXT,
  is_makeup_session BOOLEAN DEFAULT FALSE,
  original_session_id UUID REFERENCES attendance(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_attendance_client_id ON attendance(client_id);
CREATE INDEX idx_attendance_scheduled_date ON attendance(scheduled_date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_trainer_date ON attendance(trainer_id, scheduled_date);

-- Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Trainers can view own attendance"
  ON attendance FOR SELECT
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can create own attendance"
  ON attendance FOR INSERT
  WITH CHECK (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can update own attendance"
  ON attendance FOR UPDATE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can delete own attendance"
  ON attendance FOR DELETE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
