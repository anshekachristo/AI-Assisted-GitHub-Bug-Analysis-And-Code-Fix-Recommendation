const express = require('express');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { CLONE_DIR } = require('../services/pathHelper');
const router = express.Router();

// POST /api/clone  { owner, repo }
router.post('/', async (req, res) => {
  const { owner, repo } = req.body;

  if (!owner || !repo) {
    return res.status(400).json({ error: 'owner and repo are required' });
  }

  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const repoPath = path.join(CLONE_DIR, `${cleanOwner}-${cleanRepo}`);

  try {
    if (fs.existsSync(repoPath)) {
      return res.json({ message: 'Repo already cloned', path: repoPath });
    }

    const git = simpleGit();
    const repoUrl = `https://github.com/${cleanOwner}/${cleanRepo}.git`;

    await git.clone(repoUrl, repoPath, ['--depth', '1']); // shallow clone, faster

    res.json({ message: 'Repo cloned successfully', path: repoPath });
  } catch (err) {
    console.error('[CLONE] Error cloning repo:', err.message);
    res.status(500).json({ error: 'Failed to clone repo', details: err.message });
  }
});

module.exports = router;