const specService = require('../services/specService');
const codeGenService = require('../services/codeGenService');
const analyzeService = require('../services/analyzeService');

async function analyzeWebsite(req, res) {
  try {
    const { url, apiKey } = req.body;
    const result = await specService.generateSpec(url, apiKey);
    res.json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    console.error('Analyze error:', error);
    res.status(status).json({ error: error.message || 'Analysis failed. Please try again.' });
  }
}

async function generateCode(req, res) {
  try {
    const { specId, apiKey } = req.body;
    if (!specId) {
      return res.status(400).json({ error: 'specId is required' });
    }
    const key = analyzeService.resolveApiKey(apiKey);
    const result = await codeGenService.generate(specId, key);
    res.json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    console.error('Generate error:', error);
    res.status(status).json({ error: error.message || 'Code generation failed.' });
  }
}

async function downloadZip(req, res) {
  try {
    const { id } = req.params;
    const buffer = await codeGenService.downloadZip(id);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="generated-app-${id}.zip"`);
    res.send(buffer);
  } catch (error) {
    const status = error.statusCode || 500;
    console.error('Download error:', error);
    res.status(status).json({ error: error.message || 'Download failed.' });
  }
}

async function generateFromPrompt(req, res) {
  try {
    const { prompt, apiKey } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }
    const key = analyzeService.resolveApiKey(apiKey);
    const result = await codeGenService.generateFromPrompt(prompt.trim(), key);
    res.json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    console.error('Generate from prompt error:', error);
    res.status(status).json({ error: error.message || 'Code generation failed.' });
  }
}

module.exports = { analyzeWebsite, generateCode, downloadZip, generateFromPrompt };
