import { GoogleGenerativeAI } from '@google/generative-ai';

// Provide an empty fallback so Next.js build compilation doesn't crash during static analysis
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'DUMMY_KEY_FOR_BUILD');

// Use the optimal model for reasoning, speed, and cost
export const geminiPro = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7, // Balanced for creativity and structured precision
    },
});
