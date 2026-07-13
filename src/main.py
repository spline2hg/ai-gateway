import os
import sys
from pathlib import Path

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

sys.path.insert(0, str(Path(__file__).parent))

from db import Base, engine
from utils import analytics_cache
from model_registry import registry

from routers import auth, gateway, chat, analytics_routes, models_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    registry.initialize()
    Base.metadata.create_all(engine)
    print("Database: tables created (analytics stored alongside core tables)")
    yield
    engine.dispose()
    analytics_cache.clear()


app = FastAPI(title="OpenAI-compatible API", lifespan=lifespan)

cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models_routes.router)
app.include_router(auth.router)
app.include_router(gateway.router)
app.include_router(chat.router)
app.include_router(analytics_routes.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
