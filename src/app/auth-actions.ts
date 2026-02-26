'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${siteUrl}/auth/callback`,
            shouldCreateUser: false, // SECURITY: Prevent ghost accounts on typo
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
