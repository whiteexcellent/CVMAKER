import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Check User Credits
        const { data: profile } = await supabase
            .from('profiles')
            .select('total_credits')
            .eq('id', user.id)
            .single();

        if (!profile || profile.total_credits <= 0) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
        }

        const body = await req.json();
        const { profileType, targetRole, education, experience, skills, jobDescription } = body;

        // 2. Initialize Anthropic Client
        if (!process.env.ANTHROPIC_API_KEY) {
            console.error("ANTHROPIC_API_KEY is missing");
            return NextResponse.json({ error: 'AI service is currently unavailable.' }, { status: 503 });
        }

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // 3. Prompt Engineering
        const schemaInstructions = `
You MUST respond with ONLY valid, raw JSON. Do not include markdown formatting (like \`\`\`json). Do not add any conversational text before or after the JSON.
Your JSON must strictly match this schema structure:
{
  "personalSummary": "A compelling 3-4 sentence professional summary.",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start Date - End Date",
      "bullets": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University/School",
      "year": "Graduation Year",
      "details": "Optional details or honors"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"]
}`;

        let systemInstruction = "";

        if (profileType === 'student') {
            systemInstruction = `
You are an elite Tech/Corporate Recruiter and expert copywriter. 
Your task is to transform raw user input from a Student/Fresh Graduate into a highly compelling, ATS-optimized CV structure.
Focus on elevating academic projects, volunteer work, and extracurriculars. Translate their raw passion and coursework into "transferable soft and hard skills". 
Make them sound ambitious, capable, and ready to learn.
The target role they are applying for is: ${targetRole}. Tailor the keywords heavily towards this role.
${schemaInstructions}`;
        } else {
            systemInstruction = `
You are an elite Executive Recruiter and expert copywriter. 
Your task is to transform raw user input from an Experienced Professional into a highly compelling, ATS-optimized CV structure.
Focus heavily on quantifiable metrics, industry-specific taxonomy, and concise executive summaries. 
Use strong action verbs (e.g., Architected, Spearheaded, Optimized).
The target role they are applying for is: ${targetRole}. Tailor the keywords heavily towards this role.
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

        // 4. Call Anthropic Claude
        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            temperature: 0.2, // Low temperature for deterministic/factual outputs
            system: systemInstruction,
            messages: [
                {
                    role: 'user',
                    content: userPrompt
                },
                // Pre-fill Claude's response with a curly brace to guarantee JSON output
                {
                    role: 'assistant',
                    content: '{'
                }
            ],
        });

        // Reconstruct the JSON string (since we seeded the output with '{')
        const rawResponse = '{' + (message.content[0] as any).text;

        // Clean up any potential markdown that Claude might still squeeze in
        const cleanedText = rawResponse.replace(/```json\n?|\`\`\`\n?/g, '').trim();

        let structuredCV;
        try {
            structuredCV = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse Anthropic output:", cleanedText);
            return NextResponse.json({ error: 'AI generated invalid structure. Please try again.' }, { status: 500 });
        }

        // 5. Save to Database & Deduct Credit
        await supabase.from('profiles')
            .update({ total_credits: profile.total_credits - 1 })
            .eq('id', user.id);

        await supabase.from('credit_transactions')
            .insert({ user_id: user.id, amount: -1, type: 'usage' });

        const { data: savedResume, error: saveError } = await supabase.from('resumes')
            .insert({
                user_id: user.id,
                title: `${targetRole} CV - ${new Date().toLocaleDateString()}`,
                content: structuredCV,
                status: 'generated'
            })
            .select()
            .single();

        if (saveError) {
            console.error("Error saving resume:", saveError)
            throw new Error("Failed to save resume securely.");
        }

        // 6. Return Data
        return NextResponse.json({ success: true, resumeId: savedResume.id, data: structuredCV });

    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
