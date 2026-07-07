const config = require('../config');

function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Valid URL is required');
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs are allowed');
  }

  return parsed;
}

function checkSSRF(parsedUrl) {
  if (config.BLOCKED_DOMAINS.includes(parsedUrl.hostname)) {
    throw new Error('Internal/private URLs are not allowed');
  }
  if (parsedUrl.hostname.startsWith('192.168.') || parsedUrl.hostname.startsWith('10.')) {
    throw new Error('Internal/private URLs are not allowed');
  }
}

function resolveApiKey(apiKey) {
  const isPlaceholder = apiKey && (apiKey.includes('xxxxxxxx') || apiKey === config.OPENROUTER_API_KEY);
  const useClientKey = apiKey && typeof apiKey === 'string' && !isPlaceholder;
  const resolvedKey = useClientKey ? apiKey : config.OPENROUTER_API_KEY;

  if (!resolvedKey) {
    throw new Error('OpenRouter API Key is required. Please set in .env or provide in request.');
  }

  return resolvedKey;
}

module.exports = { validateUrl, checkSSRF, resolveApiKey };
