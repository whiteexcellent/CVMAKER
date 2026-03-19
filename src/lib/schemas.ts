import { z } from 'zod';

const shortText = (max: number, min = 0) => z.string().trim().min(min).max(max);
const optionalShortText = (max: number) => z.string().trim().max(max).optional();
const longText = (max: number, min = 0) => z.string().trim().min(min).max(max);

export const resumeExperienceSchema = z.object({
    title: shortText(160, 1),
    company: shortText(160, 1),
    duration: shortText(120, 1),
    bullets: z.array(longText(500, 1)).min(1).max(12),
});

export const resumeEducationSchema = z.object({
    degree: shortText(160, 1),
    institution: shortText(160, 1),
    year: shortText(40, 1),
    details: optionalShortText(500),
});

export const resumeContentSchema = z.object({
    personalSummary: longText(2500, 1),
    targetRole: optionalShortText(160),
    experience: z.array(resumeExperienceSchema).min(1).max(10),
    education: z.array(resumeEducationSchema).min(1).max(8),
    skills: z.array(shortText(80, 1)).min(1).max(40),
});

export const coverLetterContentSchema = z.object({
    sender_name: optionalShortText(160),
    sender_contact: optionalShortText(240),
    recipient_name: optionalShortText(160),
    date: optionalShortText(80),
    subject: optionalShortText(240),
    paragraphs: z.array(longText(2500, 1)).max(12).default([]),
    meta: z.object({
        resume_id: z.string().uuid().optional(),
        target_company: optionalShortText(160),
        target_role: optionalShortText(160),
    }).partial().optional(),
});

export const presentationSlideSchema = z.object({
    heading: shortText(180, 1),
    talking_points: z.array(longText(400, 1)).min(1).max(8),
    why_im_a_fit: longText(1200, 1),
});

export const presentationContentSchema = z.object({
    title: shortText(200, 1),
    subtitle: optionalShortText(240),
    slides: z.array(presentationSlideSchema).min(1).max(10),
    conclusion: optionalShortText(1200),
});

export const generateCvRequestSchema = z.object({
    profileType: optionalShortText(40),
    targetRole: optionalShortText(160),
    education: optionalShortText(8_000),
    experience: optionalShortText(16_000),
    skills: optionalShortText(4_000),
    jobDescription: optionalShortText(16_000),
}).strict();

export const coverLetterGenerateRequestSchema = z.object({
    resumeId: z.string().uuid(),
    jobDescription: optionalShortText(16_000),
    targetRole: shortText(160, 2),
    targetCompany: optionalShortText(160),
    language: shortText(40).default('English'),
}).strict();

export const presentationGenerateRequestSchema = z.object({
    resumeId: z.string().uuid(),
    jobDescription: optionalShortText(16_000),
    targetRole: shortText(160, 2),
    targetCompany: shortText(160, 2),
    language: shortText(40).default('English'),
}).strict();

export const linkedinImportRequestSchema = z.object({
    linkedinUrl: z.string().url().max(500),
}).strict();

export const linkedinImportResponseSchema = z.object({
    experience: optionalShortText(16_000).default(''),
    education: optionalShortText(8_000).default(''),
    skills: optionalShortText(4_000).default(''),
    summary: optionalShortText(4_000).default(''),
    fullName: optionalShortText(160).default(''),
    targetRole: optionalShortText(160).default(''),
});

export const jobScrapeRequestSchema = z.object({
    jobUrl: z.string().url().max(500),
}).strict();

export const jobScrapeResponseSchema = z.object({
    title: optionalShortText(200).default(''),
    company: optionalShortText(200).default(''),
    description: optionalShortText(20_000).default(''),
});

export const resumePatchSchema = z.object({
    content: resumeContentSchema,
}).strict();

export const magicRewriteRequestSchema = z.object({
    textToRewrite: longText(2_000, 2),
    instruction: optionalShortText(500),
}).strict();

export const mockInterviewRequestSchema = z.object({
    resumeData: z.record(z.string(), z.unknown()),
    jobDescription: optionalShortText(16_000),
    targetRole: optionalShortText(160),
    companyName: optionalShortText(160),
}).strict();

export const shareEnableRequestSchema = z.object({
    documentId: z.string().uuid(),
    type: z.enum(['resume', 'cover_letter', 'presentation']),
}).strict();

export type ResumeContent = z.infer<typeof resumeContentSchema>;
export type CoverLetterContent = z.infer<typeof coverLetterContentSchema>;
export type PresentationContent = z.infer<typeof presentationContentSchema>;
export type LinkedInImportResponse = z.infer<typeof linkedinImportResponseSchema>;
export type JobScrapeResponse = z.infer<typeof jobScrapeResponseSchema>;
