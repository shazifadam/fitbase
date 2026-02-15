-- Add workout_id column to attendance table
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS workout_id UUID;

-- Create workouts table (we'll use this later)
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_workouts_trainer_id ON workouts(trainer_id);
CREATE INDEX IF NOT EXISTS idx_workouts_client_id ON workouts(client_id);
CREATE INDEX IF NOT EXISTS idx_attendance_workout_id ON attendance(workout_id);

-- Add foreign key
ALTER TABLE attendance ADD CONSTRAINT fk_attendance_workout 
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL;
