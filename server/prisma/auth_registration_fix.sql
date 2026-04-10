-- ==========================================
-- REGISTRATION SYNC FIX
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Ensure Profiles table has required structure
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='roll_number') THEN
        ALTER TABLE public.profiles ADD COLUMN roll_number TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='alias') THEN
        ALTER TABLE public.profiles ADD COLUMN alias TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='xp') THEN
        ALTER TABLE public.profiles ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='solved') THEN
        ALTER TABLE public.profiles ADD COLUMN solved INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Create / Update the Sync Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar, roll_number, alias, xp, solved)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown User'), 
    COALESCE(
      'https://api.dicebear.com/7.x/bottts/svg?seed=' || (new.raw_user_meta_data->>'roll_number'), 
      'https://api.dicebear.com/7.x/bottts/svg?seed=GhostNinja'
    ), 
    COALESCE(new.raw_user_meta_data->>'roll_number', 'EXT-' || gen_random_uuid()), 
    COALESCE(new.raw_user_meta_data->>'alias', 'Scholar_' || substr(new.id::text, 1, 6)),
    0,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    alias = EXCLUDED.alias,
    roll_number = EXCLUDED.roll_number;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-link the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Fix current nulls if any
UPDATE public.profiles SET xp = 0 WHERE xp IS NULL;
UPDATE public.profiles SET solved = 0 WHERE solved IS NULL;
