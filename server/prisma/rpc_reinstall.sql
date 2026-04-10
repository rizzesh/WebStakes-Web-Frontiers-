-- ==========================================================
-- TOTAL CLEANUP & REINSTALL (RPC FIX)
-- ==========================================================

-- 1. DROP OLD VERSIONS (Crucial for PostgREST candidate selection)
DROP FUNCTION IF EXISTS public.handle_upvote(uuid, text);
DROP FUNCTION IF EXISTS public.handle_upvote(bigint, text);
DROP FUNCTION IF EXISTS public.handle_solve(uuid, text);
DROP FUNCTION IF EXISTS public.handle_solve(bigint, text);

-- 2. REINSTALL WITH CORRECT TYPES (BIGINT for Numeric IDs)
CREATE OR REPLACE FUNCTION public.handle_upvote(target_post_id BIGINT, user_alias TEXT)
RETURNS json AS $$
DECLARE
    updated_post RECORD;
BEGIN
    UPDATE public.posts
    SET 
        upvotes = COALESCE(upvotes, 0) + 1,
        upvoted_by = array_append(COALESCE(upvoted_by, ARRAY[]::TEXT[]), user_alias)
    WHERE id = target_post_id
    RETURNING * INTO updated_post;

    UPDATE public.profiles
    SET xp = COALESCE(xp, 0) + 10
    WHERE id = updated_post.author_id;

    RETURN row_to_json(updated_post);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_solve(target_post_id BIGINT, solver_alias TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.posts SET is_solved = true WHERE id = target_post_id;
    UPDATE public.profiles SET 
        xp = COALESCE(xp, 0) + 50, 
        solved = COALESCE(solved, 0) + 1 
    WHERE alias = solver_alias;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ENSURE PERMISSIVE RLS (Development Only)
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
