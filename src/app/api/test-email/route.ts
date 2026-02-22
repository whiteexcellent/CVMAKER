import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/resend';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const result = await sendWelcomeEmail(email, name || 'User');

        if (result.error) {
            console.error("Resend API Error:", result.error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Welcome email sent successfully' });
    } catch (e: any) {
        console.error("Email Route Error:", e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
