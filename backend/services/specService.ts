const { validateUrl, checkSSRF, resolveApiKey } = require('./analyzeService');
const pipelineService = require('./pipelineService');
const historyService = require('./historyService');
const { nanoid } = require('nanoid');

async function generateSpec(url, apiKey) {
  const parsed = validateUrl(url);
  checkSSRF(parsed);
  const resolvedKey = resolveApiKey(apiKey);

  const result = await pipelineService.run(parsed.href, resolvedKey);

  const id = nanoid(8);
  const entry = {
    id,
    url,
    title: result.title || 'Unknown',
    createdAt: new Date().toISOString(),
    spec: result.spec
  };
  await historyService.save(entry);

  return {
    success: true,
    id,
    spec: result.spec,
    title: result.title,
    url: result.url,
    shareUrl: `/share/${id}`
  };
}

module.exports = { generateSpec };
