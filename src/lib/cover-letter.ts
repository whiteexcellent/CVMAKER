import { CoverLetterContent, coverLetterContentSchema } from '@/lib/schemas';

function stripHtmlTags(value: string): string {
    return value
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function normalizeCoverLetterContent(content: unknown): CoverLetterContent {
    if (typeof content === 'string') {
        try {
            return normalizeCoverLetterContent(JSON.parse(content));
        } catch {
            const paragraphs = Array.from(content.matchAll(/<p[^>]*>(.*?)<\/p>/gi))
                .map((match) => stripHtmlTags(match[1] || ''))
                .filter(Boolean);

            return {
                paragraphs: paragraphs.length > 0 ? paragraphs : [stripHtmlTags(content)].filter(Boolean),
            };
        }
    }

    const parsed = coverLetterContentSchema.safeParse(content);
    if (parsed.success) {
        return parsed.data;
    }

    return { paragraphs: [] };
}
