import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// NOTE: In a real production environment, you would use OpenAI's text-embedding-3-small 
// or a HuggingFace Inference Endpoint to generate 1536-dimensional embeddings.
// For this advanced prototype, we will simulate the embedding process to safely seed the DB 
// without requiring new API keys.

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Basic security to prevent accidental seeding in production
        if (process.env.NODE_ENV !== 'development' && req.headers.get('authorization') !== `Bearer ${process.env.SEED_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sampleData = [
            {
                industry: "Technology",
                role: "Software Engineer",
                content: "Engineered a responsive React user interface, reducing Largest Contentful Paint (LCP) by 1.2s and improving conversion rates by 15%."
            },
            {
                industry: "Technology",
                role: "Backend Developer",
                content: "Architected a highly scalable PostgreSQL database schema, supporting 50,000+ daily active users with 99.9% uptime."
            },
            {
                industry: "Finance",
                role: "Financial Analyst",
                content: "Developed automated financial reporting models using Python, reducing manual data entry hours by 40% per week."
            },
            {
                industry: "Marketing",
                role: "Growth Marketer",
                content: "Spearheaded a multi-channel acquisition strategy, resulting in a 25% decrease in Customer Acquisition Cost (CAC) within 6 months."
            }
        ];

        let successCount = 0;

        for (const item of sampleData) {
            // SIMULATED EMBEDDING: A mock 1536-dimensional vector for testing the pgvector integration.
            // In real V2, replace this with `await openai.embeddings.create(...)`
            const mockEmbedding = Array.from({ length: 1536 }, () => (Math.random() * 2 - 1) * 0.1);

            const { error } = await supabase
                .from('ai_knowledge_base')
                .insert({
                    industry: item.industry,
                    role: item.role,
                    content: item.content,
                    embedding: mockEmbedding
                });

            if (!error) {
                successCount++;
            } else {
                console.error("Error seeding item:", error);
            }
        }

        return NextResponse.json({ success: true, seeded: successCount });

    } catch (error: any) {
        console.error('Seeding Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
