import { NextResponse } from 'next/server';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const shareId = searchParams.get('shareId');

        if (!shareId) {
            return NextResponse.json({ error: 'shareId is required.' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdminClient();
        const { data: resume, error } = await supabaseAdmin
            .from('resumes')
            .select('title, content, share_expires_at')
            .eq('share_id', shareId)
            .eq('share_enabled', true)
            .single();

        if (error || !resume) {
            return NextResponse.json({ error: 'Resume not found.' }, { status: 404 });
        }

        if (resume.share_expires_at && new Date(resume.share_expires_at) <= new Date()) {
            return NextResponse.json({ error: 'Share link has expired.' }, { status: 410 });
        }

        return NextResponse.json({
            resume: resume.content,
            title: resume.title,
        });

    } catch (error: any) {
        console.error('Public Resume Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
