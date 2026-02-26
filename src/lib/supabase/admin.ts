import { createClient } from '@supabase/supabase-js';

// Avoid throwing top-level errors for missing env variables so Next.js static builds on Vercel do not crash.
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock_service_key'
);
