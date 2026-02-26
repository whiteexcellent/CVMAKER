-- Atomically add credits to a user's total_credits balance
CREATE OR REPLACE FUNCTION add_credits(user_id_param UUID, amount_param INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Security Check: Only allow service_role to execute this function
    IF current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized: Only service_role can add credits directly';
    END IF;

    UPDATE public.profiles
    SET 
        total_credits = COALESCE(total_credits, 0) + amount_param,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = user_id_param;
END;
$$;
