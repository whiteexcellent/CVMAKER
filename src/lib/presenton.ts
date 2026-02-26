import { Presenton } from 'presenton';

// Initialize the Presenton SDK
// Requires PRESENTON_API_KEY in environment variables
const presenton = process.env.PRESENTON_API_KEY
    ? new Presenton({ apiKey: process.env.PRESENTON_API_KEY })
    : null;

/**
 * Generates a CV presentation/PDF using Presenton AI
 * @param cvData JSON representation of the CV
 * @returns Buffer of the generated PDF or null if generation fails / not configured
 */
export async function generatePresentonCV(cvData: any): Promise<Buffer | null> {
    if (!presenton) {
        console.warn('PRESENTON_API_KEY is not set. Skipping Presenton CV generation.');
        return null;
    }

    try {
        console.log('Sending CV data to Presenton API...');

        // Use Presenton SDK to generate a presentation from the JSON data
        // We prompt the AI to format it as a professional CV
        const response = await (presenton as any).generate({
            prompt: `Create a professional and visually appealing Curriculum Vitae (CV) for a ${cvData.targetRole || 'Professional'}. 
            
            Use the following data:
            - Profile: ${cvData.profileType}
            - Summary: ${cvData.summary}
            - Experience: ${cvData.experience?.map((e: any) => `${e.title} at ${e.company} (${e.duration}): ${e.description}`).join(' | ')}
            - Education: ${cvData.education?.map((e: any) => `${e.degree} at ${e.institution} (${e.year})`).join(' | ')}
            - Skills: ${cvData.skills?.join(', ')}
            
            Format this as a sleek, modern portfolio/resume presentation.`,
            format: 'pdf', // Requesting PDF format
            theme: 'modern_dark', // Assuming they have themes, fallback is standard
        });

        // The response should contain either a direct PDF buffer or a URL to download it
        // Depending on SDK version, we assuming it returns a buffer or stream for 'pdf' format
        if (Buffer.isBuffer(response)) {
            return response;
        } else if (response.url) {
            // If it returns a URL, we fetch it and return as Buffer
            const fileRes = await fetch(response.url);
            const arrayBuffer = await fileRes.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } else if (response.buffer && typeof response.buffer === 'function') {
            return await response.buffer();
        }

        console.error('Presenton generation returned an unknown format:', response);
        return null;

    } catch (error) {
        console.error('Presenton API Error:', error);
        return null;
    }
}
