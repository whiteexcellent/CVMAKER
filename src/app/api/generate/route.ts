import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit, refundCredit } from '@/lib/credits';
import { groq } from '@/lib/groq';
import { generatePresentonCV } from '@/lib/presenton';
import { getSystemInstruction, getUserPrompt } from './prompts';
import { runResearcher, runSemanticReranker, runCritic } from './agents';

export const dynamic = 'force-dynamic';

const schema = z.object({
    profileType: z.string().optional(),
    targetRole: z.string().optional(),
    education: z.string().optional(),
    experience: z.string().optional(),
    skills: z.string().optional(),
    jobDescription: z.string().optional()
}).strict();

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        let { data: { user } } = await supabase.auth.getUser();

        if (process.env.NODE_ENV === 'development' && !user) {
            user = { id: 'local-test-bypass' } as any;
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
        }
        const { profileType, targetRole, education, experience, skills, jobDescription } = parsed.data;

        // 2. Check and Deduct Credits Securely
        let creditCheck: any = { allowed: true, reason: '' };
        if (user.id !== 'local-test-bypass') {
            creditCheck = await checkAndDeductCredit(user.id, 1);
        }
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: creditCheck.reason }, { status: 402 });
        }

        // 3. Prompt Engineering
        const systemInstruction = getSystemInstruction(profileType, targetRole);

        // DETERMINE MODELS
        const WRITER_MODEL = 'llama-3.3-70b-versatile';

        let structuredCV;
        let cleanedText = '';

        try {
            // AGENT 1: THE RESEARCHER
            let researcherInsights = "No specific job description provided. Prioritize general industry best practices.";
            if (jobDescription) {
                researcherInsights = await runResearcher(jobDescription, education || '', experience || '', skills || '');
            }

            // AGENT 1.5: THE SEMANTIC RERANKER
            let filteredExperience = experience || '';
            if (experience && experience.length > 50) {
                filteredExperience = await runSemanticReranker(targetRole || '', experience);
            }

            // RAG PIPELINE
            let ragContext = "No specific RAG examples found.";
            try {
                function generateMockEmbedding(str: string) {
                    let hash = 0;
                    for (let i = 0; i < str.length; i++) {
                        hash = (hash << 5) - hash + str.charCodeAt(i);
                        hash |= 0;
                    }
                    function rng(seed: number) {
                        let s = seed;
                        return function () {
                            s = Math.sin(s) * 10000;
                            return s - Math.floor(s);
                        }
                    }
                    const randomFunc = rng(hash);
                    return Array.from({ length: 1536 }, () => (randomFunc() * 2) - 1);
                }
                const mockQueryEmbedding = generateMockEmbedding(targetRole || "Software Engineer");
                const { data: ragData, error: ragError } = await supabase.rpc('match_resume_knowledge', {
                    query_embedding: mockQueryEmbedding,
                    match_threshold: 0.0,
                    match_count: 2
                });
                if (!ragError && ragData && ragData.length > 0) {
                    ragContext = ragData.map((item: any) => `- [${item.industry} / ${item.role}]: ${item.content}`).join("\\n");
                    console.log("[RAG PIPELINE] Retrieved successful examples:", ragContext);
                } else if (ragError) {
                    console.warn("[RAG PIPELINE] Database function error (might not be deployed yet):", ragError.message);
                }
            } catch (e) {
                console.warn("[RAG PIPELINE] Could not execute RAG search:", e);
            }

            // Update user prompt to use filtered experience
            const userPromptWithRerankedData = getUserPrompt(education, filteredExperience, skills, jobDescription);

            // AGENT 2: THE WRITER
            console.log("[AGENT 2] Writer is generating the CV...");
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
            } catch (jsonParseError) {
                console.warn("[AGENT 2] JSON Parse failed. Initiating Critic for automatic repair...");

                // AGENT 3: THE CRITIC / REPAIRMAN
                const repairedText = await runCritic(cleanedText);

                try {
                    structuredCV = JSON.parse(repairedText);
                    console.log("[AGENT 3] Critic successfully repaired the JSON.");
                } catch (fatalError) {
                    console.error("FATAL: Critic failed to repair JSON:", repairedText);
                    if (user.id !== 'local-test-bypass') await refundCredit(user.id, 1);
                    return NextResponse.json({ error: 'AI Pipeline failed to generate a valid data structure. Please try again (Credit Refunded).' }, { status: 500 });
                }
            }

        } catch (apiError: any) {
            console.error("Multi-Agent Pipeline Failed:", apiError);
            if (user.id !== 'local-test-bypass') await refundCredit(user.id, 1);
            return NextResponse.json({ error: `AI Pipeline Error: ${apiError.message || 'Generation failed'} (Credit Refunded)` }, { status: 500 });
        }

        // 5. Generate PDF with Presenton (if configured)
        let pdf_url = null;
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
                    console.error("Storage upload error:", uploadError);
                } else {
                    const { data: publicUrlData } = supabase.storage
                        .from('cv_pdfs')
                        .getPublicUrl(fileName);
                    pdf_url = publicUrlData.publicUrl;
                }
            }
        } catch (pdfErr) {
            console.error("PDF Generation error:", pdfErr);
        }

        // 6. Save to Database
        let savedResume: any = { id: 'dev-bypass' };
        if (user.id !== 'local-test-bypass') {
            const { data, error: saveError } = await supabase.from('resumes')
                .insert({
                    user_id: user.id,
                    title: `${targetRole} CV - ${new Date().toLocaleDateString()}`,
                    content: structuredCV,
                    pdf_url: pdf_url,
                    status: 'generated'
                })
                .select()
                .single();

            if (saveError) {
                console.error("Error saving resume:", saveError)
                await refundCredit(user.id, 1);
                return NextResponse.json({ error: "Failed to save resume securely. Please try again (Credit Refunded)." }, { status: 500 });
            }
            savedResume = data;
        }

        // 7. Return Data
        return NextResponse.json({ success: true, resumeId: savedResume.id, data: structuredCV, pdf_url: pdf_url, isDevBypass: user.id === 'local-test-bypass' });

    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
