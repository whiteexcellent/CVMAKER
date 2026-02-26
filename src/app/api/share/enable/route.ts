import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { documentId, type } = await req.json();

        if (!documentId || !type || !['resume', 'cover_letter', 'presentation'].includes(type)) {
            return NextResponse.json({ error: 'Valid documentId and type (resume/cover_letter/presentation) are required.' }, { status: 400 });
        }

        let tableName = 'resumes';
        if (type === 'cover_letter') tableName = 'cover_letters';
        else if (type === 'presentation') tableName = 'presentations';

        // Ensure user actually owns the document before sharing
        const { data: doc, error: fetchError } = await supabase
            .from(tableName)
            .select('user_id, share_id')
            .eq('id', documentId)
            .single();

        if (fetchError || !doc || doc.user_id !== user.id) {
            return NextResponse.json({ error: 'Document not found or unauthorized.' }, { status: 404 });
        }

        // Generate a clean 10-character unique share ID if it doesn't exist, else reuse existing active ID
        const shareId = doc.share_id || crypto.randomBytes(5).toString('hex');

        // Calculate the Date 7 Days from exactly now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { error: updateError } = await supabase
            .from(tableName)
            .update({
                share_enabled: true,
                share_id: shareId,
                share_expires_at: expiresAt.toISOString()
            })
            .eq('id', documentId);

        if (updateError) {
            console.error("Failed to enable sharing:", updateError);
            return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
        }

        // Return the domain link
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const shareUrl = `${protocol}://${host}/share/${shareId}`;

        return NextResponse.json({
            success: true,
            shareId,
            shareUrl,
            expiresAt: expiresAt.toISOString()
        });

    } catch (error: any) {
        console.error('Share Enable Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
