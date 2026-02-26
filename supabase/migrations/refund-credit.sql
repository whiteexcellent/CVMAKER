CREATE OR REPLACE FUNCTION refund_credit(user_id_param UUID, amount_param INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF amount_param <= 0 THEN
        RETURN;
    END IF;

    UPDATE public.profiles
    SET 
        total_credits = COALESCE(total_credits, 0) + amount_param,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = user_id_param;
END;
$$;
