# Web Spec Generator Pro

AI-powered web analysis tool that extracts website content, analyzes it via OpenRouter AI (Gemma/Qwen/Claude), and generates a comprehensive specification document + ready-to-use build prompt.

## Features

- **Analyze** — Enter any URL, AI generates full spec with tech stack, page structure, features, SEO score
- **Export** — Download spec as PDF or Markdown (.md)
- **Share** — Get a shareable link for any analysis
- **History** — View, reload, or delete past analyses (up to 100 entries)
- **Dark Mode** — Toggle between light and dark themes
- **API Key** — Use the server default or override with your own OpenRouter key
- **Responsive** — Works on desktop, tablet, and mobile

## Quick Start

```bash
git clone <your-repo-url>
cd web-spec-generator
chmod +x start.sh
./start.sh
```

Or manually:

```bash
cd backend
cp .env.example .env    # or edit .env directly
npm install
npm start
```

Then open `http://localhost:5000` in your browser.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `OPENROUTER_API_KEY` | — | Your OpenRouter API key (required) |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | OpenRouter API endpoint |
| `RATE_LIMIT_MAX` | `10` | Max API requests per minute |
| `CORS_ORIGIN` | `*` | Allowed CORS origin |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Analyze a URL `{ url, apiKey? }` |
| `GET` | `/api/history` | List all history entries |
| `GET` | `/api/history/:id` | Get a single history entry |
| `DELETE` | `/api/history/:id` | Delete a history entry |
| `DELETE` | `/api/history` | Clear all history |
| `GET` | `/api/share/:id` | Shared spec view (HTML) |
| `GET` | `/api/share/data/:id` | Shared spec data (JSON) |
| `GET` | `/api/share/pdf/:id` | Download spec as PDF |

## Tech Stack

- **Backend**: Node.js, Express, Helmet, jsPDF, nanoid, cheerio
- **Frontend**: Vanilla JS, CSS3 (Glassmorphism), Inter UI Font
- **AI**: OpenRouter API (Gemma 4, Qwen3 Coder, Cohere North)

## Security

- SSRF protection — internal/private IPs blocked
- URL validation — only http/https allowed
- Helmet security headers
- Rate limiting (configurable)
- Input sanitization (ID length checks, placeholder key detection)

## License

MIT
