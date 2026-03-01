const fs = require('fs')
const path = 'src/app/wizard/page.tsx'
let content = fs.readFileSync(path, 'utf8')

// Add imports
if (!content.includes('WizardStep1')) {
    content = content.replace(
        /import \{ AIChatSidebar \} from '@\/components\/wizard\/AIChatSidebar';/,
        `import { AIChatSidebar } from '@/components/wizard/AIChatSidebar';
import { WizardStep1 } from './steps/WizardStep1';
import { WizardStep2 } from './steps/WizardStep2';
import { WizardStep3 } from './steps/WizardStep3';
import { WizardStep4 } from './steps/WizardStep4';`
    )
}

// Replace Step 1
const step1Start = content.indexOf('{step === 1 && (')
const step1End = content.indexOf(')}', content.indexOf('</CardContent>', step1Start)) + 2 // include )}
if (step1Start !== -1 && step1End !== -1) {
    const replacement = `{step === 1 && (
                                    <WizardStep1 
                                        linkedinUrl={linkedinUrl} 
                                        setLinkedinUrl={setLinkedinUrl} 
                                        isImporting={isImporting} 
                                        handleLinkedInImport={handleLinkedInImport} 
                                        formData={formData} 
                                        setFormData={setFormData} 
                                        jobUrl={jobUrl} 
                                        setJobUrl={setJobUrl} 
                                        isScrapingJob={isScrapingJob} 
                                        handleScraping={handleScraping} 
                                    />
                                )}`
    content = content.substring(0, step1Start) + replacement + content.substring(step1End)
}

// Replace Step 2
const step2Start = content.indexOf('{step === 2 && (')
const step2End = content.indexOf(')}', content.indexOf('</CardContent>', step2Start)) + 2 // include )}
if (step2Start !== -1 && step2End !== -1) {
    const replacement = `{step === 2 && (
                                    <WizardStep2 formData={formData} setFormData={setFormData} />
                                )}`
    content = content.substring(0, step2Start) + replacement + content.substring(step2End)
}

// Replace Step 3
const step3Start = content.indexOf('{step === 3 && (')
const step3End = content.indexOf(')}', content.indexOf('</CardContent>', step3Start)) + 2
if (step3Start !== -1 && step3End !== -1) {
    const replacement = `{step === 3 && (
                                    <WizardStep3 formData={formData} setFormData={setFormData} />
                                )}`
    content = content.substring(0, step3Start) + replacement + content.substring(step3End)
}

// Replace Step 4
const step4Start = content.indexOf('{step === 4 && (')
const step4End = content.indexOf(')}', content.indexOf('</CardContent>', step4Start)) + 2
if (step4Start !== -1 && step4End !== -1) {
    const replacement = `{step === 4 && (
                                    <WizardStep4 formData={formData} setFormData={setFormData} />
                                )}`
    content = content.substring(0, step4Start) + replacement + content.substring(step4End)
}

fs.writeFileSync(path, content)
console.log('Wizard steps substituted successfully')
