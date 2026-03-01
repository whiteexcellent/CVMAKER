const fs = require('fs')
const path = 'src/app/dashboard/DashboardClient.tsx'
let content = fs.readFileSync(path, 'utf8')

// Add imports
if (!content.includes('HistoryTab')) {
    content = content.replace(
        /import \{ CompanySearchTab \} from '\.\/tabs\/CompanySearchTab'/,
        `import { CompanySearchTab } from './tabs/CompanySearchTab'
import { HistoryTab } from './tabs/HistoryTab'
import { CoverLettersTab } from './tabs/CoverLettersTab'
import { PresentationsTab } from './tabs/PresentationsTab'`
    )
}

// Replace HISTORY TAB
const historyStart = content.indexOf('{/* MY CVS (HISTORY) TAB */}')
const historyEnd = content.indexOf('                </TabsContent>', historyStart)
if (historyStart !== -1 && historyEnd !== -1) {
    const replacement = `{/* MY CVS (HISTORY) TAB */}
                <TabsContent value="history">
                    <HistoryTab resumes={localResumes} handleDeleteResume={handleDeleteResume} />`
    content = content.substring(0, historyStart) + replacement + content.substring(historyEnd)
}

// Replace COVER LETTERS TAB
const clStart = content.indexOf('{/* COVER LETTERS TAB */}')
const clEnd = content.indexOf('                </TabsContent>', clStart)
if (clStart !== -1 && clEnd !== -1) {
    const replacement = `{/* COVER LETTERS TAB */}
                <TabsContent value="cover-letters">
                    <CoverLettersTab coverLetters={localCoverLetters} />`
    content = content.substring(0, clStart) + replacement + content.substring(clEnd)
}

// Replace PRESENTATIONS TAB
const presStart = content.indexOf('{/* PRESENTATIONS TAB */}')
const presEnd = content.indexOf('                </TabsContent>', presStart)
if (presStart !== -1 && presEnd !== -1) {
    const replacement = `{/* PRESENTATIONS TAB */}
                <TabsContent value="presentations">
                    <PresentationsTab presentations={localPresentations} />`
    content = content.substring(0, presStart) + replacement + content.substring(presEnd)
}

fs.writeFileSync(path, content)
console.log('Tabs substituted successfully')
