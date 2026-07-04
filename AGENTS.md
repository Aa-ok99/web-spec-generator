# Web Spec Generator — Agent Guide

## Commands (backend directory)
```bash
npm start        # Start production server
npm run dev      # Start with nodemon (auto-reload)
npm test         # node --test test/
./start.sh       # From repo root — checks deps, starts server
```

## Architecture
- **Backend**: Express (CommonJS, no TypeScript)
- **Frontend**: Static HTML/CSS/JS served by Express at `/`
- **Storage**: JSON file via `repositories/historyRepository.js` (async methods, designed to swap to PostgreSQL)
- **AI**: OpenRouter API via `services/llmService.js` (with retry logic)
- **Pipeline**: 5-stage AI pipeline orchestrated by `services/pipelineService.js`
- **IDs**: `nanoid` (8 chars)

## Layer structure
| Layer | Path | Role |
|---|---|---|
| Routes | `routes/` | Wire HTTP → controller |
| Controllers | `controllers/` | Parse req, call service, send res |
| Services | `services/` | Business logic, orchestration |
| Repository | `repositories/` | Data access (async, swappable) |
| Config | `config/index.js` | Centralized constants |
| Prompts | `prompts/` | System prompt + user prompt builder |
| Utils | `utils/` | Pure helper functions |

## Services breakdown
- `specService` — orchestrates analyze flow (validate → fetch → run pipeline → save)
- `historyService` — CRUD for history via repository
- `analyzeService` — URL validation, SSRF check, API key resolution
- `pipelineService` — orchestrates 2-stage AI pipeline (shared crawl/analyze → 2 LLM rounds → combine)
- `crawlerService` — fetch website, extract design tokens via cheerio
- `analyzerService` — detect layout regions, UI patterns, design hints
- `promptBuilderService` — builds prompts for frontend (stage 1) or backend (stage 2)
- `llmService` — call OpenRouter API with retry on failure
- `postProcessorService` — validate/normalize LLM output; combine frontend + backend specs

## AI Pipeline (2-stage, 6 steps)
### Shared (stages 1-2)
| Stage | Service | Input → Output |
|---|---|---|
| 1. Crawl | `crawlerService` | URL → raw page data |
| 2. Analyze | `analyzerService` | page data → layout regions, UI patterns, design hints |

### Round 1: Frontend (stages 3-5)
| Stage | Service | Prompt |
|---|---|---|
| 3a. Build prompt | `promptBuilderService.buildFrontend()` | `systemPromptFrontend.js` (sections 1-8, 6KB) |
| 4a. LLM call | `llmService` | full token budget for frontend |
| 5a. Post-process | `postProcessorService.process()` | validated frontend spec |

### Round 2: Backend (stages 3-5)
| Stage | Service | Prompt |
|---|---|---|
| 3b. Build prompt | `promptBuilderService.buildBackend()` | `systemPromptBackend.js` (sections 9-14, 14KB) + frontend summary |
| 4b. LLM call | `llmService` | full token budget for backend |
| 5b. Post-process | `postProcessorService.process()` | validated backend spec |

### Combine (stage 6)
| Stage | Service | Output |
|---|---|---|
| 6. Combine | `postProcessorService.combine()` | frontend + backend → full spec |

Orchestrated by `pipelineService.js` with per-step debug logging via `utils/pipelineLogger.js`.
Retry logic (2x exponential backoff) in `llmService.js` applies independently to each round.

## Spec output (14 sections, 2 LLM calls)
- **1–8** (Round 1): Frontend — Overview, Design System, Components, Layout, UX, a11y, Performance, Clone Prompt
- **9–14** (Round 2): Backend — System Architecture, API Contracts, Data Models, Event System, Recommendation Logic, Architecture Diagram

## Key paths
- Config: `backend/config/index.js`
- `.env`: `backend/.env` (PORT, OPENROUTER_API_KEY, OPENROUTER_BASE_URL, RATE_LIMIT_MAX)
- History data: `backend/data/history.json` (gitignored)
- Tests: `backend/test/` (Node built-in test runner, no Jest)

## Conventions
- CommonJS (`require`/`module.exports`)
- All service/repository methods return Promises
- Controllers are thin: validate input → call service → send response
- Services throw errors; controllers map to HTTP responses
- Errors carry optional `statusCode` property for HTTP mapping

## OpenCode skill
- Install: `bash skill/install.sh`
- Files: `skill/web-spec-cloner.md` → `~/.opencode/skills/web-spec-cloner/SKILL.md`
- Usage: "วิเคราะห์เว็บ https://example.com" or "Clone this website https://example.com"

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/analyze` | Analyze URL `{ url, apiKey? }` |
| GET | `/api/history` | List history |
| GET | `/api/history/:id` | Get history item |
| DELETE | `/api/history/:id` | Delete history item |
| DELETE | `/api/history` | Clear all history |
| GET | `/api/share/:id` | Share page (HTML) |
| GET | `/api/share/data/:id` | Share data (JSON) |
| GET | `/api/share/pdf/:id` | Download PDF |
