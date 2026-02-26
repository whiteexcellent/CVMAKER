import { Resend } from 'resend';

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper utility to send transactional emails via Resend
export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
    if (!resendClient) {
        console.error("RESEND_API_KEY is not defined in the environment variables.");
        return { error: 'Email service is not configured.' };
    }

    try {
        const { data, error } = await resendClient.emails.send({
            from: "OmniCV <onboarding@resend.dev>", // Replace with your domain when ready (e.g., hello@omnicv.com)
            to: [to],
            subject: subject,
            html: htmlContent,
        });

        if (error) {
            console.error("Resend Error:", error);
            return { error };
        }

        return { data };
    } catch (e: any) {
        console.error("Error sending email:", e);
        return { error: e.message };
    }
};

// Predesigned Templates
export const sendWelcomeEmail = async (to: string, name: string) => {
    return await sendEmail(
        to,
        "Welcome to OmniCV - AI Resume Builder",
        `<div style="font-family: sans-serif; color: #333;">
            <h2>Welcome aboard, ${name || 'Future Leader'}! 🎉</h2>
            <p>Your OmniCV account is ready. We've granted you a <strong>2 Credit Signup Bonus</strong> to instantly try our advanced AI resume optimizer and LinkedIn scraper.</p>
            <p>Our Llama 3.3 AI engine is ready to bypass any ATS system and secure you more interviews.</p>
            <br/>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Build Your CV Now</a>
         </div>`
    );
};

export const sendCVPDFEmail = async (to: string, targetRole: string, downloadLink: string) => {
    return await sendEmail(
        to,
        `Your ${targetRole} CV is Ready!`,
        `<div style="font-family: sans-serif; color: #333;">
            <h2>Success! Your ATS-Optimized CV is ready.</h2>
            <p>Our AI has finished processing your ${targetRole} resume. It is mathematically tailored to bypass filters and impress recruiters.</p>
            <br/>
            <p><a href="${downloadLink}" style="color: #2563eb;">Click here to view & download your OmniCV</a></p>
         </div>`
    );
};
