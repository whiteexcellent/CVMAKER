'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Sign-in error:', error.message)
        redirect('/error?message=' + encodeURIComponent(error.message))
    }

    redirect('/dashboard')
}

export async function signUp(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${siteUrl}/auth/callback`,
        }
    })

    if (error) {
        console.error('Sign-up error:', error.message)
        redirect('/error?message=' + encodeURIComponent(error.message))
    }

    redirect('/dashboard')
}
