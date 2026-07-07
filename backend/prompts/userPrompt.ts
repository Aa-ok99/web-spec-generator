function buildUserPrompt(websiteData) {
  return `
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
}

module.exports = { buildUserPrompt };
