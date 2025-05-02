# Faith Journal App

A web-based journal application that allows users to record their spiritual journey, track emotions, receive Bible verses based on their emotional state, save favorite verses, and view statistics about their journaling habits.

## Features

- **User Authentication**: Secure login and registration using Supabase Auth
- **Journal Entries**: Create and manage journal entries with emotion tracking
- **Bible Verse Recommendations**: Receive contextual Bible verses based on emotions
- **History**: View journal history and favorite verses
- **Statistics**: Visualize journaling trends and emotion distribution
- **Responsive Design**: Works on mobile and desktop devices

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Charts**: Recharts for data visualization
- **UI Components**: Shadcn UI

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- (Optional) Mistral AI API key for enhanced verse recommendations

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/faith-journal.git
   cd faith-journal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on the example:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update the `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   MISTRAL_API_KEY=your-mistral-api-key (optional)
   ```

5. Set up your Supabase database with the following tables:
   - `users`: Managed by Supabase Auth
   - `journal_entries`: For storing journal entries
   - `bible_verses`: For storing Bible verses
   - `favorite_verses`: For storing user's favorite verses

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Users Table
- Managed by Supabase Auth

### Journal Entries Table
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  situation TEXT NOT NULL,
  emotion TEXT NOT NULL,
  reflection TEXT,
  verse_id UUID REFERENCES bible_verses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own entries
CREATE POLICY "Users can only see their own entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own entries
CREATE POLICY "Users can insert their own entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own entries
CREATE POLICY "Users can update their own entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own entries
CREATE POLICY "Users can delete their own entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);
```

### Bible Verses Table
```sql
CREATE TABLE bible_verses (
  id UUID PRIMARY KEY,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  emotion_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security
ALTER TABLE bible_verses ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to read verses
CREATE POLICY "Anyone can read verses" ON bible_verses
  FOR SELECT USING (true);
```

### Favorite Verses Table
```sql
CREATE TABLE favorite_verses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  verse_id UUID REFERENCES bible_verses(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

-- Add Row Level Security
ALTER TABLE favorite_verses ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own favorites
CREATE POLICY "Users can only see their own favorites" ON favorite_verses
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own favorites
CREATE POLICY "Users can insert their own favorites" ON favorite_verses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON favorite_verses
  FOR DELETE USING (auth.uid() = user_id);
```

## Deployment

This application can be deployed on Vercel with a Supabase backend.

1. Create a Vercel account and link your repository
2. Set up the environment variables in Vercel
3. Deploy the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Bible verses data sourced from various public domain Bible APIs
- UI inspiration from modern journaling applications# FaithJournal
