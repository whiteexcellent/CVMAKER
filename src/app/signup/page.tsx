import { login, signup } from '@/app/auth-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 -right-48 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 mx-auto w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center space-x-3 group outline-none">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-display font-bold text-white tracking-tight">OmniCV</span>
                    </Link>
                </div>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 text-white shadow-2xl">
                    <CardHeader className="space-y-1 text-center pt-8">
                        <CardTitle className="text-3xl font-display font-bold tracking-tight">Create an account</CardTitle>
                        <CardDescription className="text-white/60 text-base mt-2">
                            Enter your email below to create your OmniCV account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8">
                        <form className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email" className="text-white/80">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500 h-11"
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="password" className="text-white/80">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-black/20 border-white/10 text-white focus-visible:ring-cyan-500 h-11"
                                />
                            </div>
                            <div className="flex flex-col gap-3 mt-4">
                                <Button formAction={signup} className="w-full h-11 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-medium border-0 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]">
                                    Sign Up & Get 2 Free Credits
                                </Button>
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-white/10"></span>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-transparent px-2 text-white/50 backdrop-blur-md rounded-full">Already have an account?</span>
                                    </div>
                                </div>
                                <Button formAction={login} variant="outline" className="w-full h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all font-medium">
                                    Log in instead
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
