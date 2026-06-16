# AI Gateway

Route requests to 200+ LLM models through one API. Full observability — track usage, costs, latency, and errors per gateway in real time.

<p align="center">
<img width="800" alt="image" src="https://github.com/user-attachments/assets/fb6a6a30-2f5a-44ad-910a-5f2955611e13" />
</p>

## What it does

- Single endpoint for OpenAI, Anthropic, Google, Mistral, DeepSeek, and 50+ providers
- Per-gateway API keys with isolated analytics
- Cost tracking and latency monitoring per request
- OpenAI-compatible API — works with existing OpenAI client libraries

## Quick start

```bash
git clone https://github.com/spline2hg/ai-gateway.git
cd ai-gateway

# Backend
cp .env.example .env
uv sync
uv run uvicorn src.main:app --port 8000 --reload

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Backend: `http://localhost:8000` — API docs: `http://localhost:8000/docs`
Frontend: `http://localhost:5173`

## Use it

```bash
# 1. Create account
curl -X POST http://localhost:8000/auth/join
# → {"id": "user-123", "username": "Brave_Fox"}

# 2. Create a gateway
curl -X POST http://localhost:8000/gateway/create \
  -H "x-user-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-project"}'
# → {"gateway_id": "gw-123", "secret": "secret-456"}

# 3. Make a request
curl -X POST http://localhost:8000/chat/completions \
  -H "x-gateway-id: gw-123" \
  -H "x-gateway-authorization: secret-456" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello!"}]}'
```

Works with any OpenAI client:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000", api_key="unused")
response = client.chat.completions.create(
    model="claude-opus-4.1",  # or gpt-4o, gemini-2.5-pro, etc.
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## Supported models

OpenAI (GPT-4o, GPT-5), Anthropic (Claude 3/Opus), Google (Gemini 2.5/3), Mistral, Meta (Llama 3.x), DeepSeek, xAI (Grok), Cohere, and 40+ more providers. See `src/routing.py` for the full list.

## Tech stack

- **Backend**: FastAPI, SQLAlchemy, Python 3.12+
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Database**: SQLite (dev) / PostgreSQL (prod) — ClickHouse optional for analytics
- **Docker**: `docker build -t ai-gateway:latest .`

## Deployment

1. Set `ENVIRONMENT=production`
2. Configure `DATABASE_URL` for PostgreSQL
3. Set `CORS_ORIGINS` for your domain
4. Add provider API keys in `.env`
5. Optional: set up ClickHouse for analytics

## License

MIT
