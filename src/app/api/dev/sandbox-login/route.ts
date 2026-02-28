import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const DEV_TEST_EMAIL = 'dev@cvmaker.test';

export async function GET(request: Request) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Sandbox login is only available in development mode' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    let targetEmail: string | null | undefined = searchParams.get('email');
    const redirectUrl = searchParams.get('next') || '/dashboard';

    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        if (!targetEmail) {
            // Find the first user in the system
            const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
            if (listError || !users.users[0]) {
                // No users found — create a dev test user automatically
                console.log('[sandbox-login] No users found, creating dev test user...');
                const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: DEV_TEST_EMAIL,
                    password: 'DevPassword2026!',
                    email_confirm: true,
                    user_metadata: { full_name: 'Dev Test User', is_dev: true }
                });
                if (createError || !newUser.user) {
                    return NextResponse.json({
                        error: 'Failed to create dev test user',
                        details: createError
                    }, { status: 500 });
                }
                targetEmail = newUser.user.email;
                console.log('[sandbox-login] Dev test user created:', targetEmail);
            } else {
                targetEmail = users.users[0].email;
            }
        }

        // Generate a magic link which sets the session
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: targetEmail!,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${redirectUrl}`
            }
        });

        if (linkError) {
            return NextResponse.json({ error: 'Failed to generate auth link', details: linkError }, { status: 500 });
        }

        const actionLink = linkData.properties.action_link;
        return NextResponse.redirect(actionLink);

    } catch (e) {
        return NextResponse.json({ error: 'Sandbox login error', details: String(e) }, { status: 500 });
    }
}
