-- ==========================================
-- UNIVERSAL BACKEND RESET & SYNC SCRIPT
-- ==========================================

-- 1. CLEANUP (Restarting sequences to fix 409 Conflict)
TRUNCATE public.comments, public.posts RESTART IDENTITY CASCADE;

-- 2. ENSURE POSTS SCHEMA
-- If columns exist, they'll stay. If not, they'll be added.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='upvotes') THEN
        ALTER TABLE public.posts ADD COLUMN upvotes INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='upvoted_by') THEN
        ALTER TABLE public.posts ADD COLUMN upvoted_by TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='is_solved') THEN
        ALTER TABLE public.posts ADD COLUMN is_solved BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. ENSURE PROFILES SCHEMA
ALTER TABLE public.profiles ALTER COLUMN xp SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN solved SET DEFAULT 0;
UPDATE public.profiles SET xp = COALESCE(xp, 0), solved = COALESCE(solved, 0);

-- 4. RPC: handle_upvote
CREATE OR REPLACE FUNCTION public.handle_upvote(target_post_id BIGINT, user_alias TEXT)
RETURNS json AS $$
DECLARE
    updated_post RECORD;
BEGIN
    -- Update post
    UPDATE public.posts
    SET 
        upvotes = COALESCE(upvotes, 0) + 1,
        upvoted_by = array_append(COALESCE(upvoted_by, ARRAY[]::TEXT[]), user_alias)
    WHERE id = target_post_id
    RETURNING * INTO updated_post;

    -- Award 10 XP to author
    UPDATE public.profiles
    SET xp = COALESCE(xp, 0) + 10
    WHERE id = updated_post.author_id;

    RETURN row_to_json(updated_post);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: handle_solve
CREATE OR REPLACE FUNCTION public.handle_solve(target_post_id BIGINT, solver_alias TEXT)
RETURNS void AS $$
BEGIN
    -- 1. Mark post as solved
    UPDATE public.posts SET is_solved = true WHERE id = target_post_id;
    
    -- 2. Award 50 XP to solver
    UPDATE public.profiles SET 
        xp = COALESCE(xp, 0) + 50, 
        solved = COALESCE(solved, 0) + 1 
    WHERE alias = solver_alias;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RELAX POLICIES (Development Mode)
-- Granting all permissions to authenticated users to bypass RLS blocks
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Posts Access" ON public.posts;
CREATE POLICY "Public Posts Access" ON public.posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Profiles Access" ON public.profiles;
CREATE POLICY "Public Profiles Access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Comments Access" ON public.comments;
CREATE POLICY "Public Comments Access" ON public.comments FOR ALL USING (true) WITH CHECK (true);
