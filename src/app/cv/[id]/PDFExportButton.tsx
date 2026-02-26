'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadCloud } from 'lucide-react';

export default function PDFExportButton({ pdfUrl, userFullName }: { pdfUrl?: string | null, userFullName: string }) {
    if (!pdfUrl) {
        return (
            // Fallback if the PDF isn't ready or wasn't generated
            <Button className="shadow-md shadow-primary/20" disabled>
                PDF Unavailable
            </Button>
        );
    }

    return (
        <Button className="shadow-md shadow-primary/20 group hover:shadow-primary/40 transition-all font-semibold" asChild>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download={`${userFullName.replace(/\s+/g, '_')}_CV.pdf`}>
                <DownloadCloud className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                Download PDF
            </a>
        </Button>
    );
}
