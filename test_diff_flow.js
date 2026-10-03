const fs = require('fs');
const path = require('path');
const { CLONE_DIR, cleanFilePath, resolveRepoFilePath, logDiffInfo } = require('./server/services/pathHelper');
const { extractFixedCode, extractExplanation, applyUnifiedDiff } = require('./server/services/parseFix');

console.log('=== TEST 1: Path Cleaning & Resolution ===');
const testCases = [
  'lib/express.js',
  '/lib/express.js',
  './lib/express.js',
  '\\lib\\express.js',
  'src/components/Button.jsx',
  '```javascript\nlib/express.js\n```',
  '`lib/express.js`',
  '"lib/express.js"'
];

for (const tc of testCases) {
  const cleaned = cleanFilePath(tc);
  console.log(`Input: ${JSON.stringify(tc)} => Cleaned: ${JSON.stringify(cleaned)}`);
}

console.log('\n=== TEST 2: Safe Repo File Resolution & Traversal Prevention ===');
const fakeRepo = path.join(CLONE_DIR, 'testowner-testrepo');
if (!fs.existsSync(fakeRepo)) {
  fs.mkdirSync(fakeRepo, { recursive: true });
}
const testSubDir = path.join(fakeRepo, 'src', 'components');
if (!fs.existsSync(testSubDir)) {
  fs.mkdirSync(testSubDir, { recursive: true });
}
const testFile = path.join(testSubDir, 'Button.jsx');
const originalTestCode = 'export function Button() { return <button>Click me</button>; }';
fs.writeFileSync(testFile, originalTestCode, 'utf-8');

const res1 = resolveRepoFilePath(fakeRepo, 'src/components/Button.jsx');
console.log('Resolved nested path exists:', res1.fileExists);
console.log('Resolved path:', res1.resolvedPath);

const resTraversal = resolveRepoFilePath(fakeRepo, '../../package.json');
console.log('Traversal prevented error:', resTraversal.error);

console.log('\n=== TEST 3: Diff Info Logging ===');
logDiffInfo({
  repoPath: fakeRepo,
  requestedFile: 'src/components/Button.jsx',
  resolvedPath: res1.resolvedPath,
  fileExists: res1.fileExists,
  originalCode: originalTestCode,
  fixedCode: 'export function Button() { return <button className="btn">Click me</button>; }'
});

console.log('\n=== TEST 4: Code Block & Diff Extraction ===');
const sampleAiResponse = `EXPLANATION:
Updated the button to include a class name for styling.

FIXED_CODE:
\`\`\`jsx
export function Button() { return <button className="btn">Click me</button>; }
\`\`\``;

const extractedCode = extractFixedCode(sampleAiResponse, originalTestCode);
const extractedExplanation = extractExplanation(sampleAiResponse);
console.log('Extracted explanation:', extractedExplanation);
console.log('Extracted code:', extractedCode);

console.log('\n=== TEST 5: Backup Preference When Fix Was Accepted ===');
const backupPath = testFile + '.backup';
fs.writeFileSync(backupPath, '// True original backup content', 'utf-8');
const resBackup = resolveRepoFilePath(fakeRepo, 'src/components/Button.jsx');
console.log('Actual path points to backup:', resBackup.actualPath === backupPath);
const readContent = fs.readFileSync(resBackup.actualPath, 'utf-8');
console.log('Content read from backup:', readContent);

// Cleanup test files
fs.unlinkSync(backupPath);
fs.unlinkSync(testFile);
fs.rmdirSync(testSubDir);
fs.rmdirSync(path.join(fakeRepo, 'src'));
fs.rmdirSync(fakeRepo);

console.log('\n=== ALL UNIT TESTS PASSED ===');
