-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survivor_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  guardian_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  diagnosis_details TEXT NOT NULL,
  treatment_details TEXT NOT NULL,
  current_challenges TEXT NOT NULL,
  programs_interested TEXT[] NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  donation_type TEXT NOT NULL, -- 'once' or 'monthly'
  payment_method TEXT, -- 'card', 'eft', 'payfast', 'paypal'
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create competition_entries table
CREATE TABLE IF NOT EXISTS competition_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  proof_of_payment_url TEXT,
  ticket_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_entries ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow public insert, allow admin select)
-- Contact Messages
CREATE POLICY "Allow public insert for contact_messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin select for contact_messages" ON contact_messages
  FOR SELECT USING (auth.role() = 'authenticated'); -- Assuming authenticated users are admins for now, or we can refine this

-- Applications
CREATE POLICY "Allow public insert for applications" ON applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin select for applications" ON applications
  FOR SELECT USING (auth.role() = 'authenticated');

-- Donations
CREATE POLICY "Allow public insert for donations" ON donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin select for donations" ON donations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Competition Entries
CREATE POLICY "Allow public insert for competition_entries" ON competition_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin select for competition_entries" ON competition_entries
  FOR SELECT USING (auth.role() = 'authenticated');
