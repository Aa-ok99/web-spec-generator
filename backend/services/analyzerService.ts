function detectLayoutRegions(websiteData) {
  const regions = [];
  const text = (websiteData.bodyText || '').toLowerCase();
  const headings = websiteData.headings || [];

  if (headings.some(h => /hero|banner|feature/i.test(h))) regions.push('hero');
  if (headings.some(h => /feature|service|offer/i.test(h))) regions.push('features');
  if (headings.some(h => /about|why|story/i.test(h))) regions.push('about');
  if (headings.some(h => /pricing|plan|price/i.test(h))) regions.push('pricing');
  if (headings.some(h => /contact|get in touch|reach/i.test(h))) regions.push('contact');
  if (headings.some(h => /testimonial|review|quote/i.test(h))) regions.push('testimonials');
  if (headings.some(h => /faq|question|help/i.test(h))) regions.push('faq');
  if (headings.some(h => /footer|bottom/i.test(h)) || websiteData.navLinks?.length > 0) regions.push('footer');
  if (regions.length === 0) regions.push('general-content');

  return regions;
}

function detectUIPatterns(websiteData) {
  const patterns = [];

  if (websiteData.navLinks && websiteData.navLinks.length > 0) patterns.push('navigation');
  if (websiteData.buttons && websiteData.buttons.length > 0) patterns.push('buttons');
  if (websiteData.images && websiteData.images.length > 1) patterns.push('media-gallery');
  if (websiteData.layoutPatterns && websiteData.layoutPatterns.includes('grid')) patterns.push('grid-layout');
  if (websiteData.layoutPatterns && websiteData.layoutPatterns.includes('flexbox')) patterns.push('flexbox-layout');
  if ((websiteData.bodyText || '').toLowerCase().includes('input') ||
      (websiteData.bodyText || '').toLowerCase().includes('form')) patterns.push('forms');
  if ((websiteData.bodyText || '').toLowerCase().includes('card')) patterns.push('cards');
  if (websiteData.images && websiteData.images.some(i => (i.src || '').includes('logo'))) patterns.push('logo');

  return patterns;
}

function detectSiteCategory(websiteData) {
  const text = (websiteData.bodyText || '').toLowerCase();
  const headings = (websiteData.headings || []).join(' ').toLowerCase();
  const scripts = (websiteData.detectedScripts || []).join(' ').toLowerCase();
  const combined = text + ' ' + headings;

  if (/shopify|woocommerce|magento|add to cart|add to bag|buy now|shopping cart|checkout|product|price|sale|shop/i.test(combined) ||
      scripts.includes('shopify') || scripts.includes('woocommerce')) {
    return 'e-commerce';
  }

  if (/blog|article|post|read more|categories|tags|published|author|comments/i.test(headings) &&
      /blog|article/i.test(combined)) {
    return 'blog';
  }

  if (/video|watch|channel|subscribe|upload|playlist|stream/i.test(combined) &&
      (scripts.includes('youtube') || scripts.includes('videojs') || scripts.includes('plyr'))) {
    return 'video-platform';
  }

  if (/login|sign up|register|dashboard|profile|follow|feed|post|share|like|comment/i.test(combined) &&
      /profile|feed|post/i.test(text)) {
    return 'social-media';
  }

  if (/login|sign up|dashboard|pricing|plan|get started|trial|feature|integration|api/i.test(combined) &&
      /saas|software|platform|service/i.test(text)) {
    return 'saas';
  }

  if (/portfolio|work|project|case study|gallery|showcase/i.test(headings)) {
    return 'portfolio';
  }

  if (/pricing|plan|price|feature|hero|landing|get started|cta|sign.?up/i.test(combined) &&
      headings.split(' ').length < 10) {
    return 'landing-page';
  }

  if (/docs|documentation|guide|tutorial|reference|api|sdk/i.test(headings)) {
    return 'documentation';
  }

  if (/news|breaking|headline|latest|update|story/i.test(headings)) {
    return 'news';
  }

  return 'other';
}

function extractDesignHints(websiteData) {
  return {
    colors: websiteData.colors || [],
    fonts: websiteData.fonts || [],
    cssVars: websiteData.cssVars || null,
    designTokens: websiteData.designTokens || null,
    themeColor: websiteData.themeColor || null,
    inlineDesign: websiteData.inlineDesign || null,
    mediaQueries: websiteData.mediaQueries || null,
    animations: websiteData.animations || null
  };
}

function analyze(websiteData) {
  if (!websiteData) {
    throw new Error('No website data to analyze');
  }

  return {
    layoutRegions: detectLayoutRegions(websiteData),
    uiPatterns: detectUIPatterns(websiteData),
    designHints: extractDesignHints(websiteData),
    siteCategory: detectSiteCategory(websiteData),
    contentStructure: {
      headings: websiteData.headings || [],
      navLinks: websiteData.navLinks || [],
      buttons: websiteData.buttons || [],
      scripts: websiteData.detectedScripts || [],
      stylesheets: websiteData.stylesheets || []
    }
  };
}

module.exports = { analyze };
