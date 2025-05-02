-- Create support_tickets table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own tickets
CREATE POLICY "Users can only see their own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own tickets
CREATE POLICY "Users can insert their own tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own tickets
CREATE POLICY "Users can update their own tickets" ON support_tickets
  FOR UPDATE USING (auth.uid() = user_id);

-- Create admin role (you'll need to assign this role to admin users)
-- This is commented out as it requires manual assignment in Supabase dashboard
-- CREATE ROLE admin;

-- Create policy for admins to see all tickets
-- Uncomment and modify this after creating admin users
-- CREATE POLICY "Admins can see all tickets" ON support_tickets
--   FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Create index for faster queries
CREATE INDEX support_tickets_user_id_idx ON support_tickets (user_id);
CREATE INDEX support_tickets_status_idx ON support_tickets (status);
CREATE INDEX support_tickets_created_at_idx ON support_tickets (created_at);
