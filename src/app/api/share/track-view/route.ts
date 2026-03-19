import { NextResponse } from 'next/server';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { parseJsonBody, RequestGuardError } from '@/lib/request-guards';
import { z } from 'zod';

const shareTrackSchema = z.object({
    shareId: z.string().min(8).max(128),
}).strict();

export async function POST(req: Request) {
    try {
        const { shareId } = await parseJsonBody(req, shareTrackSchema, {
            maxBytes: 512,
        });

        const supabaseAdmin = getSupabaseAdminClient();
        const { data, error } = await supabaseAdmin.rpc('increment_shared_document_view', {
            share_id_param: shareId,
        });

        if (error) {
            console.error('Failed to increment views:', error);
            return NextResponse.json({ error: 'Failed to record view metrics' }, { status: 500 });
        }

        if (!data?.success) {
            return NextResponse.json({ error: data?.reason || 'Shared document not found.' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            views: data.views,
            type: data.document_type,
        });

    } catch (error: any) {
        if (error instanceof RequestGuardError) {
            return NextResponse.json(error.payload, { status: error.status });
        }

        console.error('Track View Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
