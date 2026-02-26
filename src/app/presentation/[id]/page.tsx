import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PresentationViewer from '@/app/presentation/[id]/PresentationViewer'

export default async function PresentationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: presentation } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!presentation) redirect('/dashboard')

    return <PresentationViewer presentation={presentation} />
}
