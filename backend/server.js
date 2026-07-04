require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs-extra');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'DELETE']
}));

app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 10,
  message: { error: 'Too many requests, please wait 1 minute.' }
});
app.use('/api', limiter);

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/history', require('./routes/history'));
app.use('/api/share', require('./routes/share'));

const HISTORY_PATH = path.join(__dirname, 'data', 'history.json');
fs.ensureFileSync(HISTORY_PATH);
try {
  const content = fs.readFileSync(HISTORY_PATH, 'utf-8');
  if (!content || content.trim() === '') {
    fs.writeJsonSync(HISTORY_PATH, []);
  }
} catch {
  fs.writeJsonSync(HISTORY_PATH, []);
}

if (!process.env.OPENROUTER_API_KEY) {
  console.warn('WARNING: OPENROUTER_API_KEY is not set. Analysis will fail.');
}
if (!process.env.OPENROUTER_BASE_URL) {
  console.warn('INFO: OPENROUTER_BASE_URL not set, using default.');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`History saved at ${HISTORY_PATH}`);
  console.log(`OpenRouter API: ${process.env.OPENROUTER_API_KEY ? 'Configured' : 'Missing'}`);
  console.log(`Rate limit: ${process.env.RATE_LIMIT_MAX || 10} req/min`);
});
