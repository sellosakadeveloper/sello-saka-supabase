CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_reference TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('payfast', 'paystack')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  purpose TEXT NOT NULL CHECK (purpose IN ('donation', 'competition_entry')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  payer_name TEXT NOT NULL,
  payer_email TEXT NOT NULL,
  payer_phone TEXT,
  donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
  competition_entry_id UUID REFERENCES public.competition_entries(id) ON DELETE SET NULL,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
  provider_payment_id TEXT,
  provider_status TEXT,
  provider_payload JSONB,
  return_url TEXT,
  cancel_url TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT payment_records_single_target CHECK (
    (CASE WHEN donation_id IS NULL THEN 0 ELSE 1 END) +
    (CASE WHEN competition_entry_id IS NULL THEN 0 ELSE 1 END) = 1
  ),
  CONSTRAINT payment_records_purpose_target_match CHECK (
    (purpose = 'donation' AND donation_id IS NOT NULL AND competition_entry_id IS NULL) OR
    (purpose = 'competition_entry' AND competition_entry_id IS NOT NULL AND donation_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_payment_records_provider ON public.payment_records(provider);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON public.payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_purpose ON public.payment_records(purpose);
CREATE INDEX IF NOT EXISTS idx_payment_records_provider_payment_id ON public.payment_records(provider_payment_id);

ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment records"
  ON public.payment_records FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

ALTER TABLE public.competition_entries
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS ticket_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ticket_emailed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

UPDATE public.competition_entries
SET
  name = COALESCE(name, full_name),
  full_name = COALESCE(full_name, name)
WHERE name IS NULL OR full_name IS NULL;

ALTER TABLE public.competition_entries
  ALTER COLUMN ticket_number DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_competition_entries_payment_ref
  ON public.competition_entries(payment_reference)
  WHERE payment_reference IS NOT NULL;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_payment_records_updated_at ON public.payment_records;
CREATE TRIGGER update_payment_records_updated_at
  BEFORE UPDATE ON public.payment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_donations_updated_at ON public.donations;
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_competition_entries_updated_at ON public.competition_entries;
CREATE TRIGGER update_competition_entries_updated_at
  BEFORE UPDATE ON public.competition_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
