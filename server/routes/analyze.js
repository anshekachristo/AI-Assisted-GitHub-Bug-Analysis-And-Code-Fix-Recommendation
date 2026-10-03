const express = require('express');
const fs = require('fs');
const path = require('path');
const Issue = require('../models/Issue');
const { locateFile } = require('../services/aiService');
const { findReferencingFiles } = require('../services/impactScan');
const { CLONE_DIR, getRepoInfo, ensureRepoCloned, resolveRepoFilePath, cleanFilePath } = require('../services/pathHelper');
const router = express.Router();

// Recursively get all code file paths in a repo (skip node_modules, .git, etc.)
function getAllFiles(dirPath, arrayOfFiles = [], baseDir = dirPath) {
  const files = fs.readdirSync(dirPath);
  
  const skipFolders = ['node_modules', '.git', 'dist', 'build', 'coverage'];
  const allowedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.py', '.java', '.php'];

  const MAX_FILES = 150; // safety cap to avoid exceeding AI token limits on large repos

  for (const file of files) {
    if (arrayOfFiles.length >= MAX_FILES) break;

    const fullPath = path.join(dirPath, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!skipFolders.includes(file)) {
          getAllFiles(fullPath, arrayOfFiles, baseDir);
        }
      } else {
        const ext = path.extname(file);
        if (allowedExtensions.includes(ext)) {
          const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
          arrayOfFiles.push(relativePath);
        }
      }
    } catch {
      // Ignore unreadable files
    }
  }

  return arrayOfFiles;
}

// POST /api/analyze  { issueId, model }
router.post('/', async (req, res) => {
  const { issueId, model } = req.body;

  if (!issueId) {
    return res.status(400).json({ error: 'issueId is required' });
  }

  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const { owner, repo } = getRepoInfo(issue);
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Issue is missing owner or repo information' });
    }

    // Auto-clone if missing
    const repoPath = await ensureRepoCloned(owner, repo);

    const fileList = getAllFiles(repoPath);

    const rawSuggested = await locateFile(issue.title, issue.body, fileList, model);
    const suggestedFile = cleanFilePath(rawSuggested).replace(/\\/g, '/');

    // Validate against filesystem using resolveRepoFilePath
    const resolved = resolveRepoFilePath(repoPath, suggestedFile);
    if (resolved.error || !resolved.fileExists) {
      return res.status(422).json({
        error: `AI suggested a file ("${suggestedFile}") that does not exist in the repository. This can happen if the model hallucinated a path. Try a different model.`,
        repoPath,
        requestedFile: suggestedFile,
        resolvedPath: resolved.resolvedPath || 'N/A'
      });
    }

    // Capture the original code immediately from disk before any changes
    const originalCode = fs.readFileSync(resolved.actualPath, 'utf-8');

    // Check which other files reference/import this one
    const affectedFiles = findReferencingFiles(repoPath, suggestedFile, fileList);

    issue.suggestedFile = suggestedFile;
    issue.affectedFiles = affectedFiles;
    issue.originalCode = originalCode;

    await issue.save();

    res.json({
      success: true,
      issueId: issue._id,
      suggestedFile,
      originalCode,
      affectedFiles,
      modelUsed: model || 'gpt-oss-120b'
    });
  } catch (err) {
    console.error('[ORIGINAL DEBUG] Error analyzing issue:', err);
    res.status(500).json({ error: 'Failed to analyze issue', details: err.message });
  }
});

module.exports = router;