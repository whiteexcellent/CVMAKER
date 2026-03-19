import { cookies } from 'next/headers';
import { getDictionary, resolveLocale } from '@/lib/i18n';

export default async function ErrorPage({ searchParams }: { searchParams: Promise<{ message?: string, error?: string }> }) {
    const { message, error } = await searchParams;
    const cookieStore = await cookies();
    const locale = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
    const dict = await getDictionary(locale);

    let displayMessage = message || dict.error.defaultMessage;

    // Explicitly handle translated auth errors
    if (error === 'user_not_found') {
        displayMessage = dict.auth.userNotFound;
    }

    return (
        <div className="flex h-screen w-full items-center justify-center px-4 font-sans bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
            <div className="text-center">
                <h1 className="text-4xl font-display font-black tracking-tight text-red-600 dark:text-red-400">{dict.error.title}</h1>
                <p className="mt-4 text-black/70 dark:text-white/70 font-medium">{displayMessage}</p>
                <a href="/login" className="mt-6 inline-block font-bold mt-8 border-b-2 border-transparent hover:border-black dark:hover:border-white transition-colors">
                    {dict.error.backToLogin}
                </a>
            </div>
        </div>
    )
}
