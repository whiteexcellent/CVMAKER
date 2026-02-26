import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // This is a public route, no user authentication required to merely VIEW and track a document.
        const { shareId } = await req.json();

        if (!shareId) {
            return NextResponse.json({ error: 'shareId is required.' }, { status: 400 });
        }

        // We must check if it's a resume or a cover letter.
        // To avoid massive RPCs or complex DB structures right now, we can query both tables briefly.
        // It's a quick index lookup against 'share_id'.

        let tableName = '';
        let currentViews = 0;
        let documentId = '';

        // 1. Check Resumes first
        const { data: resumeDoc } = await supabase
            .from('resumes')
            .select('id, views')
            .eq('share_id', shareId)
            .single();

        if (resumeDoc) {
            tableName = 'resumes';
            currentViews = resumeDoc.views || 0;
            documentId = resumeDoc.id;
        } else {
            // 2. Check Cover Letters
            const { data: coverDoc } = await supabase
                .from('cover_letters')
                .select('id, views')
                .eq('share_id', shareId)
                .single();

            if (coverDoc) {
                tableName = 'cover_letters';
                currentViews = coverDoc.views || 0;
                documentId = coverDoc.id;
            }
        }

        if (!tableName) {
            return NextResponse.json({ error: 'Shared document not found.' }, { status: 404 });
        }

        // Increment the application-side views (Atomic risk is low enough for a basic view tracker)
        const updatedViews = currentViews + 1;

        // We reuse the singleton admin client
        const { error: updateError } = await supabaseAdmin
            .from(tableName)
            .update({ views: updatedViews })
            .eq('id', documentId);

        if (updateError) {
            console.error("Failed to increment views:", updateError);
            return NextResponse.json({ error: 'Failed to record view metrics' }, { status: 500 });
        }

        return NextResponse.json({ success: true, views: updatedViews });

    } catch (error: any) {
        console.error('Track View Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
