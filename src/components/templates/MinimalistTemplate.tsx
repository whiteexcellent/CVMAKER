import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register standard fonts (e.g., Helvetica is built-in, but custom fonts need network requests)
// For maximum reliability in Server Components/Browser, we use default fonts first.

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333',
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    name: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        color: '#111',
        letterSpacing: 1,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#111',
        marginTop: 15,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        paddingBottom: 2,
    },
    text: {
        marginBottom: 5,
    },
    experienceItem: {
        marginBottom: 10,
    },
    experienceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    jobTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 11,
    },
    date: {
        color: '#666',
        fontSize: 9,
    },
    company: {
        fontFamily: 'Helvetica-Oblique',
        marginBottom: 4,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 3,
        paddingLeft: 10,
    },
    bullet: {
        width: 10,
        fontSize: 10,
    },
    bulletText: {
        flex: 1,
    },
    educationItem: {
        marginBottom: 8,
    },
    educationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    skillBadge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 6,
        paddingVertical: 3,
        marginRight: 5,
        marginBottom: 5,
        borderRadius: 3,
        fontSize: 9,
    },
});

interface CVProps {
    data: any;
    userFullName: string;
}

export const MinimalistCVTemplate = ({ data, userFullName }: CVProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.name}>{userFullName || 'Your Name'}</Text>
            </View>

            {/* SUMMARY */}
            <View>
                <Text style={styles.sectionTitle}>Professional Summary</Text>
                <Text style={styles.text}>{data.personalSummary}</Text>
            </View>

            {/* EXPERIENCE */}
            {data.experience && data.experience.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    {data.experience.map((exp: any, i: number) => (
                        <View key={`${exp.company}-${i}`} style={styles.experienceItem}>
                            <View style={styles.experienceHeader}>
                                <Text style={styles.jobTitle}>{exp.title}</Text>
                                <Text style={styles.date}>{exp.duration}</Text>
                            </View>
                            <Text style={styles.company}>{exp.company}</Text>
                            {exp.bullets && exp.bullets.map((bullet: string, j: number) => (
                                <View key={`bullet-${j}`} style={styles.bulletPoint}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.bulletText}>{bullet}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            )}

            {/* EDUCATION */}
            {data.education && data.education.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>Education</Text>
                    {data.education.map((edu: any, i: number) => (
                        <View key={`${edu.institution}-${i}`} style={styles.educationItem}>
                            <View style={styles.educationHeader}>
                                <Text style={styles.jobTitle}>{edu.degree}</Text>
                                <Text style={styles.date}>{edu.year}</Text>
                            </View>
                            <Text style={styles.text}>{edu.institution}</Text>
                            {edu.details && <Text style={{ ...styles.text, color: '#666', fontSize: 9 }}>{edu.details}</Text>}
                        </View>
                    ))}
                </View>
            )}

            {/* SKILLS */}
            {data.skills && data.skills.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View style={styles.skillsContainer}>
                        {data.skills.map((skill: string, i: number) => (
                            <Text key={skill} style={styles.skillBadge}>{skill}</Text>
                        ))}
                    </View>
                </View>
            )}

        </Page>
    </Document>
);
