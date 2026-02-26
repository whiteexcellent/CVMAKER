import Groq from 'groq-sdk';

// We avoid throwing an error at the top level so that 'next build' doesn't crash on Vercel
// if the environment variables aren't strictly populated during the static compilation phase.
export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'missing_api_key_for_build',
});
