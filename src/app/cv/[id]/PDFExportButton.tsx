'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { MinimalistCVTemplate } from '@/components/templates/MinimalistTemplate';
import { Button } from '@/components/ui/button';

export default function PDFExportButton({ cvData, userFullName }: { cvData: any, userFullName: string }) {
    // react-pdf hydration workaround: render on client side only
    return (
        <PDFDownloadLink
            document={<MinimalistCVTemplate data={cvData} userFullName={userFullName} />}
            fileName={`${userFullName.replace(' ', '_')}_CV.pdf`}
        >
            {({ blob, url, loading, error }) => (
                <Button className="shadow-md shadow-primary/20" disabled={loading}>
                    {loading ? 'Preparing PDF...' : 'Download PDF'}
                </Button>
            )}
        </PDFDownloadLink>
    );
}
