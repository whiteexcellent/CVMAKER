const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

type EmbeddingApiResponse = {
    data?: Array<{ embedding?: number[] }>;
    error?: { message?: string };
};

export async function createEmbedding(input: string): Promise<number[] | null> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || !input.trim()) {
        return null;
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: OPENAI_EMBEDDING_MODEL,
            input,
        }),
        signal: AbortSignal.timeout(20_000),
    });

    const payload = await response.json() as EmbeddingApiResponse;
    if (!response.ok) {
        throw new Error(payload.error?.message || 'Embedding request failed.');
    }

    return payload.data?.[0]?.embedding || null;
}
