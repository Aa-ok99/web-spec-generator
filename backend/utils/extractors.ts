function extractColors($) {
  const colors = new Set();

  $('[style]').each((_, el) => {
    const s = $(el).attr('style') || '';
    const matches = s.match(/(?:color|background|border-[a-z]+|outline|box-shadow|text-shadow|fill|stroke)\s*:\s*([^;]+)/gi);
    if (matches) matches.forEach(m => {
      const val = m.split(':')[1]?.trim();
      if (val && /^#[0-9a-fA-F]{3,8}$|^rgb(a?)\(|^hsl(a?)\(/.test(val)) colors.add(val);
    });
  });

  $('style').each((_, el) => {
    const css = $(el).html() || '';
    const matches = css.match(/(?:--[\w-]+|#[0-9a-fA-F]{3,8}|rgb(?:a)?\s*\([^)]+\)|hsl(?:a)?\s*\([^)]+\))/g);
    if (matches) matches.forEach(c => { if (/^#/.test(c) || /^(rgb|hsl)/.test(c)) colors.add(c); });
  });

  $('meta[name="theme-color"]').each((_, el) => {
    const c = $(el).attr('content');
    if (c) colors.add(c);
  });

  return [...colors].slice(0, 30);
}

function extractFonts($) {
  const fonts = new Set();
  $('[style]').each((_, el) => {
    const s = $(el).attr('style') || '';
    const m = s.match(/font-family\s*:\s*([^;]+)/i);
    if (m) m[1].split(',').forEach(f => fonts.add(f.trim().replace(/['"]/g, '')));
  });
  $('style').each((_, el) => {
    const css = $(el).html() || '';
    const m = css.match(/font-family\s*:\s*([^;}]+)/gi);
    if (m) m.forEach(f => {
      const val = f.split(':')[1]?.trim();
      if (val) val.split(',').forEach(v => fonts.add(v.trim().replace(/['"]/g, '')));
    });
  });
  $('link[href*="fonts"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const m = href.match(/family=([^&]+)/);
    if (m) m[1].split('|').forEach(f => fonts.add(decodeURIComponent(f).replace(/:\w+/g, '')));
  });
  return [...fonts].filter(f => f && f !== 'inherit' && f !== 'initial').slice(0, 15);
}

function extractCssVars($) {
  const vars = {};
  $('style').each((_, el) => {
    const css = $(el).html() || '';
    const m = css.matchAll(/--([\w-]+)\s*:\s*([^;]+)/g);
    for (const match of m) {
      vars[match[1].trim()] = match[2].trim();
    }
  });
  $('[style]').each((_, el) => {
    const s = $(el).attr('style') || '';
    const m = s.match(/var\(--([\w-]+)\)/g);
    if (m) m.forEach(v => vars[v.match(/--([\w-]+)/)[1]] = '(used inline)');
  });
  return Object.keys(vars).length > 0 ? vars : null;
}

function extractDesignTokens($) {
  const tokens: Record<string, any> = {};

  const radius = new Set();
  $('[style*="border-radius"]').each((_, el) => {
    const m = $(el).attr('style')?.match(/border-radius\s*:\s*([^;]+)/);
    if (m) radius.add(m[1].trim());
  });
  if (radius.size) tokens.borderRadius = [...radius].slice(0, 5);

  const shadows = new Set();
  $('[style*="box-shadow"]').each((_, el) => {
    const m = $(el).attr('style')?.match(/box-shadow\s*:\s*([^;]+)/);
    if (m) shadows.add(m[1].trim());
  });
  if (shadows.size) tokens.boxShadows = [...shadows].slice(0, 5);

  const gradients = new Set();
  $('[style*="gradient"]').each((_, el) => {
    const m = $(el).attr('style')?.match(/(?:background|background-image)\s*:\s*([^;]+)/i);
    if (m && m[1].includes('gradient')) gradients.add(m[1].trim());
  });
  if (gradients.size) tokens.gradients = [...gradients].slice(0, 3);

  return Object.keys(tokens).length > 0 ? tokens : null;
}

function extractLayoutPatterns($) {
  const patterns = [];
  $('[style*="display: flex"], [style*="display:flex"]').each(() => patterns.push('flexbox'));
  $('[style*="display: grid"], [style*="display:grid"]').each(() => patterns.push('grid'));
  $('[style*="position: absolute"], [style*="position:absolute"]').each(() => patterns.push('absolute positioning'));
  $('[style*="position: fixed"], [style*="position:fixed"]').each(() => patterns.push('fixed positioning'));
  $('[style*="position: sticky"], [style*="position:sticky"]').each(() => patterns.push('sticky'));
  const unique = [...new Set(patterns)];
  return unique.length > 0 ? unique : null;
}

function extractMediaQueries($) {
  const mqs = new Set();
  $('style').each((_, el) => {
    const css = $(el).html() || '';
    const m = css.match(/@media\s*[^{]+/g);
    if (m) m.forEach(mq => mqs.add(mq.trim()));
  });
  return mqs.size > 0 ? [...mqs].slice(0, 8) : null;
}

function extractAnimations($) {
  const anims = new Set();
  $('[style*="animation"], [style*="transition"]').each((_, el) => {
    const s = $(el).attr('style') || '';
    const m = s.match(/(?:animation|transition)\s*:\s*([^;]+)/gi);
    if (m) m.forEach(a => anims.add(a.trim()));
  });
  $('style').each((_, el) => {
    const css = $(el).html() || '';
    const m = css.match(/@keyframes\s+(\w+)/g);
    if (m) m.forEach(k => anims.add(k.trim()));
  });
  return anims.size > 0 ? [...anims].slice(0, 5) : null;
}

function extractInlineDesignSystem($) {
  const sizes = new Set();
  $('[style*="font-size"]').each((_, el) => {
    const m = $(el).attr('style')?.match(/font-size\s*:\s*([^;]+)/);
    if (m) sizes.add(m[1].trim());
  });
  const weights = new Set();
  $('[style*="font-weight"]').each((_, el) => {
    const m = $(el).attr('style')?.match(/font-weight\s*:\s*([^;]+)/);
    if (m) weights.add(m[1].trim());
  });
  return {
    fontSizes: [...sizes].slice(0, 8),
    fontWeights: [...weights].slice(0, 5)
  };
}

module.exports = {
  extractColors,
  extractFonts,
  extractCssVars,
  extractDesignTokens,
  extractLayoutPatterns,
  extractMediaQueries,
  extractAnimations,
  extractInlineDesignSystem
};
