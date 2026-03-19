import crypto from 'crypto';
import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { parseJsonBody, RequestGuardError } from '@/lib/request-guards';
import { shareEnableRequestSchema } from '@/lib/schemas';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { documentId, type } = await parseJsonBody(req, shareEnableRequestSchema, {
            maxBytes: 2_000,
        });

        let tableName = 'resumes';
        if (type === 'cover_letter') tableName = 'cover_letters';
        else if (type === 'presentation') tableName = 'presentations';

        const { data: doc, error: fetchError } = await supabase
            .from(tableName)
            .select('user_id, share_id')
            .eq('id', documentId)
            .single();

        if (fetchError || !doc || doc.user_id !== user.id) {
            return NextResponse.json({ error: 'Document not found or unauthorized.' }, { status: 404 });
        }

        const shareId = doc.share_id || crypto.randomBytes(16).toString('hex');
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
            console.error('Failed to enable sharing:', updateError);
            return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
        }

        const { origin } = new URL(req.url);
        return NextResponse.json({
            success: true,
            shareId,
            shareUrl: `${origin}/share/${shareId}`,
            expiresAt: expiresAt.toISOString()
        });

    } catch (error: any) {
        if (error instanceof RequestGuardError) {
            return NextResponse.json(error.payload, { status: error.status });
        }

        console.error('Share Enable Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
