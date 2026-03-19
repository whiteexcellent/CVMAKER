import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { removeStoredPdf } from '@/lib/pdf';
import { resumePatchSchema } from '@/lib/schemas';
import { parseJsonBody, RequestGuardError } from '@/lib/request-guards';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const resolvedParams = await params;
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await parseJsonBody(request, resumePatchSchema, {
            maxBytes: 48_000,
        });

        const { data, error } = await supabase
            .from('resumes')
            .update({ content })
            .eq('id', resolvedParams.id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating CV:', error);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        if (error instanceof RequestGuardError) {
            return NextResponse.json(error.payload, { status: error.status });
        }

        console.error('PATCH CV Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const resolvedParams = await params;
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: resume, error: fetchError } = await supabase
            .from('resumes')
            .select('id, pdf_path, pdf_url')
            .eq('id', resolvedParams.id)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !resume) {
            return NextResponse.json({ error: 'CV not found' }, { status: 404 });
        }

        await removeStoredPdf(resume.pdf_path || resume.pdf_url);

        const { error } = await supabase
            .from('resumes')
            .delete()
            .eq('id', resolvedParams.id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting CV:', error);
            return NextResponse.json({ error: 'Database deletion failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'CV deleted successfully' });
    } catch (error: any) {
        console.error('DELETE CV Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
