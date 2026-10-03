const express = require('express');
const axios = require('axios');
const Issue = require('../models/Issue');
const router = express.Router();

const TARGET_LABELS = ['bug', 'error', 'help wanted'];

router.get('/issues', async (req, res) => {
  const { owner, repo } = req.query;

  if (!owner || !repo) {
    return res.status(400).json({ error: 'owner and repo query params are required' });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json'
        },
        params: {
          state: 'open',
          per_page: 50
        }
      }
    );

    const issuesOnly = response.data.filter(item => !item.pull_request);

    let filtered = issuesOnly.filter(issue =>
    issue.labels.some(label => TARGET_LABELS.includes(label.name.toLowerCase()))
);

// Fallback: if no labeled issues found, show all open issues instead
let usedFallback = false;
if (filtered.length === 0) {
  filtered = issuesOnly;
  usedFallback = true;
}
    // Save each issue to MongoDB (update if it already exists, insert if new)
    const savedIssues = [];
    for (const issue of filtered) {
      const saved = await Issue.findOneAndUpdate(
        { githubId: issue.id },
        {
          githubId: issue.id,
          number: issue.number,
          title: issue.title,
          body: issue.body,
          labels: issue.labels.map(l => l.name),
          url: issue.html_url,
          owner,
          repo,
          createdAt: issue.created_at
        },
        { upsert: true, new: true }
      );
      savedIssues.push(saved);
    }

    res.json({ issues: savedIssues, usedFallback });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch issues from GitHub' });
  }
});

module.exports = router;