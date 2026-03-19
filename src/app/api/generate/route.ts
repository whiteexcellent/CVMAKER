import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit, refundCredit } from '@/lib/credits';
import { groq } from '@/lib/groq';
import { generatePresentonCV } from '@/lib/presenton';
import { createEmbedding } from '@/lib/embeddings';
import { generateCvRequestSchema, resumeContentSchema } from '@/lib/schemas';
import { parseJsonBody, RequestGuardError, getRateLimitIdentifier } from '@/lib/request-guards';
import { enforceRateLimit } from '@/lib/rate-limit';
import { isDevAuthBypassEnabled } from '@/lib/env';
import { getSystemInstruction, getUserPrompt } from './prompts';
import { runResearcher, runSemanticReranker, runCritic } from './agents';

export const dynamic = 'force-dynamic';

async function getRagContext(
    supabase: Awaited<ReturnType<typeof createClient>>,
    queryText: string
): Promise<string> {
    try {
        const embedding = await createEmbedding(queryText);
        if (!embedding) {
            return 'RAG disabled. No embedding provider configured.';
        }

        const { data: ragData, error: ragError } = await supabase.rpc('match_resume_knowledge', {
            query_embedding: embedding,
            match_threshold: 0.45,
            match_count: 2,
        });

        if (ragError) {
            console.warn('[RAG PIPELINE] Database function error:', ragError.message);
            return 'No specific RAG examples found.';
        }

        if (!ragData || ragData.length === 0) {
            return 'No specific RAG examples found.';
        }

        return ragData
            .map((item: any) => `- [${item.industry} / ${item.role}]: ${item.content}`)
            .join('\n');
    } catch (error) {
        console.warn('[RAG PIPELINE] Failed to fetch real embeddings:', error);
        return 'No specific RAG examples found.';
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        let { data: { user } } = await supabase.auth.getUser();

        if (isDevAuthBypassEnabled() && !user) {
            user = { id: 'local-test-bypass' } as any;
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await parseJsonBody(req, generateCvRequestSchema, {
            maxBytes: 48_000,
        });

        if (user.id !== 'local-test-bypass') {
            try {
                await enforceRateLimit(supabase, {
                    identifier: getRateLimitIdentifier(req, user.id),
                    routeKey: 'generate_cv',
                    maxRequests: 10,
                    windowSeconds: 3600,
                });
            } catch (rateLimitError: any) {
                return NextResponse.json({ error: rateLimitError.message }, { status: 429 });
            }
        }

        const { profileType, targetRole, education, experience, skills, jobDescription } = body;

        let creditCheck: any = { allowed: true, reason: '' };
        if (user.id !== 'local-test-bypass') {
            creditCheck = await checkAndDeductCredit(user.id, 1, 'generate_cv');
        }
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: creditCheck.reason }, { status: 402 });
        }

        const systemInstruction = getSystemInstruction(profileType, targetRole);
        const WRITER_MODEL = 'llama-3.3-70b-versatile';

        let structuredCV;
        let cleanedText = '';

        try {
            const [researcherInsights, filteredExperience, ragContext] = await Promise.all([
                jobDescription
                    ? runResearcher(jobDescription, education || '', experience || '', skills || '')
                    : Promise.resolve('No specific job description provided. Prioritize general industry best practices.'),
                experience && experience.length > 50
                    ? runSemanticReranker(targetRole || '', experience)
                    : Promise.resolve(experience || ''),
                getRagContext(
                    supabase,
                    [targetRole, jobDescription].filter(Boolean).join('\n\n') || 'Software Engineer'
                ),
            ]);

            const userPromptWithRerankedData = getUserPrompt(education, filteredExperience, skills, jobDescription);

            const finalSystemInstruction = `${systemInstruction}

[RESEARCHER INSIGHTS TO APPLY]:
${researcherInsights}

[RAG KNOWLEDGE - PROVEN SUCCESSFUL RESUME CLIPS]:
Use these high-converting patterns as inspiration for transforming the user's raw data:
${ragContext}`;

            const writerCompletion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: finalSystemInstruction },
                    { role: 'user', content: userPromptWithRerankedData }
                ],
                model: WRITER_MODEL,
                temperature: 0.4,
                response_format: { type: 'json_object' }
            });

            const rawWriterResponse = writerCompletion.choices[0]?.message?.content || '{}';
            cleanedText = rawWriterResponse.replace(/```json\n?|\`\`\`\n?/g, '').trim();

            try {
                structuredCV = JSON.parse(cleanedText);
            } catch {
                const repairedText = await runCritic(cleanedText);
                structuredCV = JSON.parse(repairedText);
            }

            structuredCV = resumeContentSchema.parse(structuredCV);
        } catch (apiError: any) {
            console.error('Multi-Agent Pipeline Failed:', apiError);
            if (user.id !== 'local-test-bypass') {
                await refundCredit(user.id, 1, 'generate_cv_refund');
            }
            return NextResponse.json({ error: `AI Pipeline Error: ${apiError.message || 'Generation failed'} (Credit Refunded)` }, { status: 500 });
        }

        let pdfPath: string | null = null;
        try {
            const pdfBuffer = await generatePresentonCV(structuredCV);
            if (pdfBuffer) {
                const fileName = `${user.id}/${Date.now()}-cv.pdf`;
                const { error: uploadError } = await supabase.storage
                    .from('cv_pdfs')
                    .upload(fileName, pdfBuffer, {
                        contentType: 'application/pdf',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('Storage upload error:', uploadError);
                } else {
                    pdfPath = fileName;
                }
            }
        } catch (pdfErr) {
            console.error('PDF Generation error:', pdfErr);
        }

        let savedResume: any = { id: 'dev-bypass' };
        if (user.id !== 'local-test-bypass') {
            const { data, error: saveError } = await supabase.from('resumes')
                .insert({
                    user_id: user.id,
                    title: `${targetRole || 'Professional'} CV - ${new Date().toLocaleDateString()}`,
                    content: structuredCV,
                    pdf_path: pdfPath,
                    pdf_url: pdfPath,
                    status: 'generated'
                })
                .select()
                .single();

            if (saveError) {
                console.error('Error saving resume:', saveError);
                await refundCredit(user.id, 1, 'generate_cv_refund');
                return NextResponse.json({ error: 'Failed to save resume securely. Please try again (Credit Refunded).' }, { status: 500 });
            }
            savedResume = data;
        }

        return NextResponse.json({
            success: true,
            resumeId: savedResume.id,
            data: structuredCV,
            pdf_url: pdfPath,
            isDevBypass: user.id === 'local-test-bypass'
        });

    } catch (error: any) {
        if (error instanceof RequestGuardError) {
            return NextResponse.json(error.payload, { status: error.status });
        }

        console.error('Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
