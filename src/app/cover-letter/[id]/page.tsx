import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CoverLetterViewer from '@/app/cover-letter/[id]/CoverLetterViewer'
import { isDevAuthBypassEnabled } from '@/lib/env'

export default async function CoverLetterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const bypassAuth = isDevAuthBypassEnabled();

    if (!bypassAuth && !user) redirect('/login')

    if (bypassAuth && id === '00000000-0000-0000-0000-000000000001') {
        const mockCoverLetter = {
            id: '00000000-0000-0000-0000-000000000001',
            title: 'Test Target Role Cover Letter',
            content: {
                sender_name: 'Test Sender',
                sender_contact: 'test@example.com',
                recipient_name: 'Hiring Manager',
                date: new Date().toLocaleDateString(),
                subject: 'Application for Test Target Role',
                paragraphs: [
                    'This is a mock paragraph generated during a test.',
                    'This is another mock paragraph.'
                ],
                meta: {}
            },
            created_at: new Date().toISOString()
        }
        return <CoverLetterViewer coverLetter={mockCoverLetter} />
    }

    const { data: coverLetter } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single()

    if (!coverLetter) redirect('/dashboard')

    return <CoverLetterViewer coverLetter={coverLetter} />
}
