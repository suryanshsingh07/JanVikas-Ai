const fs = require('fs');
const path = require('path');

// All page files that should get the back button
// (skip Landing.jsx — it's the home page)
const pages = [
  'frontend/src/pages/About.jsx',
  'frontend/src/pages/PrivacyPolicy.jsx',
  'frontend/src/pages/TermsOfService.jsx',
  'frontend/src/pages/auth/Login.jsx',
  'frontend/src/pages/auth/Register.jsx',
  'frontend/src/pages/auth/ForgotPassword.jsx',
  'frontend/src/pages/citizen/CitizenDashboard.jsx',
  'frontend/src/pages/citizen/MySubmissions.jsx',
  'frontend/src/pages/citizen/Notifications.jsx',
  'frontend/src/pages/citizen/Profile.jsx',
  'frontend/src/pages/citizen/SubmitIssue.jsx',
  'frontend/src/pages/citizen/TrackSubmission.jsx',
  'frontend/src/pages/official/OfficialDashboard.jsx',
  'frontend/src/pages/official/OfficialAIInsights.jsx',
  'frontend/src/pages/official/OfficialAnalytics.jsx',
  'frontend/src/pages/official/OfficialMap.jsx',
  'frontend/src/pages/official/OfficialProjects.jsx',
  'frontend/src/pages/official/OfficialSubmissions.jsx',
  'frontend/src/pages/admin/AdminDashboard.jsx',
  'frontend/src/pages/admin/AdminDatasets.jsx',
  'frontend/src/pages/admin/AdminModeration.jsx',
  'frontend/src/pages/admin/AdminProjects.jsx',
  'frontend/src/pages/admin/AdminReports.jsx',
  'frontend/src/pages/admin/AdminUsers.jsx',
];

const IMPORT_LINE = "import BackButton from '../../components/common/BackButton';";
const IMPORT_LINE_AUTH = "import BackButton from '../../components/common/BackButton';";
const IMPORT_LINE_TOP = "import BackButton from '../components/common/BackButton';";

let patched = 0;
let skipped = 0;

for (const relPath of pages) {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ Not found: ${relPath}`);
    skipped++;
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already patched
  if (content.includes('BackButton')) {
    console.log(`↩ Already has BackButton: ${relPath}`);
    skipped++;
    continue;
  }

  // Determine correct relative import path
  const depth = relPath.split('/').length - 1; // depth from frontend/src
  let importLine;
  if (depth === 3) {
    // pages/auth/*, pages/citizen/*, pages/official/*, pages/admin/*
    importLine = "import BackButton from '../../components/common/BackButton';";
  } else {
    // pages/About.jsx, pages/PrivacyPolicy.jsx etc.
    importLine = "import BackButton from '../components/common/BackButton';";
  }

  // 1. Add import after the last existing import line
  const importRegex = /^(import .+;)(\r?\n)/gm;
  let lastImportIndex = 0;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    lastImportIndex = match.index + match[0].length;
  }

  if (lastImportIndex === 0) {
    console.log(`⚠ Could not find import block in: ${relPath}`);
    skipped++;
    continue;
  }

  // Insert import after last import
  content = content.slice(0, lastImportIndex) + importLine + '\n' + content.slice(lastImportIndex);

  // 2. Insert <BackButton className="mb-4" /> after the first opening <div> or <section> in the return()
  // Strategy: find the first return ( then find the first JSX tag opening
  const returnMatch = content.match(/return\s*\(\s*\n(\s*)<(\w+)/);
  if (returnMatch) {
    const indent = returnMatch[1];
    const tag = returnMatch[2];
    // Find the position right after the opening tag line  
    const searchStr = returnMatch[0];
    const searchIdx = content.indexOf(searchStr);
    // Find the end of the first tag's opening line (after the first child)
    // We'll insert <BackButton> as first child inside the outermost div
    const tagOpenEnd = content.indexOf('\n', searchIdx + searchStr.length);
    if (tagOpenEnd !== -1) {
      content = content.slice(0, tagOpenEnd + 1) +
        `${indent}  <BackButton className="mb-6" />\n` +
        content.slice(tagOpenEnd + 1);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Patched: ${relPath}`);
  patched++;
}

console.log(`\nDone: ${patched} patched, ${skipped} skipped.`);
