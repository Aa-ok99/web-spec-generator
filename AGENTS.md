# Web Spec Generator — Agent Guide

## Commands (backend directory)
```bash
npm start        # Start production server (compiled JS)
npm run dev      # Start with tsx watch (auto-reload)
npm run build    # Compile TypeScript to dist/
npm test         # node --import tsx --test test/
./start.sh       # From repo root — builds TS, checks deps, starts server
```

## Architecture
- **Backend**: Express (TypeScript, compiles to CommonJS)
- **Frontend**: Static HTML/CSS/JS served by Express at `/`
- **Storage**: JSON file (`repositories/historyRepository.ts`) or PostgreSQL (`repositories/historyRepositoryPostgres.ts`) — auto-swapped via `DB_URL` env var
- **AI**: OpenRouter API via `services/llmService.ts` (with retry logic)
- **Pipeline**: 6-stage AI pipeline orchestrated by `services/pipelineService.ts`
- **IDs**: `nanoid` (8 chars)

## Layer structure
| Layer | Path | Role |
|---|---|---|
| Routes | `routes/` | Wire HTTP → controller |
| Controllers | `controllers/` | Parse req, call service, send res |
| Services | `services/` | Business logic, orchestration |
| Repository | `repositories/` | Data access (async, swappable via DB_URL) |
| Config | `config/index.ts` | Centralized constants |
| Prompts | `prompts/` | System prompt + user prompt builder |
CodeGen | `prompts/systemPromptCodeGen.ts` | Prompt for React+Tailwind code generation |
| Utils | `utils/` | Pure helper functions |

## Services breakdown
- `codeGenService` — generates React + Tailwind code from spec or text prompt; orchestrates LLM call → post-process → preview → caching
- `specService` — orchestrates analyze flow (validate → fetch → run pipeline → save)
- `historyService` — CRUD for history via repository
- `analyzeService` — URL validation, SSRF check, API key resolution
- `pipelineService` — orchestrates 2-stage AI pipeline (shared crawl/analyze → 2 LLM rounds → combine; includes site category detection)
- `crawlerService` — fetch website, extract design tokens via cheerio
- `analyzerService` — detect layout regions, UI patterns, design hints, site category
- `promptBuilderService` — builds prompts for frontend (stage 1) or backend (stage 2) with category context
- `llmService` — call OpenRouter API with retry on failure
- `postProcessorService` — validate/normalize LLM output (section header checks, warnings); combine frontend + backend specs

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

Orchestrated by `pipelineService.ts` with per-step debug logging via `utils/pipelineLogger.ts`.
Retry logic (2x exponential backoff) in `llmService.ts` applies independently to each round.

## Spec output (14 sections, 2 LLM calls)
- **1–8** (Round 1): Frontend — Overview, Design System, Components, Layout, UX, a11y, Performance, Clone Prompt
- **9–14** (Round 2): Backend — System Architecture, API Contracts, Data Models, Event System, Recommendation Logic, Architecture Diagram

## Key paths
- Config: `backend/config/index.ts`
- `.env`: `backend/.env` (PORT, OPENROUTER_API_KEY, OPENROUTER_BASE_URL, RATE_LIMIT_MAX)
- History data: `backend/data/history.json` (gitignored)
- Tests: `backend/test/` (Node built-in test runner, no Jest)
- Migrations: `backend/db/migrations/`

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
| POST | `/api/analyze/generate` | Generate React app from spec `{ specId, apiKey? }` |
| GET | `/api/analyze/generate/:id/download` | Download generated app as ZIP |
| GET | `/api/history` | List history |
| GET | `/api/history/:id` | Get history item |
| DELETE | `/api/history/:id` | Delete history item |
| DELETE | `/api/history` | Clear all history |
| GET | `/api/share/:id` | Share page (HTML) |
| GET | `/api/share/data/:id` | Share data (JSON) |
| GET | `/api/share/pdf/:id` | Download PDF |

## Code Generator (LlamaCoder-style)
- **Flow**: Analyze URL → 14-section spec → "Generate React App" button → AI creates React+Tailwind code → Split-screen: code + live preview (iframe) → Download ZIP
- **Backend**: `codeGenService.ts` orchestrates → `llmService.ts` calls OpenRouter → `systemPromptCodeGen.ts` builds prompt → `zipBuilder.ts` builds project ZIP → `previewBuilder.ts` builds iframe HTML
- **Preview**: Uses iframe srcdoc loading React 18 + Babel standalone + Tailwind CSS from CDN
- **Download**: ZIP contains package.json, vite.config.js, tailwind.config.js, src/App.jsx, src/main.jsx, index.html
- **Caching**: Generated code cached in history.json; subsequent requests return instantly
