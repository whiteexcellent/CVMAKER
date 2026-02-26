import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit, refundCredit } from '@/lib/credits';
import { groq } from '@/lib/groq';
import { generatePresentonCV } from '@/lib/presenton';

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

        // 2. Check and Deduct Credits Securely (Moved after validation)
        let creditCheck: any = { allowed: true, reason: '' };
        if (user.id !== 'local-test-bypass') {
            creditCheck = await checkAndDeductCredit(user.id, 1);
        }
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: creditCheck.reason }, { status: 402 });
        }

        // 3. Prompt Engineering
        const schemaInstructions = `
You MUST respond with ONLY valid, raw JSON. Do not include markdown formatting (like \`\`\`json). Do not add any conversational text before or after the JSON.
Your JSON must strictly match this schema structure:
{
  "personalSummary": "A compelling 3-4 sentence professional summary. Focus on impact and unique value.",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start Date - End Date",
      "bullets": ["Achievement 1 with metrics", "Achievement 2 showcasing leadership"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University/School",
      "year": "Graduation Year",
      "details": "Optional details, coursework, or honors"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"]
}`;

        const fewShotExamples = `
--- FEW-SHOT EXAMPLES (HOW TO WRITE EXPERIENCE BULLETS) ---
BAD EXAMPLE (Vague, task-oriented):
- "Wrote code for the user interface."
- "Managed the database."

GOOD EXAMPLE (Impact-driven, metric-focused, ATS-friendly):
- "Engineered a responsive React user interface, reducing Largest Contentful Paint (LCP) by 1.2s and improving conversion rates by 15%."
- "Architected a highly scalable PostgreSQL database schema, supporting 50,000+ daily active users with 99.9% uptime."
---------------------------------------------------------
`;

        let systemInstruction = "";

        if (profileType === 'student') {
            systemInstruction = `
You are an elite Tech/Corporate Recruiter and expert copywriter. 
Your task is to transform raw user input from a Student/Fresh Graduate into a highly compelling, ATS-optimized CV structure.
Focus on elevating academic projects, volunteer work, and extracurriculars. Translate their raw passion and coursework into "transferable soft and hard skills". 
Make them sound ambitious, capable, and ready to learn.
CRITICAL: The user might be inexperienced or provide minimal input. Intelligently fill in missing fields. You can add items like relevant courses, hobbies, volunteer work, or freelance projects. If there are 'Null' or empty fields, invent appropriate and realistic content.
You MUST create a minimum of 3 experience entries, 2 education entries, and 8 skills. Even if the user's provided information is insufficient, generate logical and realistic CV content to fill these minimums.
The target role they are applying for is: ${targetRole}. Tailor the keywords heavily towards this role.

${fewShotExamples}
${schemaInstructions}`;
        } else {
            systemInstruction = `
You are an elite Executive Recruiter and expert copywriter. 
Your task is to transform raw user input from an Experienced Professional into a highly compelling, ATS-optimized CV structure.
Focus heavily on quantifiable metrics, industry-specific taxonomy, and concise executive summaries. 
Use strong action verbs (e.g., Architected, Spearheaded, Optimized).
CRITICAL: The user might leave some fields blank or provide minimal input. Intelligently fill in missing fields. If there are 'Null' or empty fields, invent appropriate and realistic content based on their role.
You MUST create a minimum of 3 experience entries, 2 education entries, and 8 skills. Even if the user's provided information is insufficient, generate logical and realistic CV content to fill these minimums.
The target role they are applying for is: ${targetRole}. Tailor the keywords heavily towards this role.

${fewShotExamples}
${schemaInstructions}`;
        }

        const userPrompt = `
       Raw Input Data:
       - Education/Background: ${education}
       - Experience/Projects: ${experience}
       - Skills: ${skills}
       ${jobDescription ? `\n\nCRITICAL CONTEXT: The user is applying for a specific job. Here is the job description:\n${jobDescription}\n\nYou MUST heavily optimize the CV content (especially the personalSummary and experience bullets) to match the required skills, keywords, and tone of this job description. If a required skill from the job description can be reasonably inferred from the user's raw input, emphasize it.` : ''}

       Process this data and construct a professional CV following the strict JSON schema.
    `;

        // DETERMINE MODELS: We use smaller, faster models for reasoning (Researcher/Critic) and the 70B for heavy writing.
        const WRITER_MODEL = 'llama-3.3-70b-versatile';
        const THINKING_MODEL = 'llama3-8b-8192';

        let structuredCV;
        let cleanedText = '';

        try {
            // ====================================================================================================
            // AGENT 1: THE RESEARCHER (Llama 8B - Fast & Cheap)
            // Goal: Read the job description and the user's raw input, then output a prioritized list of keywords, 
            // required skills, and the primary "tone" the CV should take.
            // ====================================================================================================
            let researcherInsights = "No specific job description provided. Prioritize general industry best practices.";
            if (jobDescription) {
                console.log("[AGENT 1] Researcher is analyzing the job description...");
                const researcherPrompt = `
You are an expert ATS (Applicant Tracking System) Analyst.
Analyze the following Job Description and the User's Raw Background.
Job Description:
${jobDescription}

User Background:
- Education: ${education}
- Experience: ${experience}
- Skills: ${skills}

Output a concise summary stating:
1. The top 5-7 most critical hard skills required by the job.
2. The top 3 most critical soft skills.
3. 2-3 specific recommendations on how the user's background should be reframed to exactly match this job.
Do not output anything else. Be extremely concise.
`;
                const researcherCompletion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: researcherPrompt }],
                    model: THINKING_MODEL,
                    temperature: 0.1, // Low temp for analytical accuracy
                });
                researcherInsights = researcherCompletion.choices[0]?.message?.content || researcherInsights;
                console.log("[AGENT 1] Analysis complete:", researcherInsights);
            }

            // ====================================================================================================
            // AGENT 1.5: THE SEMANTIC RERANKER (Llama 8B)
            // Goal: Filter out completely irrelevant experiences based on the target role before sending to the Writer.
            // ====================================================================================================
            let filteredExperience = experience;
            if (experience && experience.length > 50) {
                console.log("[AGENT 1.5] Reranker is filtering experiences...");
                const rerankerPrompt = `
You are a ruthless CV Editor.
The user is applying for: ${targetRole || 'A professional role'}
Here is their raw experience bullet points/text:
---
${experience}
---
Your job is to remove ONLY the experiences that are 100% irrelevant to the target role (e.g., keeping "Cashier" if applying for "Software Engineer").
If an experience has ANY transferable skills (Customer Service -> Communication), KEEP IT, but summarize why it's kept.
Return the filtered, highly relevant experience text. If everything is relevant, just return it as is. Do not be conversational.
`;
                const rerankerCompletion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: rerankerPrompt }],
                    model: THINKING_MODEL,
                    temperature: 0.0,
                });
                filteredExperience = rerankerCompletion.choices[0]?.message?.content || experience;
                console.log("[AGENT 1.5] Filtering complete.");
            }

            // ====================================================================================================
            // RAG (Retrieval-Augmented Generation) PIPELINE
            // Goal: Retrieve highly successful, proven CV snippets from our pgvector DB to guide the Writer model.
            // Note: Currently using a mock vector since OpenAI embeddings aren't active in this dev environment.
            // ====================================================================================================
            let ragContext = "No specific RAG examples found.";
            try {
                // In production, this would be: await openai.embeddings.create({ input: targetRole, model: 'text-embedding-3-small' });
                // We use a mock array to test the pgvector RPC integration logic safely.
                const mockQueryEmbedding = Array.from({ length: 1536 }, () => (Math.random() * 2 - 1) * 0.1);

                const { data: ragData, error: ragError } = await supabase.rpc('match_resume_knowledge', {
                    query_embedding: mockQueryEmbedding,
                    match_threshold: 0.5, // 50% similarity threshold
                    match_count: 3
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
            const userPromptWithRerankedData = `
       Raw Input Data:
       - Education/Background: ${education}
       - Experience/Projects (RERANKED & FILTERED): ${filteredExperience}
       - Skills: ${skills}
       ${jobDescription ? `\n\nCRITICAL CONTEXT: The user is applying for a specific job. Here is the job description:\n${jobDescription}\n\nYou MUST heavily optimize the CV content (especially the personalSummary and experience bullets) to match the required skills, keywords, and tone of this job description. If a required skill from the job description can be reasonably inferred from the user's raw input, emphasize it.` : ''}

       Process this data and construct a professional CV following the strict JSON schema.
    `;

            // ====================================================================================================
            // AGENT 2: THE WRITER (Llama 70B - High Quality & Heavy Lifting)
            // Goal: Take the strict schema, the few-shot examples, and the Researcher's precise insights, and 
            // compose the final structured CV.
            // ====================================================================================================
            console.log("[AGENT 2] Writer is generating the CV...");

            // Append the Researcher's insights and RAG context to the system instruction
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
                temperature: 0.4, // Slight temp for creative verbs, but strict enough for formatting
                response_format: { type: 'json_object' }
            });

            const rawWriterResponse = writerCompletion.choices[0]?.message?.content || '{}';
            cleanedText = rawWriterResponse.replace(/```json\n?|\`\`\`\n?/g, '').trim();

            try {
                // Initial parse attempt
                structuredCV = JSON.parse(cleanedText);
            } catch (jsonParseError) {
                console.warn("[AGENT 2] JSON Parse failed. Initiating Critic for automatic repair...");

                // ====================================================================================================
                // AGENT 3: THE CRITIC / REPAIRMAN (Llama 8B)
                // Goal: If the main writer hallucinated standard text around the JSON, the critic receives the raw text, 
                // extracts EXACTLY the JSON, and returns it.
                // ====================================================================================================
                const criticPrompt = `
You are a strict JSON parser. The following text contains a malformed JSON block or JSON surrounded by conversational text.
Your ONLY job is to extract the JSON object, fix any trailing commas or broken quotes, and output ONLY the raw JSON.
Any other text will cause a fatal system crash.

MALFORMED TEXT:
${cleanedText}
`;
                const criticCompletion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: criticPrompt }],
                    model: THINKING_MODEL, // Fast model for simple JSON extraction
                    temperature: 0.0,
                    response_format: { type: 'json_object' }
                });

                const repairedText = criticCompletion.choices[0]?.message?.content || '{}';

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
            // We don't fail the whole request if PDF generation fails, just log it.
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
