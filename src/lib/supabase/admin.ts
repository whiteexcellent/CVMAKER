import { createClient } from '@supabase/supabase-js';
import { getRequiredEnv } from '@/lib/env';

export function getSupabaseAdminClient() {
    return createClient(
        getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
        getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
