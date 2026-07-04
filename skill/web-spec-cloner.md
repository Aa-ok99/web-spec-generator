---
name: web-spec-cloner
description: Reverse-engineer ANY website and generate a complete full-stack system specification (14 sections) with design system extraction, component library, backend architecture, API contracts, data models, and event systems. Just provide a URL.
version: 3.0.0
author: Aa-ok99
---

# Web Spec Cloner

Reverse-engineer ANY website and generate a complete **14-section full-stack system specification**. Input a URL — get back exact colors, fonts, components, UX patterns, backend architecture, API contracts, data models, event system, recommendation logic, and a ready-to-use clone prompt.

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
bash skill/install.sh
```

**Requirements:** Node.js 18+, OpenRouter API key (free at https://openrouter.ai/keys)

---

## 🚀 Usage

Once the server is running on `http://localhost:5000`:

### Via opencode CLI

Load the skill and tell the AI: "วิเคราะห์เว็บนี้ [URL]" or "Clone this website [URL]"

### Via curl

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com"}'
```

### Via Browser

Open `http://localhost:5000` in your browser.

---

## 📋 What You Get (14 Sections)

For every URL, the AI pipeline runs **2 LLM rounds** (each with full token budget) to produce a complete specification:

### Round 1 — Frontend (Sections 1–8)
| Section | Contents |
|---------|----------|
| **1. Site Overview** | Category, purpose, audience, content strategy |
| **2. Design System** | Color system (hex/rgb), typography (font, size, weight), spacing grid, visual effects (shadows, radius, transitions) |
| **3. Component Library** | Every component with all states — buttons, inputs, cards, nav, modals, lists, badges |
| **4. Page Layout** | Full DOM tree, responsive breakpoints, section-by-section breakdown |
| **5. UX & Interaction** | Navigation behavior, hover effects, scroll animations, loading/error/empty states |
| **6. Accessibility** | ARIA labels, contrast ratios (WCAG), focus indicators, semantic HTML |
| **7. Performance** | Image optimization, lazy loading, code splitting, caching |
| **8. EXACT Clone Prompt** | Complete copy-paste prompt with all design tokens, file list, responsive rules, a11y — paste into any AI to get a pixel-perfect clone |

### Round 2 — Backend (Sections 9–14)
| Section | Contents |
|---------|----------|
| **9. System Architecture** | Services & modules, communication patterns (sync/async/caching), deployment (Docker/K8s/CDN) |
| **10. API Contracts** | Full REST endpoints with request/response schemas, error codes (GET /feed, POST /event, POST /like, POST /search, etc.) |
| **11. Data Models** | User, Video, Event, Channel models (JSON + SQL schemas) with subscription graph |
| **12. Event System** | Event types, pipeline flow (Client → Kafka → Analytics/Recommendations), canonical schema |
| **13. Recommendation Logic** | Ranking signals, scoring formula, cold-start behavior, diversity rules |
| **14. Architecture Diagram** | System-level diagram showing client → gateway → services → event bus → data layer |

---

## ⚙️ How It Works (2-Stage Pipeline)

```
User provides URL
        │
        ▼
─── Shared (stages 1-2) ───
  1. Crawl  (crawlerService)     →  cheerio extracts colors, fonts, CSS vars, layout, content
  2. Analyze (analyzerService)   →  detect layout regions, UI patterns, design hints
        │
        ├── Round 1: Frontend ──────────────────────────────────────
        │  3a. Build Prompt     (systemPromptFrontend.js — 6KB, sections 1-8)
        │  4a. LLM Call         (full token budget for frontend)
        │  5a. Post-Process     →  validated frontend spec
        │
        └── Round 2: Backend ───────────────────────────────────────
           3b. Build Prompt     (systemPromptBackend.js — 14KB, sections 9-14 + frontend summary)
           4b. LLM Call         (full token budget for backend)
           5b. Post-Process     →  validated backend spec
                 │
                 ▼
         6. Combine  (postProcessorService)  →  complete 14-section spec
```

### System Prompt Files
- **Frontend:** `backend/prompts/systemPromptFrontend.js` (6,148 chars)
- **Backend:** `backend/prompts/systemPromptBackend.js` (13,971 chars)
- **User prompt builder:** `backend/prompts/userPrompt.js`

### Key Services
| Service | File | Role |
|---------|------|------|
| Pipeline | `pipelineService.js` | Orchestrate 2-stage flow |
| Crawler | `crawlerService.js` | Fetch + cheerio extraction |
| Analyzer | `analyzerService.js` | Layout/pattern/detect |
| Prompt Builder | `promptBuilderService.js` | Build frontend/backend prompts |
| LLM | `llmService.js` | OpenRouter API (retry 2x) |
| Post-Processor | `postProcessorService.js` | Validate + combine specs |

### Retry Logic
Each LLM round has independent retry: **2 attempts** with exponential backoff (1s → 2s).

---

## 📊 API Reference

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/api/analyze` | `{ url: string, apiKey?: string }` | `{ success, id, spec, title, url, shareUrl }` |
| `GET` | `/api/history` | — | Array of history entries (with preview) |
| `GET` | `/api/history/:id` | — | Single entry with full spec |
| `DELETE` | `/api/history/:id` | — | Delete history item |
| `DELETE` | `/api/history` | — | Clear all history |
| `GET` | `/api/share/:id` | — | Shared spec HTML page |
| `GET` | `/api/share/data/:id` | — | Shared spec JSON |
| `GET` | `/api/share/pdf/:id` | — | PDF download |

---

## 🧪 Example

**User:** วิเคราะห์เว็บ apple.com/iphone

**Pipeline:**
1. Crawl → extracts colors, fonts, layout from apple.com
2. Analyze → detects `hero, features, footer` layout + `navigation, buttons, cards` patterns
3. **Round 1 (Frontend)** → generates sections 1-8 with design tokens, component library, clone prompt
4. **Round 2 (Backend)** → generates sections 9-14 with backend architecture, API contracts, data models
5. Combine → complete 14-section full-stack specification

**Frontend spec:** design system, components, layout, UX, a11y, performance  
**Backend spec:** services, API endpoints, data models, event system, recommendation engine

---

## 🛠️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `OPENROUTER_API_KEY` | — | Your OpenRouter API key (required) |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | API endpoint |
| `MODEL` | `cohere/north-mini-code:free` | AI model |
| `RATE_LIMIT_MAX` | `10` | Max requests per minute |
| `CORS_ORIGIN` | `*` | Allowed origins |
| `HISTORY_PATH` | `backend/data/history.json` | History storage (swap to PostgreSQL-ready) |

---

## 🔒 Security

- SSRF protection (internal/private IPs blocked)
- URL validation (http/https only)
- Helmet security headers
- Rate limiting (`express-rate-limit`)
- Input sanitization at all entry points
- API key never exposed to frontend (server-side resolution)

---

## 📄 License

MIT
