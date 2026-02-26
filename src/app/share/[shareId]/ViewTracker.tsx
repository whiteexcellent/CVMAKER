'use client';

import { useEffect, useRef } from 'react';

export default function ViewTracker({ shareId }: { shareId: string }) {
    const hasTracked = useRef(false);

    useEffect(() => {
        // Only track once per mount to prevent React StrictMode double-firing in dev or fast refreshes
        if (hasTracked.current) return;
        hasTracked.current = true;

        fetch('/api/share/track-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shareId })
        }).catch(err => console.error("Failed to track view:", err));
    }, [shareId]);

    return null; // Silent invisible component
}
