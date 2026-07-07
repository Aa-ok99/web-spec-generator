function sanitizeFilename(url) {
  try {
    const u = new URL(url);
    let host = u.hostname.replace(/^www\./, '').replace(/\./g, '-');
    host = host.replace(/[^a-z0-9-]/gi, '');
    return host + '-spec.md';
  } catch (_) {
    return 'website-spec.md';
  }
}

function extractPromptOnly(markdown) {
  const match = markdown.match(/\[COPY FROM HERE\]([\s\S]*?)\[COPY TO HERE\]/);
  if (match) return match[1].trim();
  return markdown;
}

module.exports = {
  sanitizeFilename,
  extractPromptOnly
};
