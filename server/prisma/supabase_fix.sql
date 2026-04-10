-- 1. Create the Upvote RPC (using BIGINT for post IDs)
CREATE OR REPLACE FUNCTION public.handle_upvote(target_post_id BIGINT, user_alias TEXT)
RETURNS json AS $$
DECLARE
    updated_post RECORD;
BEGIN
    -- Check if user already upvoted
    IF EXISTS (
        SELECT 1 FROM public.posts 
        WHERE id = target_post_id 
        AND user_alias = ANY(COALESCE(upvoted_by, ARRAY[]::TEXT[]))
    ) THEN
        SELECT * INTO updated_post FROM public.posts WHERE id = target_post_id;
        RETURN row_to_json(updated_post);
    END IF;

    -- Update post
    UPDATE public.posts
    SET 
        upvotes = COALESCE(upvotes, 0) + 1,
        upvoted_by = array_append(COALESCE(upvoted_by, ARRAY[]::TEXT[]), user_alias)
    WHERE id = target_post_id
    RETURNING * INTO updated_post;

    -- Award 10 XP to author (assuming profiles.id is UUID as per Supabase Auth)
    UPDATE public.profiles
    SET xp = COALESCE(xp, 0) + 10
    WHERE id = updated_post.author_id;

    RETURN row_to_json(updated_post);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Solve RPC (using BIGINT for post IDs)
CREATE OR REPLACE FUNCTION public.handle_solve(target_post_id BIGINT, solver_alias TEXT)
RETURNS void AS $$
BEGIN
    -- 1. Mark post as solved
    UPDATE public.posts SET is_solved = true WHERE id = target_post_id;
    
    -- 2. Award 50 XP to solver and increment solve count
    UPDATE public.profiles SET 
        xp = COALESCE(xp, 0) + 50, 
        solved = COALESCE(solved, 0) + 1 
    WHERE alias = solver_alias;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure profiles table has defaults
ALTER TABLE public.profiles 
ALTER COLUMN xp SET DEFAULT 0,
ALTER COLUMN solved SET DEFAULT 0;

UPDATE public.profiles SET xp = 0 WHERE xp IS NULL;
UPDATE public.profiles SET solved = 0 WHERE solved IS NULL;
