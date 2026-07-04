const axios = require('axios');
const cheerio = require('cheerio');
const {
  extractColors,
  extractFonts,
  extractCssVars,
  extractDesignTokens,
  extractLayoutPatterns,
  extractMediaQueries,
  extractAnimations,
  extractInlineDesignSystem
} = require('../utils/extractors');

async function crawl(url) {
  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    maxRedirects: 5
  });

  const html = response.data;
  const $ = cheerio.load(html);

  const title = $('title').text().trim() || 'No title found';
  const description = $('meta[name="description"]').attr('content') || '';
  const keywords = $('meta[name="keywords"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const ogType = $('meta[property="og:type"]').attr('content') || '';
  const themeColor = $('meta[name="theme-color"]').attr('content') || '';
  const viewport = $('meta[name="viewport"]').attr('content') || '';

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);

  const scripts = [];
  $('script[src]').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (src.includes('react') || src.includes('vue') || src.includes('angular') ||
        src.includes('next') || src.includes('nuxt') || src.includes('svelte') ||
        src.includes('jquery')) {
      scripts.push(src);
    }
  });

  const stylesheets = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    stylesheets.push(href);
  });

  const colors = extractColors($);
  const fonts = extractFonts($);
  const cssVars = extractCssVars($);
  const designTokens = extractDesignTokens($);
  const layoutPatterns = extractLayoutPatterns($);
  const mediaQueries = extractMediaQueries($);
  const animations = extractAnimations($);
  const inlineDesign = extractInlineDesignSystem($);

  const headings = [];
  $('h1, h2, h3, h4').each((_, el) => {
    const tag = el.tagName;
    const text = $(el).text().trim().slice(0, 60);
    if (text) headings.push(`${tag}: ${text}`);
  });
  const navLinks = [];
  $('nav a, header a, .nav a, .menu a').each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href') || '';
    if (text && !href.startsWith('#') && navLinks.length < 10) {
      navLinks.push(`${text} (${href})`);
    }
  });
  const buttons = [];
  $('button, a[class*="btn"], a[class*="button"], input[type="submit"]').each((_, el) => {
    const text = $(el).text().trim() || $(el).attr('value') || '';
    if (text && buttons.length < 8) buttons.push(text);
  });

  const images = [];
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (src && !src.includes('data:') && images.length < 10) {
      images.push({ src: src.slice(0, 80), alt: ($(el).attr('alt') || '').slice(0, 40) });
    }
  });

  const iconLinks = [];
  $('link[rel*="icon"]').each((_, el) => {
    iconLinks.push($(el).attr('href') || '');
  });

  return {
    url,
    title,
    description,
    keywords,
    ogImage,
    ogType,
    themeColor,
    viewport,
    bodyText: bodyText.slice(0, 4000),
    headings: headings.slice(0, 15),
    navLinks: navLinks.slice(0, 10),
    buttons: buttons.slice(0, 8),
    images: images.slice(0, 10),
    iconLinks,
    detectedScripts: scripts.slice(0, 8),
    stylesheets: stylesheets.slice(0, 8),
    colors: colors.slice(0, 25),
    fonts: fonts.slice(0, 10),
    cssVars,
    designTokens,
    layoutPatterns,
    mediaQueries,
    animations,
    inlineDesign
  };
}

module.exports = { crawl };
