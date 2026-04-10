-- ==========================================
-- CORRECTED REGISTRATION FIX
-- The column is "name" NOT "full_name"
-- ==========================================

-- 1. Fix the Sync Function (matching EXACT column names)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, alias, name, roll_number, avatar, xp, solved)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'alias', 'Scholar_' || substr(new.id::text, 1, 6)),
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(new.raw_user_meta_data->>'roll_number', 'UNKNOWN'),
    'https://api.dicebear.com/7.x/bottts/svg?seed=' || COALESCE(new.raw_user_meta_data->>'roll_number', new.id::text),
    0,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    alias = EXCLUDED.alias,
    name = EXCLUDED.name,
    roll_number = EXCLUDED.roll_number;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-link the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
