-- Add current_weights JSONB column to attendance table to track weights for each exercise in a session
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS current_weights JSONB DEFAULT '{}';

-- Add a comment explaining the structure
COMMENT ON COLUMN attendance.current_weights IS 'Stores current weights for each exercise as {exercise_name: weight_value}';
