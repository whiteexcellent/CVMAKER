import { NextResponse } from 'next/server';

import { createEmbedding } from '@/lib/embeddings';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        const supabase = getSupabaseAdminClient();

        if (process.env.NODE_ENV !== 'development' && req.headers.get('authorization') !== `Bearer ${process.env.SEED_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'OPENAI_API_KEY is required to seed real embeddings.' }, { status: 503 });
        }

        const sampleData = [
            {
                industry: 'Technology',
                role: 'Software Engineer',
                content: 'Engineered a responsive React user interface, reducing Largest Contentful Paint (LCP) by 1.2s and improving conversion rates by 15%.'
            },
            {
                industry: 'Technology',
                role: 'Backend Developer',
                content: 'Architected a highly scalable PostgreSQL database schema, supporting 50,000+ daily active users with 99.9% uptime.'
            },
            {
                industry: 'Finance',
                role: 'Financial Analyst',
                content: 'Developed automated financial reporting models using Python, reducing manual data entry hours by 40% per week.'
            },
            {
                industry: 'Marketing',
                role: 'Growth Marketer',
                content: 'Spearheaded a multi-channel acquisition strategy, resulting in a 25% decrease in Customer Acquisition Cost (CAC) within 6 months.'
            }
        ];

        let successCount = 0;

        for (const item of sampleData) {
            const embedding = await createEmbedding(`${item.industry}\n${item.role}\n${item.content}`);
            if (!embedding) {
                continue;
            }

            const { error } = await supabase
                .from('ai_knowledge_base')
                .insert({
                    industry: item.industry,
                    role: item.role,
                    content: item.content,
                    embedding,
                });

            if (!error) {
                successCount++;
            } else {
                console.error('Error seeding item:', error);
            }
        }

        return NextResponse.json({ success: true, seeded: successCount });

    } catch (error: any) {
        console.error('Seeding Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
