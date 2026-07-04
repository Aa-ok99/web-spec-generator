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
