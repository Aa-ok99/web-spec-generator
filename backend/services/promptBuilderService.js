const systemPromptFrontend = require('../prompts/systemPromptFrontend');
const systemPromptBackend = require('../prompts/systemPromptBackend');
const { buildUserPrompt } = require('../prompts/userPrompt');

function buildAnalysisHeader(analysisResult) {
  const regions = analysisResult.layoutRegions?.join(', ') || 'unknown';
  const patterns = analysisResult.uiPatterns?.join(', ') || 'unknown';
  const colors = analysisResult.designHints?.colors?.slice(0, 8).join(', ') || 'unknown';
  const fonts = analysisResult.designHints?.fonts?.slice(0, 5).join(', ') || 'unknown';

  return `[ANALYSIS CONTEXT]\nDetected Layout: ${regions}\nDetected UI Patterns: ${patterns}\nKey Colors: ${colors}\nKey Fonts: ${fonts}\n\n`;
}

function buildFrontend(analysisResult, websiteData) {
  return {
    system: buildAnalysisHeader(analysisResult) + systemPromptFrontend,
    user: buildUserPrompt(websiteData)
  };
}

function buildBackend(analysisResult, websiteData, frontendSpec) {
  const summary = frontendSpec
    ? `[FRONTEND SPECIFICATION SUMMARY]\n${frontendSpec.slice(0, 2000)}\n\n---\n\n`
    : '';
  return {
    system: buildAnalysisHeader(analysisResult) + systemPromptBackend,
    user: summary + buildUserPrompt(websiteData)
  };
}

module.exports = { buildFrontend, buildBackend };
