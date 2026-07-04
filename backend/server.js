require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs-extra');
const rateLimit = require('express-rate-limit');
const config = require('./config');

const app = express();
const PORT = config.PORT;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: config.CORS_ORIGIN,
  methods: ['GET', 'POST', 'DELETE']
}));

app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please wait 1 minute.' }
});
app.use('/api', limiter);

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/history', require('./routes/history'));
app.use('/api/share', require('./routes/share'));

fs.ensureFileSync(config.HISTORY_PATH);
try {
  const content = fs.readFileSync(config.HISTORY_PATH, 'utf-8');
  if (!content || content.trim() === '') {
    fs.writeJsonSync(config.HISTORY_PATH, []);
  }
} catch {
  fs.writeJsonSync(config.HISTORY_PATH, []);
}

if (!config.OPENROUTER_API_KEY) {
  console.warn('WARNING: OPENROUTER_API_KEY is not set. Analysis will fail.');
}
if (!process.env.OPENROUTER_BASE_URL) {
  console.warn('INFO: OPENROUTER_BASE_URL not set, using default.');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`History saved at ${config.HISTORY_PATH}`);
  console.log(`OpenRouter API: ${config.OPENROUTER_API_KEY ? 'Configured' : 'Missing'}`);
  console.log(`Rate limit: ${config.RATE_LIMIT_MAX} req/min`);
});
