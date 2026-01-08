# AI Gateway

A comprehensive API gateway and monitoring platform for managing multiple LLM (Large Language Model) providers with unified authentication, analytics, and cost tracking.

---

## Overview

AI Gateway provides a unified interface to access over 200+ LLM models from multiple providers including OpenAI, Anthropic, Google, Mistral, DeepSeek, and many others. It acts as an intelligent routing layer that:

- **Routes requests** to appropriate LLM providers based on model selection
- **Tracks analytics** including token usage, latency, costs, and error rates
- **Manages credentials** securely with per-gateway API key isolation
- **Monitors performance** with real-time dashboards and detailed logs
- **Controls costs** through pricing calculations and usage analytics

---

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Databases**: 
  - SQLite (development) / PostgreSQL (production) - user & gateway data
  - ClickHouse (optional) - time-series analytics
- **Key Libraries**: 
  - SQLAlchemy (ORM)
  - OpenAI Python Client (universal API interface)
  - asyncio (async request handling)

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Components**: 
  - Custom Tailwind CSS components
  - Recharts (analytics visualizations)
  - Lucide React (icons)
- **State Management**: React Context API

### DevOps
- **Containerization**: Docker (multi-stage builds)
- **Package Manager**: uv (ultra-fast Python package management)
- **Environment**: Python 3.12, Node.js 18+

---

## Architecture

```
┌─────────────────────┐
│   Frontend (React)  │
│  - Dashboard        │
│  - Analytics        │
│  - Gateway Config   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│    FastAPI Backend                      │
│  ┌─────────────────────────────────────┐│
│  │ /chat/completions                   ││  (Request routing)
│  │ /gateway/* (CRUD operations)        ││  (Gateway management)
│  │ /analytics/* (usage tracking)       ││  (Analytics queries)
│  │ /auth/* (user management)           ││  (User authentication)
│  └─────────────────────────────────────┘│
└──────────┬──────────────────────────────┘
           │
    ┌──────┴──────┬──────────────────┬─────────────┐
    ▼            ▼                  ▼             ▼
┌────────┐  ┌───────────┐  ┌──────────────┐  ┌──────────────────┐
│ SQLite │  │PostgreSQL │  │ ClickHouse   │  │ LLM Providers    │
│(Dev)   │  │(Prod)     │  │(Analytics)   │  │- OpenAI          │
└────────┘  └───────────┘  └──────────────┘  │- Anthropic       │
                                             │- Google          │
                                             │- Mistral         │
                                             │- DeepSeek        │
                                             │+ 195 more models │
                                             └──────────────────┘
```

---

## Key Features

### 1. Multi-Provider Routing
- Support for 200+ LLM models across 50+ providers
- Automatic provider-to-endpoint mapping
- Model-specific API key handling
- Seamless provider switching

### 2. Request Management
- OpenAI-compatible API endpoints
- Support for streaming and non-streaming responses
- Configurable model parameters (temperature, max_tokens, etc.)
- Per-request error handling and status codes

### 3. Analytics & Monitoring
- Real-time request logging with detailed metrics:
  - Token usage (prompt & completion)
  - API latency and response timing
  - Cost calculation per request
  - Error tracking and rates
  - Provider-specific performance breakdown
- Customizable time-range analytics (daily, weekly, monthly)
- Daily aggregated statistics
- Complete request/response logging with optional data export

### 4. Gateway Management
- Create isolated API gateways per project/team
- Unique gateway IDs and secrets for authentication
- Per-gateway analytics and usage isolation
- Secret regeneration capability
- User-based access control

### 5. User Authentication
- Anonymous user creation with auto-generated usernames
- User session persistence
- Gateway ownership and access control
- Profile management

### 6. Dashboard & UI
- Dark/light theme support
- Real-time statistics display
- Interactive analytics charts
- Gateway credential management with secure copying
- Responsive design (desktop & mobile)

---

## Getting Started

### Prerequisites
- **Python**: 3.12 or higher
- **Node.js**: 18+ (for frontend development)
- **Docker**: Optional, for containerized deployment
- **ClickHouse**: Optional, for advanced analytics

### Backend Setup

#### 1. Clone and Navigate
```bash
git clone https://github.com/spline2hg/ai-gateway.git
cd ai-gateway
```

#### 2. Install Dependencies
```bash
# Using uv (recommended, ultra-fast)
uv sync

```

#### 3. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
```

#### 4. Run Backend
```bash
# Development with hot reload
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

# Production
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd frontend
```

#### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

#### 3. Configure API Endpoint
Edit `frontend/src/services/config.ts`:
```typescript
export const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

#### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
```

Frontend runs at: `http://localhost:5173`

### Docker Deployment

#### Build Docker Image
```bash
docker build -t ai-gateway:latest .
```

## API Reference

### Authentication Flow

All API calls follow this workflow:

#### 1. Create User Account
```bash
POST /auth/join

# No headers required
# No body required

Response:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "Brave_Fox"
}
```

Save the returned `id` - you'll need it for all subsequent API calls.

---

### Gateway Management

All gateway endpoints require the `x-user-id` header with your user ID from `/auth/join`.

#### 2. Create Gateway
```bash
POST /gateway/create

Headers:
  x-user-id: <your-user-id>

Body:
{
  "name": "my-project"
}

Response:
{
  "gateway_id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
  "secret": "x1y2z3a4-b5c6-47d8-e9f0-g1h2i3j4k5l6"
}
```

Save both `gateway_id` and `secret` - these are used to make API requests.

---

#### 3. List All Gateways
```bash
GET /gateway/list

Headers:
  x-user-id: <your-user-id>

Response:
{
  "gateways": [
    {
      "id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
      "name": "my-project",
      "created_at": "2024-01-15T10:30:00"
    },
    {
      "id": "b2c3d4e5-f6a7-48h9-i0j1-k2l3m4n5o6p7",
      "name": "another-project",
      "created_at": "2024-01-16T14:45:00"
    }
  ]
}
```

---

#### 4. Get Gateway Credentials
```bash
GET /gateway/{gateway_id}/credentials

Headers:
  x-user-id: <your-user-id>

Response:
{
  "gateway_id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
  "name": "my-project",
  "secret": "x1y2z3a4-b5c6-47d8-e9f0-g1h2i3j4k5l6"
}
```

---

#### 5. Regenerate Gateway Secret
```bash
POST /gateway/{gateway_id}/regenerate

Headers:
  x-user-id: <your-user-id>

Response:
{
  "gateway_id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
  "name": "my-project",
  "secret": "newSecret-a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6"
}
```

The old secret immediately becomes invalid.

---

### Chat Completions (OpenAI-compatible)

Make LLM requests using your gateway credentials. The endpoint is compatible with OpenAI's API format.

```bash
POST /chat/completions

Headers:
  x-gateway-id: <gateway-id>
  x-gateway-authorization: <gateway-secret>

Body:
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": "Hello! What is 2+2?"
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 512
}

Response:
{
  "id": "chatcmpl-8lmZqVq0h0sW9qwVfDw8pKZq",
  "object": "chat.completion",
  "created": 1705324800,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "2 + 2 equals 4."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 8,
    "total_tokens": 23
  }
}
```

**Supported Parameters:**
- `model`: Model name (e.g., "gpt-4o", "claude-opus-4.1", "gemini-2.5-pro")
- `messages`: Array of message objects with `role` and `content`
- `stream`: Boolean (true for streaming, false for non-streaming)
- `temperature`: Float between 0 and 2 (default: 0.7)
- `max_tokens`: Integer (default: 512)

**Streaming Example:**
```bash
POST /chat/completions

Headers:
  x-gateway-id: <gateway-id>
  x-gateway-authorization: <gateway-secret>

Body:
{
  "model": "gpt-4o",
  "messages": [{"role": "user", "content": "Tell me a story"}],
  "stream": true
}

# Response: Server-Sent Events (SSE)
data: {"choices":[{"delta":{"content":"Once"}}]}

data: {"choices":[{"delta":{"content":" upon"}}]}

data: {"choices":[{"delta":{"content":" a"}}]}

data: [DONE]
```

---

### Analytics

Get detailed usage analytics for a gateway.

```bash
GET /analytics/gateway/{gateway_id}?days=30&include_logs=false

Headers:
  x-user-id: <your-user-id>

Query Parameters:
  days: Number of days to include (default: 7)
  include_logs: Boolean to include detailed request logs (default: false)

Response:
{
  "gateway_id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
  "date_range": {
    "start_date": "2024-01-15",
    "end_date": "2024-02-14",
    "days": 30
  },
  "summary": {
    "total_requests": 245,
    "tokens_in": 12500,
    "tokens_out": 18750,
    "total_tokens": 31250,
    "total_cost": 0.82,
    "avg_latency": 1.45,
    "min_latency": 0.32,
    "max_latency": 3.87,
    "error_count": 6,
    "error_rate": 2.45,
    "success_rate": 97.55
  },
  "model_breakdown": {
    "gpt-4o": {
      "requests": 150,
      "tokens_in": 7500,
      "tokens_out": 11250,
      "total_tokens": 18750,
      "cost": 0.50,
      "avg_latency": 1.2
    },
    "claude-opus-4.1": {
      "requests": 95,
      "tokens_in": 5000,
      "tokens_out": 7500,
      "total_tokens": 12500,
      "cost": 0.32,
      "avg_latency": 1.8
    }
  },
  "daily_stats": [
    {
      "date": "2024-02-14",
      "requests": 25,
      "tokens_in": 1250,
      "tokens_out": 1875,
      "cost": 0.08,
      "errors": 0,
      "success_rate": 100.0
    },
    {
      "date": "2024-02-13",
      "requests": 18,
      "tokens_in": 900,
      "tokens_out": 1350,
      "cost": 0.06,
      "errors": 1,
      "success_rate": 94.4
    }
  ],
  "logs": null
}
```

**With Detailed Logs:**
```bash
GET /analytics/gateway/{gateway_id}?days=7&include_logs=true

# Same response but with additional "logs" array:
"logs": [
  {
    "id": "log-001",
    "response_id": "chatcmpl-xxx",
    "timestamp": "2024-02-14T15:30:45",
    "gateway_id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
    "model": "gpt-4o",
    "provider": "openai",
    "tokens_prompt": 50,
    "tokens_completion": 75,
    "request_type": "non-streaming",
    "status": true,
    "cost": 0.002,
    "latency": 1.23,
    "error_message": null,
    "http_status_code": 200,
    "endpoint": "/chat/completions"
  }
]
```

---

### Complete Example Flow

```bash
# Step 1: Create account
curl -X POST http://localhost:8000/auth/join
# Response: {"id": "user-123", "username": "Brave_Fox"}

# Step 2: Create gateway
curl -X POST http://localhost:8000/gateway/create \
  -H "x-user-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-project"}'
# Response: {"gateway_id": "gw-123", "secret": "secret-456"}

# Step 3: Make API request
curl -X POST http://localhost:8000/chat/completions \
  -H "x-gateway-id: gw-123" \
  -H "x-gateway-authorization: secret-456" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": false
  }'

# Step 4: Check analytics
curl -X GET "http://localhost:8000/analytics/gateway/gw-123?days=7" \
  -H "x-user-id: user-123"
```

---

## Project Structure

```
ai-gateway/
├── src/
│   ├── main.py              # FastAPI application & endpoints
│   ├── db.py                # SQLAlchemy models (User, Gateway)
│   ├── models.py            # Pydantic request/response models
│   ├── routing.py           # 200+ model-to-provider mappings & pricing
│   ├── analytics.py         # ClickHouse analytics engine
│   ├── utils.py             # Helper functions (routing, caching, auth)
│   └── __init__.py
├── frontend/
│   ├── src/
│   │   ├── App.tsx                      # Main app component
│   │   ├── components/
│   │   │   ├── Dashboard.tsx            # Gateway list & creation
│   │   │   ├── GatewayView.tsx          # Gateway details
│   │   │   ├── GatewayAnalytics.tsx     # Analytics charts
│   │   │   ├── GatewayLogs.tsx          # Request logs
│   │   │   ├── GatewayPlayground.tsx    # API testing interface
│   │   │   ├── GatewaySettings.tsx      # Gateway configuration
│   │   │   ├── GatewayOverview.tsx      # Summary statistics
│   │   │   └── Profile.tsx              # User profile
│   │   ├── context/
│   │   │   ├── AuthContext.tsx          # User authentication state
│   │   │   └── ThemeContext.tsx         # Dark/light theme
│   │   ├── services/
│   │   │   ├── apiService.ts            # API client
│   │   │   └── config.ts                # Configuration
│   │   ├── types.ts                     # TypeScript interfaces
│   │   └── index.tsx                    # React entry point
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── pyproject.toml           # Python dependencies & metadata
├── uv.lock                  # Locked dependency versions
├── Dockerfile               # Multi-stage Docker build
├── .env.example             # Environment template
├── .gitignore
└── README.md
```

---

## Supported Models & Providers

### Provider List (50+)
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-4o, GPT-5 series
- **Anthropic**: Claude 3 family, Claude Opus/Sonnet/Haiku
- **Google**: Gemini 2.5, Gemini 3, Gemma series
- **Mistral**: Mistral Large, Mixtral, Ministral
- **Meta**: Llama 3.1, Llama 3.3, Llama Guard
- **DeepSeek**: DeepSeek-R1, DeepSeek-V3
- **xAI**: Grok series
- **Cohere**: Command R, Command R+
- And 40+ more providers

### Example Model Requests
```python
# Use with OpenAI client library
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000",
    api_key="your-api-key"
)

# Route to OpenAI
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)

# Route to Anthropic
response = client.chat.completions.create(
    model="claude-opus-4.1",
    messages=[{"role": "user", "content": "Hello!"}]
)

# Route to Google
response = client.chat.completions.create(
    model="gemini-2.5-pro",
    messages=[{"role": "user", "content": "Hello!"}]
)

# Use free model (requires FREE_MODEL_API_KEY)
response = client.chat.completions.create(
    model="free",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## Performance Characteristics

- **Request latency**: 2-2000ms (depends on provider and model)
- **Concurrent connections**: 30+ concurrent connections handled efficiently
- **Database**: SQLite (development), PostgreSQL recommended for production
- **Analytics**: ClickHouse (optional) handles real-time analytics
- **Caching**: 15-second TTL on analytics queries for optimal performance

---

### Adding New Models
Edit `src/routing.py`:
```python
MODEL_TO_PROVIDER = {
    "new-model-name": "provider-slug",
    # ...
}

PROVIDER_TO_BASEURL = {
    "provider-slug": "https://api.provider.com/v1/",
    # ...
}

MODEL_COST = {
    "provider-slug:new-model-name": {
        "input_per_million": 0.5,
        "output_per_million": 1.5
    }
}
```

---

## Deployment

### Production Checklist
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure PostgreSQL `DATABASE_URL`
- [ ] Set secure `CORS_ORIGINS`
- [ ] Configure API keys for providers
- [ ] Set up ClickHouse for analytics (optional but recommended)
- [ ] Enable database backups
- [ ] Monitor error logs

---

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Acknowledgments

Built with modern Python and React ecosystems:
- FastAPI for excellent async web framework
- SQLAlchemy for database ORM
- React for responsive UI
- OpenAI Python client for unified API interface
- ClickHouse for analytics database
