const { fetchWebsiteContent, analyzeWithOpenRouter } = require('../services/openrouterService');
const fs = require('fs-extra');
const path = require('path');
const { nanoid } = require('nanoid');

const HISTORY_PATH = path.join(__dirname, '../data/history.json');

function getHistory() {
  try {
    return fs.readJsonSync(HISTORY_PATH);
  } catch {
    return [];
  }
}

function saveHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > 100) history.pop();
  fs.writeJsonSync(HISTORY_PATH, history, { spaces: 2 });
}

async function analyzeWebsite(req, res) {
  try {
    const { url, apiKey } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    let parsed;
    try {
      parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).json({ error: 'Only http and https URLs are allowed' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const blockedDomains = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'];
    if (blockedDomains.includes(parsed.hostname) || parsed.hostname.startsWith('192.168.') || parsed.hostname.startsWith('10.')) {
      return res.status(400).json({ error: 'Internal/private URLs are not allowed' });
    }

    const isPlaceholder = apiKey && (apiKey.includes('xxxxxxxx') || apiKey === process.env.OPENROUTER_API_KEY);
    const useClientKey = apiKey && typeof apiKey === 'string' && !isPlaceholder;
    const openRouterKey = useClientKey ? apiKey : process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      return res.status(400).json({
        error: 'OpenRouter API Key is required. Please set in .env or provide in request.'
      });
    }

    const websiteData = await fetchWebsiteContent(parsed.href);
    if (!websiteData) {
      return res.status(400).json({
        error: 'Cannot fetch website content. Please check URL or internet connection.'
      });
    }

    const specMarkdown = await analyzeWithOpenRouter(websiteData, openRouterKey);

    const id = nanoid(8);
    const entry = {
      id,
      url,
      title: websiteData.title || 'Unknown',
      createdAt: new Date().toISOString(),
      spec: specMarkdown
    };
    saveHistory(entry);

    res.json({
      success: true,
      id,
      spec: specMarkdown,
      title: websiteData.title,
      url: websiteData.url,
      shareUrl: `/share/${id}`
    });

  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({
      error: error.message || 'Analysis failed. Please try again.'
    });
  }
}

module.exports = { analyzeWebsite };
