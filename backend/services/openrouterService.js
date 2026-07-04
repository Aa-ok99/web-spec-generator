const axios = require('axios');
const cheerio = require('cheerio');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

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

    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 4000);

    const scripts = [];
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src.includes('react') || src.includes('vue') || src.includes('angular') ||
          src.includes('next') || src.includes('nuxt') || src.includes('svelte')) {
        scripts.push(src);
      }
    });

    const styles = [];
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('tailwind') || href.includes('bootstrap') || href.includes('bulma')) {
        styles.push(href);
      }
    });

    return {
      url,
      title,
      description,
      keywords,
      bodyText: bodyText.slice(0, 3000),
      detectedScripts: scripts.slice(0, 5),
      detectedStyles: styles.slice(0, 5)
    };
  } catch (error) {
    console.error('Fetch error:', error.message);
    return null;
  }
}

async function analyzeWithOpenRouter(websiteData, apiKey) {
  const systemPrompt = `You are a Web Spec Analyst expert in analyzing websites and creating development prompts.

  Analyze the provided website data and create a Spec with this structure:

  # [Website Name] - Web Spec & Build Prompt

  ## 1. Basic Info
  - Source: [URL]
  - Analysis Date: [current date]
  - Category: [Landing Page / E-commerce / Blog / Dashboard / etc.]

  ## 2. Detected Tech Stack
  | Component | Technology | Modernity |
  |-----------|-----------|-----------|
  | Frontend | [React/Vue/HTML] | Modern/Outdated |
  | Styling | [Tailwind/CSS] | Modern/Outdated |
  | State Management | [Redux/Zustand/Context] | Modern/Outdated |
  | Backend | [Node/PHP/Python] | Modern/Outdated |
  | Database | [PostgreSQL/Mongo/Firebase] | Modern/Outdated |
  | Hosting | [Vercel/Netlify/AWS] | Modern/Outdated |

  ## 3. Page Structure (Tree)
  [Analyze from content and html structure]

  ## 4. Key Features (3-5)
  - [Feature name] - [description] - [complexity]

  ## 5. Performance & SEO
  | Metric | Score | Status |
  |--------|-------|--------|
  | Performance | [xx/100] | Good/Fair/Poor |
  | Accessibility | [xx/100] | Good/Fair/Poor |
  | SEO | [xx/100] | Good/Fair/Poor |

  ## 6. Improvement Areas (3-5)

  ## 7. Code Example (Rewritten)

  ## 8. PROMPT for Building (COPY-PASTE)
  ---
  [COPY FROM HERE]
  You are a professional web developer. Create a website based on this Specification:

  **Project Name:** [name]
  **Type:** [category]
  **Required Tech Stack:** [choose modern technologies]
  **Required Pages:** [from section 3]
  **Features to Implement:** [from section 4]
  **Additional Requirements:**
  - Responsive (Mobile First)
  - SEO Score > 90
  - Performance Score > 90
  **Restrictions:**
  - No jQuery, Bootstrap 4 or lower
  - No PHP (unless Laravel 10+)
  **Required Files:**
  1. [main file]
  2. [secondary file]

  [COPY TO HERE]
  ---

  ## 9. How to Use the Prompt

  ## 10. Disclaimer

  **Recommended filename:** [domain]-spec.md
  **Status:** Ready`;

  const userPrompt = `
  Website data:
  - Title: ${websiteData.title}
  - Description: ${websiteData.description || 'None'}
  - URL: ${websiteData.url}
  - Keywords: ${websiteData.keywords || 'None'}
  - Content: ${websiteData.bodyText}

  Detected Scripts: ${websiteData.detectedScripts.join(', ')}
  Detected Styles: ${websiteData.detectedStyles.join(', ')}

  Please create Spec and Prompt using modern technology (2024-2026) only.
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
        max_tokens: 4096
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey || OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://web-spec-generator.local',
          'X-Title': 'Web Spec Generator'
        },
        timeout: 30000
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
