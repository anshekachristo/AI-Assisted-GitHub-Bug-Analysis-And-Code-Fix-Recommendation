const express = require('express');
const fs = require('fs');
const path = require('path');
const Issue = require('../models/Issue');
const { suggestFix } = require('../services/aiService');
const { extractFixedCode } = require('../services/parseFix');
const { CLONE_DIR, getRepoInfo, ensureRepoCloned, resolveRepoFilePath, logDiffInfo } = require('../services/pathHelper');
const router = express.Router();

// POST /api/fix  { issueId, model, targetFile? }
router.post('/', async (req, res) => {
  const { issueId, model, targetFile } = req.body;

  if (!issueId) {
    return res.status(400).json({ error: 'issueId is required' });
  }

  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (!issue.suggestedFile && !targetFile) {
      return res.status(400).json({ error: 'Run /api/analyze first to locate the file' });
    }

    const fileToFix = targetFile || issue.suggestedFile;
    const { owner, repo } = getRepoInfo(issue);
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Issue is missing owner or repo information' });
    }

    // Auto-clone repository if not present locally
    const repoPath = await ensureRepoCloned(owner, repo);
    const resolved = resolveRepoFilePath(repoPath, fileToFix);

    if (resolved.error) {
      logDiffInfo({
        repoPath,
        requestedFile: fileToFix,
        resolvedPath: resolved.resolvedPath || 'N/A',
        fileExists: false
      });
      return res.status(400).json(resolved);
    }

    const { resolvedPath, actualPath, fileExists } = resolved;

    if (!fileExists) {
      logDiffInfo({
        repoPath,
        requestedFile: fileToFix,
        resolvedPath,
        fileExists: false
      });
      return res.status(404).json({
        error: `File does not exist on disk: ${fileToFix}`,
        repoPath,
        requestedFile: fileToFix,
        resolvedPath
      });
    }

    // Capture the original code BEFORE any modification is made to the file
    const originalCode = fs.readFileSync(actualPath, 'utf-8');

    // Generate fix via AI service
    const aiResponse = await suggestFix(issue.title, issue.body, fileToFix, originalCode, model);
    const fixedCode = extractFixedCode(aiResponse, originalCode) || aiResponse;

    // Log the diff operation details
    logDiffInfo({
      repoPath,
      requestedFile: fileToFix,
      resolvedPath,
      fileExists: true,
      originalCode,
      fixedCode
    });

    if (targetFile) {
      // Store in the fileFixes array, replacing any existing entry for this file
      issue.fileFixes = (issue.fileFixes || []).filter(f => f.filePath !== targetFile);
      issue.fileFixes.push({
        filePath: targetFile,
        suggestedFix: aiResponse,
        originalCode,
        fixedCode,
        status: 'pending'
      });
      await issue.save();

      return res.json({
        success: true,
        issueId: issue._id,
        filePath: targetFile,
        suggestedFix: aiResponse,
        originalCode,
        fixedCode
      });
    }

    // Main file fix
    issue.suggestedFix = aiResponse;
    issue.originalCode = originalCode;
    issue.fixedCode = fixedCode;
    await issue.save();

    res.json({
      success: true,
      issueId: issue._id,
      suggestedFile: issue.suggestedFile,
      suggestedFix: aiResponse,
      originalCode,
      fixedCode
    });
  } catch (err) {
    console.error('[ORIGINAL DEBUG] Error in /api/fix:', err);
    res.status(500).json({ error: 'Failed to suggest fix', details: err.message });
  }
});

module.exports = router;