import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const PDF_BUCKET = 'cv_pdfs';

export function normalizeStoredPdfPath(value?: string | null): string | null {
    if (!value) {
        return null;
    }

    try {
        const url = new URL(value);
        const marker = '/storage/v1/object/public/cv_pdfs/';
        const markerIndex = url.pathname.indexOf(marker);

        if (markerIndex >= 0) {
            return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
        }

        return decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    } catch {
        return value.replace(/^\/+/, '');
    }
}

export async function createSignedPdfUrl(value?: string | null, expiresIn = 600): Promise<string | null> {
    const path = normalizeStoredPdfPath(value);

    if (!path) {
        return null;
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.storage
        .from(PDF_BUCKET)
        .createSignedUrl(path, expiresIn, { download: true });

    if (error) {
        console.error('Failed to create signed PDF URL:', error);
        return null;
    }

    return data.signedUrl;
}

export async function removeStoredPdf(value?: string | null): Promise<void> {
    const path = normalizeStoredPdfPath(value);

    if (!path) {
        return;
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.storage.from(PDF_BUCKET).remove([path]);

    if (error) {
        console.error('Failed to remove stored PDF:', error);
    }
}
