-- Create policy for admin to see all tickets
CREATE POLICY "Admin can see all tickets" ON support_tickets
  FOR SELECT USING (auth.email() = 'admin@faithjournal.com');

-- Create policy for admin to update all tickets
CREATE POLICY "Admin can update all tickets" ON support_tickets
  FOR UPDATE USING (auth.email() = 'admin@faithjournal.com');
