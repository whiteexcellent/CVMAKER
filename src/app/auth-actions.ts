'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

async function getSiteUrl() {
    // 1. Dynamic detection from headers (most reliable for custom domains)
    const headerList = await headers()
    const host = headerList.get('host')
    const protocol = headerList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'development' ? 'http' : 'https')

    // Only skip host detection if explicitly on localhost/127.0.0.1 in development
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        return `${protocol}://${host}`
    }

    // 2. Environment variable (if explicitly set)
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    }

    // 3. Vercel deployment URL
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    }

    // Ultimate fallback for local development
    return 'http://localhost:3000'
}

export async function signInWithMagicLink(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const siteUrl = await getSiteUrl()

    // STRICT CHECK: Verify if user exists before sending login link
    try {
        const adminClient = await createAdminClient()
        const { data: users } = await adminClient.auth.admin.listUsers()
        const userExists = users.users.some(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!userExists) {
            console.warn(`Sign-in attempt for non-existent user: ${email}`)
            redirect('/error?error=user_not_found')
        }
    } catch (e) {
        // Fallback to standard behavior if admin client is unavailable (e.g. missing SERVICE_ROLE_KEY)
        console.warn('Admin client check skipped or failed in signInWithMagicLink:', String(e))
    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${siteUrl}/auth/callback`,
            shouldCreateUser: false,
        },
    })

    if (error) {
        console.error('Magic link sign-in error:', error.message)
        redirect('/error?error=user_not_found')
    }

    redirect('/verify-email')
}

export async function signUpWithMagicLink(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const siteUrl = await getSiteUrl()

    // STRICT CHECK: Prevent signing up if already registered
    try {
        const adminClient = await createAdminClient()
        const { data: users } = await adminClient.auth.admin.listUsers()
        const userExists = users.users.some(u => u.email?.toLowerCase() === email.toLowerCase())

        if (userExists) {
            console.warn(`Sign-up attempt for existing user: ${email}`)
            redirect('/login?message=' + encodeURIComponent('account_exists'))
        }
    } catch (e) {
        console.warn('Admin client check skipped or failed in signUpWithMagicLink:', String(e))
    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${siteUrl}/auth/callback`,
        },
    })

    if (error) {
        console.error('Magic link sign-up error:', error.message)
        redirect('/error?message=' + encodeURIComponent(error.message))
    }

    redirect('/verify-email')
}
