import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { I18nProvider } from "@/components/I18nProvider";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniCV - Premium Resume Generator",
  description: "Mathematically optimized CVS engineered by Omni AI.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLocale = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const initialDictionary = await getDictionary(initialLocale);

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-white dark:bg-black text-black dark:text-white transition-colors duration-300`}
      >
        <I18nProvider initialLocale={initialLocale} initialDictionary={initialDictionary}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-center" />
            <Analytics />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
