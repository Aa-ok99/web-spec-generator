const MIN_SPEC_LENGTH = 200;

const FRONTEND_SECTIONS = [
  'Site Overview',
  'Design System',
  'Component Library',
  'Page Layout',
  'UX',
  'Accessibility',
  'Performance',
  'Clone Prompt'
];

const BACKEND_SECTIONS = [
  'System Architecture',
  'API Contract',
  'Data Model',
  'Event System',
  'Recommendation',
  'Architecture Diagram'
];

function normalizeSpec(spec) {
  return spec
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
}

function validateSectionHeaders(spec, expectedSections) {
  const missing = expectedSections.filter(section => {
    const regex = new RegExp(`##\\s+\\d+\\.?\\s*${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    return !regex.test(spec);
  });
  return missing;
}

function process(llmOutput, round) {
  if (!llmOutput || typeof llmOutput !== 'string') {
    throw new Error('Invalid LLM output: empty or non-string response');
  }

  const normalized = normalizeSpec(llmOutput);
  const warnings = [];

  if (normalized.length < MIN_SPEC_LENGTH) {
    warnings.push(`Spec is unusually short (${normalized.length} chars, expected >= ${MIN_SPEC_LENGTH})`);
  }

  if (!/^##\s/m.test(normalized)) {
    warnings.push('Spec may be missing markdown section headers');
  }

  if (round === 'frontend') {
    const missing = validateSectionHeaders(normalized, FRONTEND_SECTIONS);
    if (missing.length > 0) {
      warnings.push(`Missing frontend sections: ${missing.join(', ')}`);
    }
  } else if (round === 'backend') {
    const missing = validateSectionHeaders(normalized, BACKEND_SECTIONS);
    if (missing.length > 0) {
      warnings.push(`Missing backend sections: ${missing.join(', ')}`);
    }
  }

  return {
    success: true,
    spec: normalized,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function combine(frontendResult, backendResult) {
  const frontendSpec = frontendResult?.spec || '';
  const backendSpec = backendResult?.spec || '';

  const combined = frontendSpec + '\n\n---\n\n' + backendSpec;

  return {
    success: true,
    spec: combined.trim()
  };
}

module.exports = { process, combine };
