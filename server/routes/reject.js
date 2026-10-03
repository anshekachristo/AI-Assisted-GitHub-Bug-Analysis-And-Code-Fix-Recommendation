const express = require('express');
const Issue = require('../models/Issue');
const router = express.Router();

// POST /api/reject  { issueId }
router.post('/', async (req, res) => {
  const { issueId } = req.body;

  if (!issueId) {
    return res.status(400).json({ error: 'issueId is required' });
  }

  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    issue.status = 'rejected';
    await issue.save();

    res.json({ message: 'Fix rejected', issueId: issue._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to reject fix', details: err.message });
  }
});

module.exports = router;