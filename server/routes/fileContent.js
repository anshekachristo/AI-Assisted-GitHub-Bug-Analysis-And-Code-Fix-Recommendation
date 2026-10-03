const express = require('express');
const fs = require('fs');
const path = require('path');
const Issue = require('../models/Issue');
const { CLONE_DIR, getRepoInfo, ensureRepoCloned, resolveRepoFilePath, logDiffInfo } = require('../services/pathHelper');
const router = express.Router();

// GET /api/file-content?issueId=xxx&targetFile=yyy
router.get('/', async (req, res) => {
  const { issueId, targetFile } = req.query;

  if (!issueId) {
    return res.status(400).json({ error: 'issueId query param is required' });
  }

  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const requestedFile = targetFile || issue.suggestedFile;
    if (!requestedFile) {
      return res.status(400).json({ error: 'Issue has no suggested file specified' });
    }

    const { owner, repo } = getRepoInfo(issue);
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner or repo information missing for this issue' });
    }

    // Auto-clone repo if not present locally
    const repoPath = await ensureRepoCloned(owner, repo);
    const resolved = resolveRepoFilePath(repoPath, requestedFile);

    if (resolved.error) {
      logDiffInfo({
        repoPath,
        requestedFile,
        resolvedPath: resolved.resolvedPath || 'N/A',
        fileExists: false
      });
      return res.status(400).json(resolved);
    }

    const { resolvedPath, actualPath, fileExists } = resolved;

    if (!fileExists) {
      logDiffInfo({
        repoPath,
        requestedFile,
        resolvedPath,
        fileExists: false
      });
      return res.status(404).json({
        error: 'Original file not found on disk',
        repoPath,
        requestedFile,
        resolvedPath
      });
    }

    // Read the actual original source code from disk
    const originalCode = fs.readFileSync(actualPath, 'utf-8');

    logDiffInfo({
      repoPath,
      requestedFile,
      resolvedPath,
      fileExists: true,
      originalCode,
      fixedCode: issue.fixedCode || ''
    });

    // Cache in MongoDB issue document if not already stored
    if (!targetFile && !issue.originalCode) {
      issue.originalCode = originalCode;
      await issue.save();
    }

    res.json({
      success: true,
      originalCode,
      fixedCode: issue.fixedCode || '',
      content: originalCode // backwards compatibility
    });
  } catch (err) {
    console.error('[ORIGINAL DEBUG] Error in /api/file-content:', err);
    res.status(500).json({
      error: 'Failed to read file',
      details: err.message
    });
  }
});

module.exports = router;