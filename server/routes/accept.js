const express = require('express');
const fs = require('fs');
const path = require('path');
const Issue = require('../models/Issue');
const { extractFixedCode } = require('../services/parseFix');
const { CLONE_DIR, getRepoInfo, resolveRepoFilePath } = require('../services/pathHelper');
const router = express.Router();

// POST /api/accept  { issueId, targetFile? }
router.post('/', async (req, res) => {
  const { issueId, targetFile } = req.body;

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
      return res.status(400).json({ error: 'Owner or repo information missing for this issue' });
    }

    const repoPath = path.join(CLONE_DIR, `${owner}-${repo}`);

    let fileToAccept, rawFixResponse, precomputedFixedCode;

    if (targetFile) {
      // Accepting a fix for one of the AFFECTED files
      const fixEntry = (issue.fileFixes || []).find(f => f.filePath === targetFile);
      if (!fixEntry || (!fixEntry.suggestedFix && !fixEntry.fixedCode)) {
        return res.status(400).json({ error: `No suggested fix found for ${targetFile}. Run /api/fix with targetFile first.` });
      }
      fileToAccept = targetFile;
      rawFixResponse = fixEntry.suggestedFix;
      precomputedFixedCode = fixEntry.fixedCode;
    } else {
      // Main suggested file
      if (!issue.suggestedFix && !issue.fixedCode) {
        return res.status(400).json({ error: 'No suggested fix found. Run /api/fix first.' });
      }
      fileToAccept = issue.suggestedFile;
      rawFixResponse = issue.suggestedFix;
      precomputedFixedCode = issue.fixedCode;
    }

    const resolved = resolveRepoFilePath(repoPath, fileToAccept);
    if (resolved.error || !resolved.fileExists) {
      return res.status(400).json({
        error: 'Target file does not exist on disk',
        repoPath,
        requestedFile: fileToAccept,
        resolvedPath: resolved.resolvedPath || 'N/A'
      });
    }

    const filePath = resolved.resolvedPath;

    const fixedCode = precomputedFixedCode || extractFixedCode(rawFixResponse);
    if (!fixedCode) {
      return res.status(500).json({ error: 'Could not parse fixed code from AI response' });
    }

    // Backup original file before overwriting (safety net)
    const backupPath = filePath + '.backup';
    if (!fs.existsSync(backupPath) && fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }

    // Write the fixed code to the actual file
    fs.writeFileSync(filePath, fixedCode, 'utf-8');

    if (targetFile) {
      const fixEntry = issue.fileFixes.find(f => f.filePath === targetFile);
      if (fixEntry) {
        fixEntry.status = 'accepted';
      }
    } else {
      issue.status = 'accepted';
    }

    await issue.save();

    res.json({
      message: 'Fix applied successfully',
      issueId: issue._id,
      filePath,
      backupPath
    });
  } catch (err) {
    console.error('[ACCEPT] Error applying fix:', err);
    res.status(500).json({ error: 'Failed to apply fix', details: err.message });
  }
});

module.exports = router;