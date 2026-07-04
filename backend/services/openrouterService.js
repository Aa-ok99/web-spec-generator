const axios = require('axios');
const cheerio = require('cheerio');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

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
  const tokens = {};

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

async function fetchWebsiteContent(url) {
  try {
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
  } catch (error) {
    console.error('Fetch error:', error.message);
    return null;
  }
}

async function analyzeWithOpenRouter(websiteData, apiKey) {
  const systemPrompt = `You are WebSpecGPT — an elite frontend architect and UX designer. Your job is to reverse-engineer any website from its raw HTML/CSS data and produce an exhaustive, production-ready specification that lets a developer clone the site pixel-perfect.

Analyze EVERY piece of data provided and output a complete spec with these exact sections:

# [Website Name] — Complete Clone Specification

## 1. Site Overview
- URL, category, purpose, target audience
- Content strategy summary

## 2. Design System — Full Token Extraction
Extract and document every design token you can infer from the data:

### 2.1 Color System
| Token | Hex/RGB | Usage |
|-------|---------|-------|
| Primary | #... | Buttons, links, active states |
| Secondary/Accent | #... | Highlights, badges, CTAs |
| Background | #... | Page/card/section backgrounds |
| Text Primary | #... | Body text |
| Text Secondary | #... | Muted/label text |
| Border | #... | Dividers, input borders |
| Success / Error / Warning | #... | Semantic colors |
| Surface / Elevation | #... | Card, modal, dropdown backgrounds |
| Gradient (if any) | ... | Hero, button gradients |

### 2.2 Typography System
| Property | Value | Context |
|----------|-------|---------|
| Font Family | ... | Headings / Body / Mono |
| Size Scale | ... | h1(px) / h2 / h3 / body / small |
| Weights | ... | Light/Regular/Medium/Bold |
| Line Height | ... | Body / Headings |
| Letter Spacing | ... | Tracking values |

### 2.3 Spacing & Layout
- Grid columns, gutter width, max-width container
- Section padding (vertical/horizontal)
- Card padding, border-radius scale
- Gap between elements (stack / inline)

### 2.4 Visual Effects
- Shadows (level 1-3), blur, backdrop-filter
- Border-radius scale (xs, sm, md, lg, full)
- Gradients, overlays
- Transition durations & easing curves
- Animation keyframes

## 3. Component Library
Document each unique component with its visual state:

| Component | States | Styling Details |
|-----------|--------|----------------|
| Buttons | default/hover/active/disabled | padding, radius, bg, text color, shadow, icon |
| Inputs / Forms | default/focus/error/disabled | border, bg, label, placeholder, helper text |
| Cards | default/hover | padding, radius, shadow, bg, border |
| Navigation | desktop/mobile/hamburger | height, items, active indicator, dropdown |
| Modals / Dialogs | open/close animation | overlay, padding, close button, max-width |
| Lists / Tables | striped/hover | row padding, border, header style |
| Badges / Tags | variants (info/success/warning) | padding, radius, font-size, color |

## 4. Page Layout & Structure
### 4.1 Responsive Breakpoints
- Mobile: [width] → changes
- Tablet: [width] → changes
- Desktop: [width] → changes

### 4.2 Full DOM Tree
\`\`\`
[Complete nested structure with every section, div, and component]
\`\`\`

### 4.3 Section-by-Section Breakdown
| Section | Layout | Key Elements |
|---------|--------|-------------|
| Header | flex/grid | logo, nav, CTA, mobile toggle |
| Hero | ... | headline, subtext, image, buttons |
| Features | ... | cards, icons, grid layout |
| Content | ... | ... |
| Footer | ... | links, copyright, social |

## 5. UX & Interaction Patterns
- Navigation behavior (sticky, scroll, hamburger)
- Hover effects (scale, color shift, underline)
- Focus states & keyboard navigation
- Form validation patterns
- Loading states / skeleton screens
- Error / empty / success states
- Scroll animations (reveal, parallax, fade)
- Micro-interactions (button press, ripple, toast)

## 6. Accessibility (a11y)
- ARIA labels, roles, landmarks
- Color contrast ratios (WCAG)
- Focus indicators
- Alt text on images
- Semantic HTML structure

## 7. Performance Observations
- Image optimization strategies
- Lazy loading
- Code splitting hints
- Critical CSS / render-blocking

## 8. EXACT Clone Prompt (COPY-PASTE)
---
[COPY FROM HERE]
You are a senior frontend engineer. Clone this website exactly based on the following specification:

**Project:** [name] — Exact Clone
**Tech Stack:**
- Framework: [React/Vue/Next/Nuxt + TypeScript]
- Styling: [Tailwind / CSS Modules / styled-components]
- All design tokens (colors, typography, spacing) are listed below:

**Design Tokens:**
- Colors: primary=..., secondary=..., bg=..., text=..., border=..., success=..., error=...
- Typography: font=..., sizes={h1:..., h2:..., body:..., small:...}, weights=...
- Spacing: container=max-w..., section-padding=..., card-padding=..., gap=...
- Border radius: sm=..., md=..., lg=..., full=...
- Shadows: sm=..., md=..., lg=...
- Transitions: default=...s ease...

**Pages/Sections to Build:**
1. Header (sticky, mobile hamburger, active link indicator)
2. Hero section (headline, subtext, 2 CTAs, background treatment)
3. Features grid (3-column, icons, hover lift effect)
4. Content section (split layout, image + text)
5. Footer (4-column, links, social, copyright)

**States to Implement for EVERY component:**
- Default, hover, active, focus, disabled, loading, error, empty

**Responsive Behavior:**
- Mobile: stack layout, hamburger nav, full-width cards
- Tablet: 2-column grids, visible nav
- Desktop: full layout, max-width container, sticky header

**Accessibility Requirements:**
- WCAG 2.1 AA minimum
- Skip-to-content link
- ARIA labels on all interactive elements
- Focus: visible ring
- Semantic HTML landmarks

**Interactions:**
- Smooth scroll to sections
- Fade-in on scroll (IntersectionObserver)
- Button press scale(0.97)
- Card hover: translateY(-4px) + shadow increase
- Nav: active indicator underline slide

**Files Required:**
1. \`app/layout.tsx\` — Root layout, fonts, metadata, theme
2. \`app/page.tsx\` — Main page composing all sections
3. \`components/Header.tsx\` — Nav with mobile menu
4. \`components/Hero.tsx\` — Hero with CTAs
5. \`components/Features.tsx\` — Features grid
6. \`components/Footer.tsx\` — Site footer
7. \`styles/design-tokens.css\` — CSS custom properties for full design system
8. \`tailwind.config.ts\` — Tailwind config extending with design tokens

**Deliverable:** A pixel-perfect, production-ready clone with all states, animations, responsive breakpoints, and accessibility requirements.

[COPY TO HERE]
---

**Recommended filename:** [domain]-clone-spec.md
**Status:** Ready for development`;

  const userPrompt = `
=== RAW WEBSITE DATA ===
URL: ${websiteData.url}
Title: ${websiteData.title}
Description: ${websiteData.description || 'N/A'}
Keywords: ${websiteData.keywords || 'N/A'}
OG Image: ${websiteData.ogImage || 'N/A'}
OG Type: ${websiteData.ogType || 'N/A'}
Theme Color: ${websiteData.themeColor || 'N/A'}
Viewport: ${websiteData.viewport || 'N/A'}

=== DETECTED TECHNOLOGIES ===
Scripts: ${websiteData.detectedScripts.join(', ') || 'None detected'}
Stylesheets: ${websiteData.stylesheets.join(', ') || 'None detected'}

=== DESIGN SYSTEM (EXTRACTED) ===
Colors found: ${websiteData.colors?.join(', ') || 'None detected'}
Fonts found: ${websiteData.fonts?.join(', ') || 'None detected'}
CSS Custom Properties: ${JSON.stringify(websiteData.cssVars) || 'None detected'}
Design Tokens (radius/shadows/gradients): ${JSON.stringify(websiteData.designTokens) || 'None detected'}
Layout Patterns: ${websiteData.layoutPatterns?.join(', ') || 'None detected'}
Media Queries: ${websiteData.mediaQueries?.join('\n') || 'None detected'}
Animations: ${websiteData.animations?.join(', ') || 'None detected'}
Font sizes detected: ${websiteData.inlineDesign?.fontSizes?.join(', ') || 'N/A'}
Font weights detected: ${websiteData.inlineDesign?.fontWeights?.join(', ') || 'N/A'}

=== CONTENT STRUCTURE ===
Headings: ${websiteData.headings?.join(' | ') || 'N/A'}
Navigation links: ${websiteData.navLinks?.join(' | ') || 'N/A'}
Buttons: ${websiteData.buttons?.join(', ') || 'N/A'}
Images: ${JSON.stringify(websiteData.images?.slice(0, 5)) || 'N/A'}
Icons: ${websiteData.iconLinks?.join(', ') || 'N/A'}

=== MAIN BODY TEXT (first 4000 chars) ===
${websiteData.bodyText}

=== INSTRUCTION ===
Analyze ALL the data above. Extract every design token, color, font, spacing value you can identify. Produce a complete clone specification. The PROMPT section (COPY-PASTE) must be so detailed that a developer can recreate the site without ever visiting the original URL.
`;

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: 'cohere/north-mini-code:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 8192
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey || OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://web-spec-generator.local',
          'X-Title': 'Web Spec Generator'
        },
        timeout: 45000
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter Error:', error.response?.data || error.message);
    const errMsg = error.response?.data?.error?.message || error.message;
    throw new Error('OpenRouter API error: ' + errMsg);
  }
}

module.exports = {
  fetchWebsiteContent,
  analyzeWithOpenRouter
};
