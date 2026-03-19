import { createBrowserClient } from '@supabase/ssr'
import { getRequiredEnv } from '@/lib/env'

export function createClient() {
  return createBrowserClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  )
}
