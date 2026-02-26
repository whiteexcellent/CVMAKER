import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf', fontWeight: 700 },
    ]
});

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Inter',
        backgroundColor: '#ffffff',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        color: '#0284c7', // Sky 600
        fontWeight: 600,
    },
    contact: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 8,
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: '#0f172a',
        textTransform: 'uppercase',
        marginBottom: 10,
        letterSpacing: 1,
    },
    summary: {
        fontSize: 10,
        lineHeight: 1.5,
        color: '#334155',
    },
    experienceItem: {
        marginBottom: 15,
    },
    jobHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    jobTitle: {
        fontSize: 12,
        fontWeight: 600,
        color: '#0f172a',
    },
    jobCompany: {
        fontSize: 11,
        fontWeight: 600,
        color: '#334155',
        marginBottom: 4,
    },
    jobDate: {
        fontSize: 10,
        color: '#64748b',
    },
    bullet: {
        fontSize: 10,
        lineHeight: 1.5,
        color: '#334155',
        marginBottom: 4,
        paddingLeft: 10,
    },
    bulletContainer: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    bulletPoint: {
        width: 10,
        fontSize: 10,
    },
    bulletText: {
        flex: 1,
        fontSize: 10,
        lineHeight: 1.5,
        color: '#334155',
    },
    educationItem: {
        marginBottom: 10,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    skillBadge: {
        fontSize: 9,
        backgroundColor: '#f1f5f9',
        color: '#334155',
        padding: '4px 8px',
        borderRadius: 4,
        marginBottom: 6,
        marginRight: 6,
    }
});

interface ResumePDFProps {
    data: {
        personalSummary?: string;
        experience?: any[];
        education?: any[];
        skills?: string[];
        fullName?: string;
        targetRole?: string;
        email?: string;
    };
}

export const MinimalistTemplate: React.FC<ResumePDFProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.name}>{data.fullName || 'Professional User'}</Text>
                <Text style={styles.title}>{data.targetRole || 'Software Engineer'}</Text>
                <View style={styles.contact}>
                    <Text>{data.email || 'user@omnicv.com'}</Text>
                </View>
            </View>

            {/* Summary */}
            {data.personalSummary && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Summary</Text>
                    <Text style={styles.summary}>{data.personalSummary}</Text>
                </View>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    {data.experience.map((exp, i) => (
                        <View key={i} style={styles.experienceItem}>
                            <View style={styles.jobHeader}>
                                <Text style={styles.jobTitle}>{exp.title}</Text>
                                <Text style={styles.jobDate}>{exp.duration}</Text>
                            </View>
                            <Text style={styles.jobCompany}>{exp.company}</Text>
                            {exp.bullets && exp.bullets.map((bullet: string, j: number) => (
                                <View key={j} style={styles.bulletContainer}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.bulletText}>{bullet}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    {data.education.map((edu, i) => (
                        <View key={i} style={styles.educationItem}>
                            <View style={styles.jobHeader}>
                                <Text style={styles.jobTitle}>{edu.degree}</Text>
                                <Text style={styles.jobDate}>{edu.year}</Text>
                            </View>
                            <Text style={styles.jobCompany}>{edu.institution}</Text>
                            {edu.details && <Text style={styles.summary}>{edu.details}</Text>}
                        </View>
                    ))}
                </View>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View style={styles.skillsContainer}>
                        {data.skills.map((skill, i) => (
                            <Text key={i} style={styles.skillBadge}>{skill}</Text>
                        ))}
                    </View>
                </View>
            )}
        </Page>
    </Document>
);
