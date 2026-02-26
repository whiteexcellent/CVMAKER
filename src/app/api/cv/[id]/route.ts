import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Update the resume in Supabase
        const { data, error } = await supabase
            .from('resumes')
            .update({ content })
            .eq('id', resolvedParams.id)
            .eq('user_id', user.id) // Security check to ensure owner
            .select()
            .single();

        if (error) {
            console.error('Error updating CV:', error);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
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

        // Delete the resume in Supabase
        const { error } = await supabase
            .from('resumes')
            .delete()
            .eq('id', resolvedParams.id)
            .eq('user_id', user.id); // Security check to ensure owner

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
