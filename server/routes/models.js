const express = require('express');
const { AVAILABLE_MODELS } = require('../services/aiService');
const router = express.Router();

router.get('/', (req, res) => {
  const models = Object.keys(AVAILABLE_MODELS).map(key => ({
    key,
    label: key
  }));
  res.json(models);
});

module.exports = router;