import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { removeStoredPdf } from '@/lib/pdf';

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authData.user.id;
        const supabaseAdmin = getSupabaseAdminClient();

        const { data: resumes } = await supabaseAdmin
            .from('resumes')
            .select('pdf_path, pdf_url')
            .eq('user_id', userId);

        for (const resume of resumes || []) {
            await removeStoredPdf((resume as any).pdf_path || (resume as any).pdf_url);
        }

        // Delete from auth.users using the admin API
        // This will automatically cascade to the 'profiles' table and other linked tables if
        // the foreign keys are set up with ON DELETE CASCADE.
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error('Error deleting user:', deleteError);
            return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
        }

        // Sign the user out locally as well to clear cookies
        await supabase.auth.signOut();

        return NextResponse.json({ success: true, message: 'Account deleted' });

    } catch (error: any) {
        console.error('Account deletion exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
