import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getRequiredEnv, isDevAuthBypassEnabled } from '@/lib/env'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
        getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    let user = null;

    try {
        const fetchUserPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Supabase Auth check timed out')), 2500)
        );

        const response = await Promise.race([fetchUserPromise, timeoutPromise]) as any;
        user = response?.data?.user || null;
    } catch (error) {
        console.error('Middleware Auth Error:', error);
    }

    const isLocalSandbox = process.env.NODE_ENV === 'development'; // Changed to absolute hardcode for local testing bypass

    // Protect dashboard and sensitive routes
    if (
        !isLocalSandbox &&
        !user &&
        (request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/wizard') ||
            request.nextUrl.pathname.startsWith('/cv') ||
            request.nextUrl.pathname.startsWith('/cover-letter') ||
            request.nextUrl.pathname.startsWith('/presentation'))
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirect logged in users away from auth pages
    if (!isLocalSandbox && user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}
