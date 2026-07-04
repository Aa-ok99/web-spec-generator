const crawlerService = require('./crawlerService');
const analyzerService = require('./analyzerService');
const promptBuilderService = require('./promptBuilderService');
const llmService = require('./llmService');
const postProcessorService = require('./postProcessorService');
const logger = require('../utils/pipelineLogger');

async function run(url, apiKey) {
  const context = {
    url,
    steps: {},
    startTime: Date.now()
  };

  // Step 1: Crawl
  logger.step('crawler', 'start', { url });
  let websiteData;
  try {
    websiteData = await crawlerService.crawl(url);
    if (!websiteData) {
      throw new Error('Crawler returned no data');
    }
    context.steps.crawler = { status: 'ok', title: websiteData.title };
    logger.step('crawler', 'end', { title: websiteData.title });
  } catch (err) {
    logger.error('crawler', err);
    throw err;
  }

  // Step 2: Analyze
  logger.step('analyzer', 'start');
  let analysisResult;
  try {
    analysisResult = await analyzerService.analyze(websiteData);
    context.steps.analyzer = { status: 'ok', regions: analysisResult.layoutRegions };
    logger.step('analyzer', 'end', { regions: analysisResult.layoutRegions, patterns: analysisResult.uiPatterns });
  } catch (err) {
    logger.error('analyzer', err);
    throw err;
  }

  // ---- ROUND 1: Frontend (sections 1-8) ----
  logger.step('promptBuilder', 'start', { round: 1, type: 'frontend' });
  let frontendPrompt;
  try {
    frontendPrompt = await promptBuilderService.buildFrontend(analysisResult, websiteData);
    context.steps.promptBuilderFrontend = { status: 'ok' };
    logger.step('promptBuilder', 'end', { round: 1, type: 'frontend' });
  } catch (err) {
    logger.error('promptBuilder', err);
    throw err;
  }

  logger.step('llm', 'start', { round: 1, type: 'frontend' });
  let frontendOutput;
  try {
    frontendOutput = await llmService.call(frontendPrompt, apiKey);
    context.steps.llmFrontend = { status: 'ok', outputLength: frontendOutput?.length };
    logger.step('llm', 'end', { round: 1, type: 'frontend', outputLength: frontendOutput?.length });
  } catch (err) {
    logger.error('llm', err);
    throw err;
  }

  logger.step('postProcessor', 'start', { round: 1, type: 'frontend' });
  let frontendResult;
  try {
    frontendResult = await postProcessorService.process(frontendOutput);
    context.steps.postProcessorFrontend = { status: 'ok', success: frontendResult.success };
    logger.step('postProcessor', 'end', { round: 1, type: 'frontend', success: frontendResult.success });
  } catch (err) {
    logger.error('postProcessor', err);
    throw err;
  }

  // ---- ROUND 2: Backend (sections 9-14) ----
  logger.step('promptBuilder', 'start', { round: 2, type: 'backend' });
  let backendPrompt;
  try {
    backendPrompt = await promptBuilderService.buildBackend(analysisResult, websiteData, frontendResult.spec);
    context.steps.promptBuilderBackend = { status: 'ok' };
    logger.step('promptBuilder', 'end', { round: 2, type: 'backend' });
  } catch (err) {
    logger.error('promptBuilder', err);
    throw err;
  }

  logger.step('llm', 'start', { round: 2, type: 'backend' });
  let backendOutput;
  try {
    backendOutput = await llmService.call(backendPrompt, apiKey);
    context.steps.llmBackend = { status: 'ok', outputLength: backendOutput?.length };
    logger.step('llm', 'end', { round: 2, type: 'backend', outputLength: backendOutput?.length });
  } catch (err) {
    logger.error('llm', err);
    throw err;
  }

  logger.step('postProcessor', 'start', { round: 2, type: 'backend' });
  let backendResult;
  try {
    backendResult = await postProcessorService.process(backendOutput);
    context.steps.postProcessorBackend = { status: 'ok', success: backendResult.success };
    logger.step('postProcessor', 'end', { round: 2, type: 'backend', success: backendResult.success });
  } catch (err) {
    logger.error('postProcessor', err);
    throw err;
  }

  // Combine frontend + backend
  logger.step('combiner', 'start');
  let result;
  try {
    result = await postProcessorService.combine(frontendResult, backendResult);
    context.steps.combiner = { status: 'ok', totalLength: result.spec?.length };
    logger.step('combiner', 'end', { totalLength: result.spec?.length });
  } catch (err) {
    logger.error('combiner', err);
    throw err;
  }

  logger.complete(context);

  return {
    ...result,
    title: websiteData.title,
    url: websiteData.url
  };
}

module.exports = { run };
