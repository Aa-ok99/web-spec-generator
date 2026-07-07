const path = require('path');
const fs = require('fs-extra');

function resolveBackendRoot() {
  let dir = path.resolve(__dirname);
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.resolve(dir, '..');
  }
  return path.resolve(__dirname, '..');
}

const BACKEND_ROOT = resolveBackendRoot();

module.exports = {
  BACKEND_ROOT,
  PORT: process.env.PORT || 5000,
  HISTORY_PATH: process.env.HISTORY_PATH || path.join(BACKEND_ROOT, 'data', 'history.json'),
  MAX_HISTORY_ITEMS: 100,
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 10,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  MODEL: process.env.MODEL || 'nvidia/nemotron-3-nano-30b-a3b:free',
  DB_URL: process.env.DB_URL || '',
  BLOCKED_DOMAINS: ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']
};
