import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Middleware already protects this route, but we double-check for safety
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    // Fetch the user's profile to display credits
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

    return (
        <div className="flex min-h-screen flex-col">
            <header className="flex h-16 items-center border-b px-6 bg-background">
                <div className="flex flex-1 items-center justify-between">
                    <Link href="/" className="font-bold text-lg tracking-tight">
                        CV Maker Omni
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-muted-foreground mr-4">
                            Credits: <span className="text-foreground">{profile?.total_credits || 0}</span>
                        </div>
                        <form action="/auth/signout" method="post">
                            <Button variant="outline" size="sm" type="submit">
                                Log out
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-full md:col-span-2 lg:col-span-2 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-3xl">Welcome Back!</CardTitle>
                            <CardDescription className="text-lg mt-2">
                                Ready to create an attention-grabbing, mathematically optimized resume?
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button size="lg" className="w-full md:w-auto font-medium" asChild>
                                <Link href="/wizard">Create New CV &rarr;</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Documents</CardTitle>
                            <CardDescription>Your recently generated CVs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground text-center py-8">
                                No resumes generated yet.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
