-- Create donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reference TEXT NOT NULL,
  merchant_ref TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UNPAID',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own donations
CREATE POLICY "Users can only see their own donations" ON donations
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own donations
CREATE POLICY "Users can insert their own donations" ON donations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for admin to see all donations
CREATE POLICY "Admin can see all donations" ON donations
  FOR SELECT USING (auth.email() = 'admin@faithjournal.com');

-- Create policy for admin to update all donations
CREATE POLICY "Admin can update all donations" ON donations
  FOR UPDATE USING (auth.email() = 'admin@faithjournal.com');

-- Create index for faster queries
CREATE INDEX donations_user_id_idx ON donations (user_id);
CREATE INDEX donations_reference_idx ON donations (reference);
CREATE INDEX donations_merchant_ref_idx ON donations (merchant_ref);
CREATE INDEX donations_status_idx ON donations (status);
CREATE INDEX donations_created_at_idx ON donations (created_at);
