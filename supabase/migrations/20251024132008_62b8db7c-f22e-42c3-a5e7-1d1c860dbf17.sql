-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create practice_words table
CREATE TABLE public.practice_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  phonetic TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on practice_words
ALTER TABLE public.practice_words ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read words
CREATE POLICY "Anyone can view practice words"
  ON public.practice_words FOR SELECT
  USING (true);

-- Create practice_sessions table
CREATE TABLE public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES public.practice_words(id),
  phrase TEXT NOT NULL,
  accuracy_score INTEGER NOT NULL,
  pronunciation_score INTEGER NOT NULL,
  clarity_score INTEGER NOT NULL,
  fluency_score INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on practice_sessions
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Session policies
CREATE POLICY "Users can view own sessions"
  ON public.practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read achievements
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- User achievements policies
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample practice words (Phoenix-themed dataset)
INSERT INTO public.practice_words (word, difficulty_level, phonetic, category) VALUES
  ('phoenix', 1, 'FEE-niks', 'mythology'),
  ('flame', 1, 'flaym', 'nature'),
  ('soar', 1, 'sawr', 'action'),
  ('rebirth', 2, 'REE-burth', 'concept'),
  ('magnificent', 2, 'mag-NIF-ih-sent', 'adjective'),
  ('resilient', 2, 'rih-ZIL-yent', 'adjective'),
  ('transformation', 3, 'trans-for-MAY-shun', 'concept'),
  ('perseverance', 3, 'pur-suh-VEER-ens', 'concept'),
  ('luminescent', 3, 'loo-mih-NES-ent', 'adjective'),
  ('chrysalis', 3, 'KRIS-uh-lis', 'nature');

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
  ('First Words', 'Complete your first practice session', 'Trophy', 'sessions_completed', 1, 50),
  ('Practice Makes Perfect', 'Complete 10 practice sessions', 'Award', 'sessions_completed', 10, 100),
  ('Clear Speaker', 'Achieve 90% accuracy in a session', 'Star', 'accuracy_score', 90, 150),
  ('Week Warrior', 'Maintain a 7-day streak', 'Flame', 'streak_days', 7, 200),
  ('Phoenix Rising', 'Complete 50 practice sessions', 'Zap', 'sessions_completed', 50, 500);