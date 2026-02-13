-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tier_id UUID REFERENCES tiers(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'MVR',
  payment_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_trainer_month ON payments(trainer_id, payment_date);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Trainers can view own payments"
  ON payments FOR SELECT
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can create own payments"
  ON payments FOR INSERT
  WITH CHECK (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can update own payments"
  ON payments FOR UPDATE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can delete own payments"
  ON payments FOR DELETE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
