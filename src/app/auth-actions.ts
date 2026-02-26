'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInWithMagicLink(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${siteUrl}/auth/callback`,
            // DEFAULT: shouldCreateUser is true, which is correct for signup
        },
    })

    if (error) {
        console.error('Magic link sign-up error:', error.message)
        redirect('/error?message=' + encodeURIComponent(error.message))
    }

    redirect('/verify-email')
}
