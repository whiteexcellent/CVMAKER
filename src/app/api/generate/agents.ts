import { groq } from '@/lib/groq';

const THINKING_MODEL = 'llama3-8b-8192';

export async function runResearcher(jobDescription: string, education: string, experience: string, skills: string): Promise<string> {
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
        temperature: 0.1,
    });
    const insights = researcherCompletion.choices[0]?.message?.content || "No specific job description provided. Prioritize general industry best practices.";
    console.log("[AGENT 1] Analysis complete:", insights);
    return insights;
}

export async function runSemanticReranker(targetRole: string, experience: string): Promise<string> {
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
    const result = rerankerCompletion.choices[0]?.message?.content || experience;
    console.log("[AGENT 1.5] Filtering complete.");
    return result;
}

export async function runCritic(cleanedText: string): Promise<string> {
    const criticPrompt = `
You are a strict JSON parser. The following text contains a malformed JSON block or JSON surrounded by conversational text.
Your ONLY job is to extract the JSON object, fix any trailing commas or broken quotes, and output ONLY the raw JSON.
Any other text will cause a fatal system crash.

MALFORMED TEXT:
${cleanedText}
`;
    const criticCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: criticPrompt }],
        model: THINKING_MODEL,
        temperature: 0.0,
        response_format: { type: 'json_object' }
    });
    return criticCompletion.choices[0]?.message?.content || '{}';
}
