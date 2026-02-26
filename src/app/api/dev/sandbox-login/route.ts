import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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
                return NextResponse.json({ error: 'No users found in database to login as. Please manually create one first.' }, { status: 400 });
            }
            targetEmail = users.users[0].email;
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
