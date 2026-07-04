const specService = require('../services/specService');

async function analyzeWebsite(req, res) {
  try {
    const { url, apiKey } = req.body;
    const result = await specService.generateSpec(url, apiKey);
    res.json(result);
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed. Please try again.' });
  }
}

module.exports = { analyzeWebsite };
