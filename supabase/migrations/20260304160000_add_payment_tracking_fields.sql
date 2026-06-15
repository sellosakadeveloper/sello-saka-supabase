-- Add payment tracking columns to competition_entries
ALTER TABLE competition_entries 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ticket_emailed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Make ticket_number nullable for entries that are pending payment
ALTER TABLE competition_entries ALTER COLUMN ticket_number DROP NOT NULL;

-- Add index on payment_reference for idempotency lookups
CREATE INDEX IF NOT EXISTS idx_competition_entries_payment_ref 
  ON competition_entries(payment_reference) 
  WHERE payment_reference IS NOT NULL;
