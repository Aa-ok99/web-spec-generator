const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  HISTORY_PATH: process.env.HISTORY_PATH || path.join(__dirname, '..', 'data', 'history.json'),
  MAX_HISTORY_ITEMS: 100,
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 10,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  MODEL: 'cohere/north-mini-code:free',
  BLOCKED_DOMAINS: ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']
};
