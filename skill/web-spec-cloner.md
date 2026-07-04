---
name: web-spec-cloner
description: Reverse-engineer ANY website and generate a pixel-perfect clone specification with full design system extraction. Just provide a URL — get back colors, fonts, components, UX patterns, and a ready-to-use clone prompt. Works with any website type (e-commerce, blog, SaaS, landing page, etc.).
version: 1.0.0
author: Aa-ok99
---

# Web Spec Cloner

Reverse-engineer ANY website and generate a pixel-perfect clone specification with full design system extraction. Just provide a URL — get back colors, fonts, components, UX patterns, and a ready-to-use clone prompt.

---

## 🔧 Installation

```bash
# 1. Clone the repository
git clone https://github.com/Aa-ok99/web-spec-generator.git
cd web-spec-generator

# 2. Install dependencies
cd backend
npm install
cd ..

# 3. Set your OpenRouter API key
echo 'OPENROUTER_API_KEY=sk-or-v1-your-key-here' > backend/.env
echo 'PORT=5000' >> backend/.env
echo 'OPENROUTER_BASE_URL=https://openrouter.ai/api/v1' >> backend/.env

# 4. Start the server
./start.sh

# 5. Install this skill (for use with opencode)
mkdir -p ~/.opencode/skills/web-spec-cloner
cp skill/web-spec-cloner.md ~/.opencode/skills/web-spec-cloner/SKILL.md
```

**Requirements:** Node.js 18+, OpenRouter API key (free at https://openrouter.ai/keys)

---

## 🚀 Usage

Once the server is running on `http://localhost:5000`, you can use it in two ways:

### Via CLI (opencode)

Load the skill and tell the AI: "วิเคราะห์เว็บนี้ [URL]" or "Clone this website [URL]"

The AI will:
1. Call `POST /api/analyze` with the URL
2. Return the complete specification with design system + clone prompt
3. Offer to save the spec as a file

### Via curl / API directly

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com"}'
```

### Via Browser

Open `http://localhost:5000` in your browser.

---

## 📋 What You Get

For every URL analyzed, the AI produces an **~20,000 character specification** with:

### 1. Site Overview
Category, purpose, audience, content strategy

### 2. Design System (Full Token Extraction)
| Section | What's included |
|---------|----------------|
| **Color System** | Primary, secondary, accent, background, text, border, semantic colors, gradients — with exact hex/rgb values |
| **Typography System** | Font families, size scale (h1→small), weights, line-height, letter-spacing |
| **Spacing & Layout** | Grid columns, max-width, padding scale, gap system |
| **Visual Tokens** | Border-radius scale, box-shadows (levels), blur, transitions, animations |

### 3. Component Library
Every component with all states:
- Buttons (default/hover/active/disabled)
- Inputs (focus/error/disabled)
- Cards, Navigation, Modals, Lists, Badges

### 4. Page Layout & Structure
- Full DOM tree
- Responsive breakpoints (mobile/tablet/desktop)
- Section-by-section breakdown

### 5. UX & Interaction Patterns
- Navigation behavior, hover effects, focus states
- Scroll animations, micro-interactions
- Loading/error/empty states

### 6. Accessibility (a11y)
ARIA labels, contrast ratios, focus indicators, semantic HTML

### 7. EXACT Clone Prompt (COPY-PASTE)
A complete, ready-to-use prompt with:
- All design tokens
- Component specs
- File list
- Responsive rules
- a11y requirements

**Copy this prompt → paste into any AI → get a pixel-perfect clone.**

---

## ⚙️ How It Works (For the AI)

When a user provides a URL, follow these steps:

### Step 1: Ensure the server is running
Check if `http://localhost:5000` responds. If not, guide the user to run `./start.sh` from the project directory.

### Step 2: Extract design data
The backend's `fetchWebsiteContent` already extracts:
- Colors from inline styles, `<style>` blocks, CSS variables
- Font families from stylesheets and Google Fonts links
- Design tokens (border-radius, box-shadow, gradients)
- Layout patterns (flexbox, grid, sticky)
- Media queries and breakpoints
- Animations and keyframes
- Page structure (headings, nav, buttons, images)

### Step 3: Analyze with AI
The backend sends the extracted data to OpenRouter (Gemma/Qwen/Cohere) with a system prompt that generates an 8-section specification focusing on:
- Complete design system documentation
- Component library with all states
- Exact clone prompt with design tokens

### Step 4: Return results
Present the spec to the user. If the user wants to save it, offer to write it to a file.

---

## 📊 API Reference

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/api/analyze` | `{ url: string, apiKey?: string }` | `{ success, id, spec, title, url, shareUrl }` |
| `GET` | `/api/history` | — | Array of history entries |
| `GET` | `/api/history/:id` | — | Single entry with full spec |
| `GET` | `/api/share/:id` | — | Shared spec HTML page |
| `GET` | `/api/share/data/:id` | — | Shared spec JSON |
| `GET` | `/api/share/pdf/:id` | — | PDF download |

---

## 🧪 Example

**User:** วิเคราะห์เว็บ apple.com/iphone

**AI** (calls `POST /api/analyze` with `{"url":"https://www.apple.com/th/iphone/"}`):

**Response:** Spec (19,750 chars) containing:
- Color System with 10+ exact colors
- Typography with font families and size scale
- Component Library with all Apple.com components
- Responsive breakpoints
- **EXACT Clone Prompt** ready to copy-paste

**User:** save as iphone-spec.md

**AI:** Writes the spec to `iphone-spec.md`

---

## 🛠️ Configuration

Environment variables in `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `OPENROUTER_API_KEY` | — | Your OpenRouter API key (required) |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | API endpoint |
| `RATE_LIMIT_MAX` | `10` | Max requests per minute |
| `CORS_ORIGIN` | `*` | Allowed origins |

---

## 🔒 Security

- SSRF protection (internal/private IPs blocked)
- URL validation (http/https only)
- Helmet security headers
- Rate limiting
- Input sanitization

---

## 📄 License

MIT
