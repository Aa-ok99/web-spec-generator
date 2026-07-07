const llmService = require('./llmService');
const historyService = require('./historyService');
const codeGenPrompt = require('../prompts/systemPromptCodeGen');
const previewBuilder = require('../utils/previewBuilder');
const zipBuilder = require('../utils/zipBuilder');
const { nanoid } = require('nanoid');

async function generate(specId, apiKey) {
  const historyItem = await historyService.getById(specId);
  if (!historyItem) {
    throw Object.assign(new Error('Spec not found'), { statusCode: 404 });
  }

  if (historyItem.generatedCode) {
    return {
      id: historyItem.generatedCode.id,
      code: historyItem.generatedCode.files['App.jsx'],
      previewHtml: historyItem.generatedCode.previewHtml,
      createdAt: historyItem.generatedCode.createdAt,
      cached: true
    };
  }

  const MAX_SPEC_CHARS = 12000;
  const truncatedSpec = historyItem.spec.length > MAX_SPEC_CHARS
    ? historyItem.spec.slice(0, MAX_SPEC_CHARS) + '\n\n...[spec truncated due to length]...'
    : historyItem.spec;

  const prompt = {
    system: codeGenPrompt.system,
    user: codeGenPrompt.user(truncatedSpec)
  };

  let raw = await llmService.call(prompt, apiKey, 2, 8192);

  if (!raw || typeof raw !== 'string') {
    throw Object.assign(new Error('AI returned empty response'), { statusCode: 502 });
  }

  let code = extractJsx(raw);
  if (!code) {
    code = extractCodeBlock(raw);
  }
  if (!code) {
    code = raw;
  }

  const genId = nanoid(8);
  const previewHtml = previewBuilder.build(code);
  const generatedEntry = {
    id: genId,
    files: { 'App.jsx': code },
    previewHtml,
    createdAt: new Date().toISOString()
  };

  await historyService.updateGeneratedCode(specId, generatedEntry);

  return {
    id: genId,
    code,
    previewHtml,
    createdAt: generatedEntry.createdAt,
    cached: false
  };
}

async function downloadZip(specId) {
  const historyItem = await historyService.getById(specId);
  if (!historyItem) {
    throw Object.assign(new Error('Spec not found'), { statusCode: 404 });
  }

  if (!historyItem.generatedCode) {
    throw Object.assign(new Error('No generated code found. Generate code first.'), { statusCode: 400 });
  }

  const code = historyItem.generatedCode.files['App.jsx'];
  return zipBuilder.build(code);
}

function extractJsx(text) {
  if (!text) return null;
  const match = text.match(/```(?:jsx|tsx|react|javascript|js)\s*\n([\s\S]*?)```/);
  if (match) return match[1].trim();
  return null;
}

function extractCodeBlock(text) {
  if (!text) return null;
  const match = text.match(/```\w*\n([\s\S]*?)```/);
  if (match) return match[1].trim();
  return null;
}

async function generateFromPrompt(promptText, apiKey) {
  const prompt = {
    system: codeGenPrompt.system,
    user: `Build a complete, unique React + Tailwind application for this request:

${promptText}

Requirements:
- Use a proper color scheme, typography, and spacing (invent a fitting design system based on the request)
- Implement loading, empty, error, and success states
- Responsive mobile-first layout with Tailwind breakpoints
- Semantic HTML with ARIA attributes
- Smooth hover/transition animations
- Polish: proper spacing, alignment, visual hierarchy
- The app must render WITHOUT errors

Return ONLY \`\`\`jsx...\`\`\` with a single \`App\` function — no imports, no exports.`
  };

  let raw = await llmService.call(prompt, apiKey, 2, 8192);

  if (!raw || typeof raw !== 'string') {
    throw Object.assign(new Error('AI returned empty response'), { statusCode: 502 });
  }

  let code = extractJsx(raw);
  if (!code) {
    code = extractCodeBlock(raw);
  }
  if (!code) {
    code = raw;
  }

  const genId = nanoid(8);
  const previewHtml = previewBuilder.build(code);
  const generatedEntry = {
    id: genId,
    files: { 'App.jsx': code },
    previewHtml,
    createdAt: new Date().toISOString()
  };

  const title = promptText.length > 80
    ? promptText.slice(0, 80) + '...'
    : promptText;

  const historyEntry = {
    id: genId,
    type: 'prompt',
    url: `prompt://${title}`,
    title,
    createdAt: generatedEntry.createdAt,
    spec: '',
    generatedCode: generatedEntry
  };
  await historyService.save(historyEntry);

  return {
    id: genId,
    code,
    previewHtml,
    createdAt: generatedEntry.createdAt,
    cached: false
  };
}

module.exports = { generate, downloadZip, generateFromPrompt };
