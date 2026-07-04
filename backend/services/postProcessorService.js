function process(llmOutput) {
  if (!llmOutput || typeof llmOutput !== 'string') {
    throw new Error('Invalid LLM output: empty or non-string response');
  }

  return {
    success: true,
    spec: llmOutput
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
