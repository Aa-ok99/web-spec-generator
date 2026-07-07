<div align="center">
  <br/>
  <img src="https://img.shields.io/badge/version-3.0.0-6366f1?style=for-the-badge&labelColor=0f172a" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge&labelColor=0f172a" alt="License"/>
  <img src="https://img.shields.io/badge/ai-nvidia/nemotron--3--nano--30b--a3b:free-818cf8?style=for-the-badge&labelColor=0f172a" alt="AI Model"/>
  <br/><br/>
</div>

<div align="center">
  <h1>
    <img src="https://img.icons8.com/fluency/48/code.png" width="32" style="vertical-align: middle;"/>
    Web Spec Generator
  </h1>
  <p>
    <b>ใส่ลิงก์เว็บไซต์ → AI วิเคราะห์ → ได้ Spec Full-Stack 14 Sections พร้อมใช้</b>
  </p>
  <p>
    <i>Reverse-engineer any website into a complete production-ready system specification</i>
  </p>
</div>

<br/>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-14-section-spec">Spec Sections</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-api-endpoints">API</a> •
  <a href="#-configuration">Configuration</a>
</p>

<br/>

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/Aa-ok99/web-spec-generator.git
cd web-spec-generator

# 2. Install
cd backend && npm install && cd ..

# 3. Set API Key
echo 'OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx' > backend/.env

# 4. Start
chmod +x start.sh && ./start.sh
```

Open **http://localhost:5000** → paste a URL → click **วิเคราะห์** → get a full 14-section system spec.

> **Requirements:** Node.js 18+, OpenRouter API key ([free here](https://openrouter.ai/keys))

---

## ✨ Features

<div>

| Feature | What it does |
|---------|--------------|
| **🎨 Design Extraction** | 8 cheerio extractors — colors, fonts, CSS vars, layout patterns, media queries, animations |
| **🤖 2-Stage AI Pipeline** | Frontend round (sections 1-8) + Backend round (sections 9-14) — each with full token budget |
| **⚡ Code Generation** | Generate React + Tailwind app from any spec — live preview via iframe, download as ZIP |
| **📋 Clone Prompt** | Copy-paste ready prompt for AI to rebuild the site pixel-perfect |
| **🏗️ Backend Spec** | System architecture, API contracts, data models, event system, recommendation engine |
| **📄 Export** | PDF, Markdown (.md), HTML, shareable link |
| **🔗 Share** | Generate a shareable URL with full spec view |
| **📚 History** | Auto-save 100 most recent analyses with search & delete |
| **🌓 Dark Mode** | System-aware theme with manual toggle |
| **📱 Responsive** | Works on mobile, tablet, desktop |

</div>

---

## 📋 14-Section Spec

### Round 1 — Frontend (2 LLM calls → 6KB prompt)

| # | Section | What it covers |
|---|---------|----------------|
| 1 | **Site Overview** | URL, category, purpose, audience, content strategy |
| 2 | **Design System** | Colors (hex/rgb), typography (font/size/weight), spacing (grid/gap/padding), visual effects (shadow/radius/transition) |
| 3 | **Component Library** | Buttons, inputs, cards, nav, modals, lists, badges — each with all states (default/hover/active/disabled/focus/error) |
| 4 | **Page Layout** | Responsive breakpoints, DOM tree, section-by-section breakdown |
| 5 | **UX & Interaction** | Navigation, hover effects, focus/keyboard, form validation, loading/error/empty states, scroll animations |
| 6 | **Accessibility** | ARIA labels/landmarks, color contrast (WCAG AA), focus indicators, keyboard nav |
| 7 | **Performance** | Image optimization, lazy loading, code splitting, caching strategy |
| 8 | **Clone Prompt** | Copy-paste prompt with all design tokens, component specs, file list, responsive rules, a11y |

### Round 2 — Backend (2 LLM calls → 14KB prompt + frontend summary)

| # | Section | What it covers |
|---|---------|----------------|
| 9 | **System Architecture** | Services & modules, communication patterns, caching, deployment |
| 10 | **API Contracts** | Full REST endpoints with request/response schemas, error codes |
| 11 | **Data Models** | User, Video, Event, Channel JSON schemas + SQL + Graph DB |
| 12 | **Event System** | Event types, pipeline flow, canonical schema, signal weights |
| 13 | **Recommendation Logic** | Ranking signals, scoring formula, cold start, diversity rules |
| 14 | **Architecture Diagram** | Full system diagram with ASCII/mermaid rendering |

---

## 🏗️ Architecture

```
                         ┌─────────────────────────┐
                         │     Client (Frontend)     │
                         │  Static HTML/CSS/JS       │
                         │  Served by Express at /   │
                         └───────────┬─────────────┘
                    ┌────────────────┼─────────────────┐
                    ▼                ▼                  ▼
          POST /api/analyze   POST /api/analyze    GET /api/analyze
                              /generate            /generate/:id/download
┌───────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express + TypeScript)                   │
├───────────────────────────────────────────────────────────────────┤
│  Route ──▶ Controller ──▶ Service ──▶ Repository ──▶ JSON File    │
│                              │                                    │
│          ┌───────────────────┼───────────────────┐                │
│          ▼                   ▼                    ▼                │
│  ┌──────────────┐   ┌───────────────┐   ┌──────────────┐         │
│  │  Spec        │   │  Code Gen     │   │  Preview +   │         │
│  │  Pipeline    │   │  Service      │   │  ZIP Builder │         │
│  │  (6 stages)  │   │  (LLM → code) │   │  (iframe,    │         │
│  │              │   │               │   │   download)  │         │
│  └──────┬───────┘   └───────┬───────┘   └──────────────┘         │
│         │                   │                                      │
│         ▼                   ▼                                      │
│  ┌─────────────────────────────────────────────┐                   │
│  │         OpenRouter AI (llmService.ts)        │                   │
│  │  retry 2x exponential backoff (1s→2s)       │                   │
│  │  Model: nvidia/nemotron-3-nano-30b-a3b:free │                   │
│  └─────────────────────────────────────────────┘                   │
└───────────────────────────────────────────────────────────────────┘
```

### Key Files

| Path | Role |
|------|------|
| `backend/server.ts` | Express server, middleware, routes |
| `backend/config/index.ts` | Centralized constants (PORT, MODEL, RATE_LIMIT...) |
| `backend/prompts/systemPromptFrontend.ts` | 6KB prompt — sections 1-8 |
| `backend/prompts/systemPromptBackend.ts` | 14KB prompt — sections 9-14 |
| `backend/services/pipelineService.ts` | 6-stage pipeline orchestrator |
| `backend/services/codeGenService.ts` | Code generation from spec (React + Tailwind) |
| `backend/services/crawlerService.ts` | cheerio-based web scraper |
| `backend/services/analyzerService.ts` | Layout/pattern/design detection |
| `backend/services/llmService.ts` | OpenRouter API caller with retry |
| `backend/services/promptBuilderService.ts` | Build frontend/backend prompts |
| `backend/services/postProcessorService.ts` | Validate + combine specs |
| `backend/repositories/historyRepository.ts` | Async CRUD (swap-ready for PostgreSQL) |
| `backend/utils/extractors.ts` | 8 cheerio extractors |
| `backend/utils/pipelineLogger.ts` | Per-step debug tracing |
| `backend/utils/previewBuilder.ts` | Build live preview iframe (React 18 + Babel) |
| `backend/utils/zipBuilder.ts` | Build downloadable ZIP with full Vite project |

---

## 🧩 Use with opencode CLI

```bash
# Install skill
bash skill/install.sh

# Then in opencode:
#   "วิเคราะห์เว็บ https://example.com"
#   "Clone this website https://example.com"
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Analyze URL `{ url, apiKey? }` → returns 14-section spec |
| `POST` | `/api/analyze/generate` | Generate React app from spec `{ specId, apiKey? }` |
| `POST` | `/api/analyze/from-prompt` | Generate app from text prompt `{ prompt, apiKey? }` |
| `GET` | `/api/analyze/generate/:id/download` | Download generated app as ZIP |
| `GET` | `/api/history` | List all history (with spec preview) |
| `GET` | `/api/history/:id` | Get single history entry |
| `DELETE` | `/api/history/:id` | Delete history item |
| `DELETE` | `/api/history` | Clear all history |
| `GET` | `/api/share/:id` | Share page (HTML) |
| `GET` | `/api/share/data/:id` | Share data (JSON) |
| `GET` | `/api/share/pdf/:id` | Download PDF |

---

## ⚙️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `OPENROUTER_API_KEY` | — | OpenRouter API key (required) |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | AI provider endpoint |
| `MODEL` | `nvidia/nemotron-3-nano-30b-a3b:free` | AI model (free, used for both spec + code gen) |
| `RATE_LIMIT_MAX` | `10` | Max requests per minute |
| `CORS_ORIGIN` | `*` | Allowed origins |
| `HISTORY_PATH` | `backend/data/history.json` | History storage (swap to PostgreSQL via env) |

---

## 🔒 Security

- **SSRF protection** — blocks localhost, 127.0.0.1, 10.x, 192.168.x
- **URL validation** — http/https only
- **Helmet headers** — security headers on all responses
- **Rate limiting** — configurable per-minute limit
- **Input sanitization** — validation at every layer (route → controller → service)
- **API key safety** — resolved server-side (client key → server key fallback), never exposed to frontend

---

## 🧪 Tests

```bash
cd backend
npm test
```

Tests use isolated data files (`test-history.json`, `test-share.json`) via `process.env.HISTORY_PATH`.

---

## 📝 License

MIT — use freely, modify, and share.
