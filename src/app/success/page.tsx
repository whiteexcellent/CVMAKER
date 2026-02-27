'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-10 w-full max-w-md bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
                {/* Shine effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
                    animate={{ translateX: ['-100%', '200%'] }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: 'easeInOut',
                    }}
                />

                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 rounded-full" />
                        <CheckCircle2 className="w-20 h-20 text-blue-500 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-6"
                    >
                        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
                            Aboneliğiniz Aktif!
                        </h1>
                        <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                            Pro sürüme hoş geldiniz. Artık sınırsız yapay zeka gücü ve tüm premium CV özelliklerine anında erişebilirsiniz.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="w-full flex flex-col gap-3"
                    >
                        <Link href="/dashboard" className="w-full relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                            <div className="relative flex items-center justify-center gap-2 bg-neutral-900 border border-white/10 text-white rounded-xl px-4 py-3 font-medium transition-all group-hover:bg-neutral-800">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                Dashboard&apos;a Git
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
