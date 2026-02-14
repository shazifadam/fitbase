-- Add 'attending' to status enum
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_status_check 
  CHECK (status IN ('scheduled', 'attending', 'attended', 'missed', 'rescheduled'));

-- Add workout_started_at timestamp
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS workout_started_at TIMESTAMPTZ;
