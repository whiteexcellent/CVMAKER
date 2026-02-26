import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Find the user ID by their username (assuming we map username to email local part or specific column later)
        // For now, let's assume 'username' matches an ID or we query the latest public resume directly
        // In a real scenario, you'd have a 'username' column in profiles. We will lookup by ID here for simplicity of the PoC

        const { data: resume, error } = await supabase
            .from('resumes')
            .select('*, profiles!inner(full_name, email)')
            .eq('id', username) // Assuming the UUID is the public link for now
            // .eq('status', 'published') // Optional: enforce only published resumes are visible
            .single();

        if (error || !resume) {
            return NextResponse.json({ error: 'Resume not found.' }, { status: 404 });
        }

        return NextResponse.json({
            resume: resume.content,
            owner: resume.profiles,
            title: resume.title
        });

    } catch (error: any) {
        console.error('Public Resume Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
