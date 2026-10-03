const fs = require('fs');
const path = require('path');

const CLONE_DIR = path.resolve(__dirname, '..', 'cloned_repos');

// Ensure cloned_repos directory exists
if (!fs.existsSync(CLONE_DIR)) {
  fs.mkdirSync(CLONE_DIR, { recursive: true });
}

/**
 * Extract owner and repo from an Issue document, falling back to its GitHub URL.
 */
function getRepoInfo(issue) {
  let owner = issue?.owner;
  let repo = issue?.repo;

  if ((!owner || !repo) && issue?.url) {
    const match = issue.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      owner = owner || match[1];
      repo = repo || match[2];
    }
  }

  return {
    owner: owner ? owner.trim() : '',
    repo: repo ? repo.trim() : ''
  };
}

/**
 * Clean a file path string returned by AI or query params.
 * Strips markdown code blocks, backticks, quotes, whitespace, and leading slashes.
 */
function cleanFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') return '';

  let cleaned = filePath.trim();

  // Strip code block fences if present: ```js\npath\n```
  const codeBlockMatch = cleaned.match(/```[a-zA-Z0-9_-]*\r?\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Strip quotes and backticks
  cleaned = cleaned.replace(/^['"`]+|['"`]+$/g, '').trim();

  // Remove leading './' or '.\' or '/' or '\'
  cleaned = cleaned.replace(/^(\.\/|\.\\)/, '').replace(/^[\\\/]+/, '');

  return cleaned;
}

/**
 * Ensure a repository is cloned locally. If missing, shallow clones it automatically.
 */
async function ensureRepoCloned(owner, repo) {
  if (!owner || !repo) {
    throw new Error('Owner and repo are required to clone');
  }
  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const repoPath = path.resolve(CLONE_DIR, `${cleanOwner}-${cleanRepo}`);

  if (fs.existsSync(repoPath)) {
    return repoPath;
  }

  const simpleGit = require('simple-git');
  const git = simpleGit();
  const repoUrl = `https://github.com/${cleanOwner}/${cleanRepo}.git`;

  console.log(`[ORIGINAL DEBUG] Repository directory does not exist: ${repoPath}`);
  console.log(`[ORIGINAL DEBUG] Auto-cloning repository from ${repoUrl}...`);
  await git.clone(repoUrl, repoPath, ['--depth', '1']);
  console.log(`[ORIGINAL DEBUG] Repository cloned successfully into ${repoPath}`);

  return repoPath;
}

/**
 * Safely resolve a requested file inside a cloned repo directory.
 * Prevents directory traversal attacks and correctly handles nested paths on all OSes.
 */
function resolveRepoFilePath(repoPath, requestedFile) {
  if (!repoPath) {
    return { error: 'Repository path is required' };
  }

  const cleanPath = cleanFilePath(requestedFile);
  if (!cleanPath) {
    return { error: 'Requested file path is missing or invalid' };
  }

  const resolvedRepoPath = path.resolve(repoPath);
  // Normalize path separators to platform convention
  const normalizedRelPath = path.normalize(cleanPath);
  const resolvedPath = path.resolve(resolvedRepoPath, normalizedRelPath);

  // Security check: ensure path does not escape repo root
  if (!resolvedPath.startsWith(resolvedRepoPath)) {
    return {
      error: 'Resolved path is outside repository directory',
      repoPath: resolvedRepoPath,
      requestedFile,
      resolvedPath
    };
  }

  // Check if a backup file exists (from a previously accepted fix)
  const backupPath = resolvedPath + '.backup';
  const hasBackup = fs.existsSync(backupPath);
  const hasCurrentFile = fs.existsSync(resolvedPath);

  // If backup exists, that contains the true original before any fix was applied
  const actualPath = hasBackup ? backupPath : resolvedPath;
  const fileExists = hasBackup || hasCurrentFile;

  return {
    repoPath: resolvedRepoPath,
    requestedFile,
    cleanPath,
    resolvedPath,
    backupPath,
    actualPath,
    fileExists
  };
}

/**
 * Standardized logging for original code and diff operations.
 */
function logDiffInfo({ repoPath, requestedFile, resolvedPath, fileExists, originalCode, fixedCode }) {
  console.log("[ORIGINAL DEBUG] Clone directory:", repoPath);
  console.log("[ORIGINAL DEBUG] Requested file:", requestedFile);
  console.log("[ORIGINAL DEBUG] Resolved file:", resolvedPath);
  console.log("[ORIGINAL DEBUG] Exists:", fileExists);

  if (fileExists && originalCode !== undefined && originalCode !== null) {
    console.log("[ORIGINAL DEBUG] Original code length:", originalCode.length);
    console.log("[ORIGINAL DEBUG] Original code preview:");
    console.log(originalCode.substring(0, 500));
  } else {
    console.log("[ORIGINAL DEBUG] Original code length: N/A");
  }

  if (fixedCode !== undefined && fixedCode !== null) {
    console.log("[ORIGINAL DEBUG] Fixed code length:", fixedCode.length);
  }
}

module.exports = {
  CLONE_DIR,
  getRepoInfo,
  cleanFilePath,
  ensureRepoCloned,
  resolveRepoFilePath,
  logDiffInfo
};
