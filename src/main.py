import json
import time
import sys
import os
from pathlib import Path
import uuid
from starlette.responses import StreamingResponse

# Add the src directory to the path for imports
sys.path.insert(0, str(Path(__file__).parent))

from db import Base, engine, get_db, Gateway, User, SessionLocal
from models import ChatCompletionRequest, GatewayCreate
from utils import validate_gateway, extract_status_code_from_error, make_cache_key, analytics_cache, generate_username, get_current_user, safe_float
from analytics import save_analytics, RequestAnalytics
from model_registry import registry

from contextlib import asynccontextmanager
from fastapi import FastAPI, Header, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from typing import Optional


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    registry.initialize()

    Base.metadata.create_all(engine)
    print("Database: tables created (analytics stored alongside core tables)")

    yield

    # Shutdown
    engine.dispose()
    analytics_cache.clear()


app = FastAPI(title="OpenAI-compatible API", lifespan=lifespan)

# Get CORS origins from environment or use default for local development
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
cors_origins = [origin.strip() for origin in cors_origins]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/v1/models")
async def list_models():
    return {
        "object": "list",
        "data": [
            {
                "id": model_id,
                "object": "model",
                "owned_by": provider_id,
            }
            for model_id, provider_id in registry.model_to_provider.items()
        ],
    }

@app.get("/models/list")
async def list_models_with_cost(show_all: bool = Query(default=False)):
    if show_all:
        return {"models": registry.all_models}
    return {
        "models": [
            {
                "id": model_id,
                "provider": provider_id,
                "input_cost": registry.model_cost.get(model_id, {}).get("input"),
                "output_cost": registry.model_cost.get(model_id, {}).get("output"),
            }
            for model_id, provider_id in registry.model_to_provider.items()
        ]
    }

@app.post("/chat/completions")
async def chat_completions(
    request: ChatCompletionRequest, authorization: str = Header(None),
    x_gateway_authorization: str = Header(None, alias="x-gateway-authorization"),
    x_gateway_id: str = Header(None, alias="x-gateway-id"),
    db=Depends(get_db)
):
    api_key = None
    if authorization and authorization.startswith("Bearer "):
        api_key = authorization.split(" ")[1]
        
        if not api_key:
            return {"error": "Authorization header missing"}

    gateway = validate_gateway(x_gateway_id, x_gateway_authorization, db)
    if not gateway:
        return {"error": "Invalid Gateway ID or Authorization"}


        
    print("API KEY:", api_key)
    # print("user id:", request.user_id)
    print(x_gateway_authorization, x_gateway_id)
    # mapped_llm_url = "https://portal.qwen.ai/v1/"
    
    model_name, provider, mapped_llm_url, resolved_api_key = registry.resolve_route(request.model)
    # Use resolved API key if provided, otherwise keep the one from Authorization header
    if resolved_api_key is not None:
        api_key = resolved_api_key
    
    client = AsyncOpenAI(api_key=api_key, base_url=mapped_llm_url)

    if request.stream:
        async def upstream_generator():
            try:
                # Track timing measurements
                start_time = time.time()

                # 2. Call the upstream API asynchronously
                stream = await client.chat.completions.create(
                    model=model_name,
                    messages=request.messages,
                    stream=True,
                    stream_options={"include_usage": True}
                )
                usage_dict = None
                time_info = None
                chat_id = None
                full_response_text = ""
                # 3. Iterate over the upstream stream
                async for chunk in stream:
                    # Dump the pydantic object to JSON
                    chunk_data = chunk.model_dump_json()
                    if chat_id is None:
                            chat_id = chunk.id
                    if chunk.usage:
                        usage_dict = chunk.usage
                    if hasattr(chunk, 'time_info') and chunk.time_info:
                        time_info = chunk.time_info

                    # Collect the full response text
                    if chunk.choices and chunk.choices[0].delta.content:
                        full_response_text += chunk.choices[0].delta.content

                    # 4. Format as Server-Sent Event (SSE)
                    yield f"data: {chunk_data}\n\n"
                
                if usage_dict:
                    tokens_prompt = usage_dict.prompt_tokens
                    tokens_completion = usage_dict.completion_tokens
                    cost_estimate = registry.get_cost(provider, model_name, tokens_prompt, tokens_completion)
                else:
                    tokens_prompt = 0
                    tokens_completion = 0
                    cost_estimate = 0

                # Use timing data from the upstream response
                if time_info:
                    queue_time = time_info.get('queue_time')
                    prompt_time = time_info.get('prompt_time')
                    completion_time = time_info.get('completion_time')
                    latency = time_info.get('total_time')
                else:
                    # Fallback to manual timing if time_info not available
                    latency = time.time() - start_time
                    queue_time = prompt_time = completion_time = None

                save_analytics(
                    chat_id=chat_id,
                    gateway_id=x_gateway_id,
                    model=model_name,
                    provider=provider,
                    tokens_prompt=tokens_prompt,
                    tokens_completion=tokens_completion,
                    request_type="streaming",
                    status=True,
                    cost=cost_estimate,
                    latency=latency,
                    queue_time=queue_time,
                    prompt_time=prompt_time,
                    completion_time=completion_time,
                    error_message=None,
                    prompt_text=json.dumps([msg.model_dump() if hasattr(msg, 'model_dump') else dict(msg) for msg in request.messages]),
                    response_text=full_response_text,
                    http_status_code=200,
                    endpoint="/chat/completions"
                )
                # 5. Signal the end of the stream
                yield "data: [DONE]\n\n"

            except Exception as e:
                print(f"Error in stream: {e}")
                error_status_code = extract_status_code_from_error(str(e))
                save_analytics(
                    gateway_id=x_gateway_id,
                    model=model_name,
                    provider=provider,
                    tokens_prompt=0,
                    tokens_completion=0,
                    request_type="streaming",
                    status=False,
                    cost=0,
                    latency=None,
                    queue_time=None,
                    prompt_time=None,
                    completion_time=None,
                    error_message=str(e),
                    prompt_text=json.dumps([msg.model_dump() if hasattr(msg, 'model_dump') else dict(msg) for msg in request.messages]),
                    response_text=None,
                    http_status_code=error_status_code,
                    endpoint="/chat/completions"
                )
                error_msg = json.dumps({"error": str(e)})
                yield f"data: {error_msg}\n\n"

        # 6. Return the StreamingResponse with the generator
        return StreamingResponse(upstream_generator(), media_type="text/event-stream")
    else:
        try:
            # Track timing measurements
            start_time = time.time()

            upstream = await client.chat.completions.create(
                messages=request.messages,
                model=model_name,
            )
            print("Upstream response:", upstream)
            print(upstream.id)
            print("********")
            assistant_text = upstream.choices[0].message.content
            
            
            tokens_prompt = upstream.usage.prompt_tokens
            tokens_completion = upstream.usage.completion_tokens
            cost_estimate = registry.get_cost(provider, model_name, tokens_prompt, tokens_completion)
            print(tokens_prompt, tokens_completion, cost_estimate)

            # Use timing data from the upstream response
            if hasattr(upstream, 'time_info') and upstream.time_info:
                queue_time = upstream.time_info.get('queue_time')
                prompt_time = upstream.time_info.get('prompt_time')
                completion_time = upstream.time_info.get('completion_time')
                latency = upstream.time_info.get('total_time')
            else:
                # Fallback to manual timing if time_info not available
                latency = time.time() - start_time
                queue_time = prompt_time = completion_time = None

            save_analytics(
                chat_id=upstream.id,
                gateway_id=x_gateway_id,
                model=model_name,
                provider=provider,
                tokens_prompt=tokens_prompt,
                tokens_completion=tokens_completion,
                request_type="non-streaming",
                status=True,
                cost=cost_estimate,
                latency=latency,
                queue_time=queue_time,
                prompt_time=prompt_time,
                completion_time=completion_time,
                error_message=None,
                prompt_text=json.dumps([msg.model_dump() if hasattr(msg, 'model_dump') else dict(msg) for msg in request.messages]),
                response_text=assistant_text,
                http_status_code=200,
                endpoint="/chat/completions"
            )
                    
    
            return {
                "id": upstream.id,
                "object": "chat.completion",
                "created": upstream.created,
                "model": upstream.model,
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": assistant_text,
                            "refusal": None,
                            "annotations": [],
                        },
                        "logprobs": None,
                        "finish_reason": upstream.choices[0].finish_reason or "stop",
                    }
                ],
                "usage": upstream.usage.model_dump()
                if hasattr(upstream, "usage")
                else None,
            }
        except Exception as e:
            print(f"Error in non-streaming: {e}")
            error_status_code = extract_status_code_from_error(str(e))
            save_analytics(
                gateway_id=x_gateway_id,
                model=model_name,
                provider=provider,
                tokens_prompt=0,
                tokens_completion=0,
                request_type="non-streaming",
                status=False,
                cost=0,
                latency=None,
                queue_time=None,
                prompt_time=None,
                completion_time=None,
                error_message=str(e),
                prompt_text=json.dumps([msg.model_dump() if hasattr(msg, 'model_dump') else dict(msg) for msg in request.messages]),
                response_text=None,
                http_status_code=error_status_code,
                endpoint="/chat/completions"
            )
            return {"error": str(e)}

@app.get("/analytics/{gateway_id}")
async def get_gateway_analytics(
    gateway_id: str,
    days: int = Query(default=30, ge=1, le=365),
    advanced: bool = Query(default=False, description="Include model breakdown and daily stats")
):
    cache_key = f"analytics:{gateway_id}:{days}:{advanced}"

    if cache_key in analytics_cache:
        return analytics_cache[cache_key]
    try:
        from datetime import datetime, timedelta, UTC
        from sqlalchemy import func, text, case

        session = SessionLocal()
        end_date = datetime.now(UTC)
        start_date = end_date - timedelta(days=days)

        base_query = session.query(RequestAnalytics).filter(
            RequestAnalytics.gateway_id == gateway_id,
            RequestAnalytics.timestamp >= start_date,
            RequestAnalytics.timestamp <= end_date
        )

        total_requests = base_query.count()

        if total_requests == 0:
            empty = {
                "gateway_id": gateway_id,
                "date_range": {"start_date": start_date.isoformat(), "end_date": end_date.isoformat(), "days": days},
                "summary": {"total_requests": 0, "tokens_in": 0, "tokens_out": 0, "total_tokens": 0, "total_cost": 0.0, "avg_latency": 0.0, "error_count": 0, "error_rate": 0.0, "success_rate": 100.0},
            }
            if advanced:
                empty["model_breakdown"] = {}
                empty["daily_stats"] = []
            session.close()
            return empty

        summary_row = base_query.with_entities(
            func.sum(RequestAnalytics.tokens_prompt).label('tokens_in'),
            func.sum(RequestAnalytics.tokens_completion).label('tokens_out'),
            func.sum(RequestAnalytics.cost).label('total_cost'),
            func.avg(RequestAnalytics.latency).label('avg_latency'),
            func.min(RequestAnalytics.latency).label('min_latency'),
            func.max(RequestAnalytics.latency).label('max_latency'),
            func.sum(case((RequestAnalytics.status == False, 1), else_=0)).label('error_count'),
        ).first()

        error_count = summary_row.error_count or 0
        error_rate = (error_count / total_requests) * 100 if total_requests > 0 else 0

        response = {
            "gateway_id": gateway_id,
            "date_range": {"start_date": start_date.isoformat(), "end_date": end_date.isoformat(), "days": days},
            "summary": {
                "total_requests": total_requests,
                "tokens_in": summary_row.tokens_in or 0,
                "tokens_out": summary_row.tokens_out or 0,
                "total_tokens": (summary_row.tokens_in or 0) + (summary_row.tokens_out or 0),
                "total_cost": safe_float(summary_row.total_cost),
                "avg_latency": safe_float(summary_row.avg_latency),
                "min_latency": safe_float(summary_row.min_latency),
                "max_latency": safe_float(summary_row.max_latency),
                "error_count": error_count,
                "error_rate": round(error_rate, 2),
                "success_rate": round(100 - error_rate, 2),
            },
        }

        if advanced:
            model_stats = base_query.with_entities(
                RequestAnalytics.model,
                func.count(RequestAnalytics.id).label('count'),
                func.sum(RequestAnalytics.tokens_prompt).label('tokens_in'),
                func.sum(RequestAnalytics.tokens_completion).label('tokens_out'),
                func.sum(RequestAnalytics.cost).label('cost'),
                func.avg(RequestAnalytics.latency).label('avg_latency')
            ).group_by(RequestAnalytics.model).all()

            response["model_breakdown"] = {
                ms.model: {
                    "requests": ms.count,
                    "tokens_in": ms.tokens_in or 0,
                    "tokens_out": ms.tokens_out or 0,
                    "total_tokens": (ms.tokens_in or 0) + (ms.tokens_out or 0),
                    "cost": safe_float(ms.cost),
                    "avg_latency": safe_float(ms.avg_latency)
                } for ms in model_stats
            }

            daily_rows = base_query.with_entities(
                func.date(RequestAnalytics.timestamp).label('day'),
                func.count(RequestAnalytics.id).label('requests'),
                func.sum(RequestAnalytics.tokens_prompt).label('tokens_in'),
                func.sum(RequestAnalytics.tokens_completion).label('tokens_out'),
                func.sum(RequestAnalytics.cost).label('cost'),
                func.sum(case((RequestAnalytics.status == False, 1), else_=0)).label('errors'),
            ).group_by(func.date(RequestAnalytics.timestamp)).order_by(text('day')).all()

            response["daily_stats"] = [{
                "date": str(dr.day),
                "requests": dr.requests,
                "tokens_in": dr.tokens_in or 0,
                "tokens_out": dr.tokens_out or 0,
                "cost": safe_float(dr.cost),
                "errors": dr.errors,
                "success_rate": round(((dr.requests - dr.errors) / dr.requests) * 100, 2)
            } for dr in daily_rows]

        analytics_cache[cache_key] = response
        session.close()
        return response

    except Exception as e:
        print(f"Error fetching analytics: {e}")
        return {"error": f"Failed to fetch analytics: {str(e)}"}


@app.get("/logs/{gateway_id}")
async def get_gateway_logs(
    gateway_id: str,
    days: int = Query(default=30, ge=1, le=365),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    model: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None, description="success or error"),
    search: Optional[str] = Query(default=None, description="Search in model, response_id, error_message"),
):
    try:
        from datetime import datetime, timedelta, UTC
        from sqlalchemy import func, case

        session = SessionLocal()
        end_date = datetime.now(UTC)
        start_date = end_date - timedelta(days=days)

        query = session.query(RequestAnalytics).filter(
            RequestAnalytics.gateway_id == gateway_id,
            RequestAnalytics.timestamp >= start_date,
            RequestAnalytics.timestamp <= end_date
        )

        if model:
            query = query.filter(RequestAnalytics.model == model)
        if status == "success":
            query = query.filter(RequestAnalytics.status == True)
        elif status == "error":
            query = query.filter(RequestAnalytics.status == False)
        if search:
            search_pattern_lower = f"%{search.lower()}%"
            query = query.filter(
                (func.lower(RequestAnalytics.model).like(search_pattern_lower)) |
                (func.lower(RequestAnalytics.response_id).like(search_pattern_lower)) |
                (func.lower(RequestAnalytics.error_message).like(search_pattern_lower))
            )

        total = query.count()
        total_pages = max(1, (total + page_size - 1) // page_size)

        records = query.order_by(RequestAnalytics.timestamp.desc()).offset((page - 1) * page_size).limit(page_size).all()

        logs = [{
            "id": r.id, "response_id": r.response_id,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "gateway_id": r.gateway_id, "model": r.model, "provider": r.provider,
            "tokens_prompt": r.tokens_prompt, "tokens_completion": r.tokens_completion,
            "tokens_total": r.tokens_total, "request_type": r.request_type, "status": r.status,
            "cost": safe_float(r.cost),
            "latency": safe_float(r.latency) if r.latency else None,
            "queue_time": safe_float(r.queue_time) if r.queue_time else None,
            "prompt_time": safe_float(r.prompt_time) if r.prompt_time else None,
            "completion_time": safe_float(r.completion_time) if r.completion_time else None,
            "error_message": r.error_message, "prompt_text": r.prompt_text,
            "response_text": r.response_text, "http_status_code": r.http_status_code,
            "endpoint": r.endpoint
        } for r in records]

        models = session.query(RequestAnalytics.model).filter(
            RequestAnalytics.gateway_id == gateway_id,
            RequestAnalytics.timestamp >= start_date,
            RequestAnalytics.timestamp <= end_date
        ).distinct().all()

        session.close()
        return {
            "logs": logs,
            "pagination": {
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
            },
            "filters": {
                "available_models": [m[0] for m in models],
            }
        }

    except Exception as e:
        print(f"Error fetching logs: {e}")
        return {"error": f"Failed to fetch logs: {str(e)}"}



@app.post("/gateway/create")
async def create_gateway(body: GatewayCreate, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    from uuid import uuid4

    gateway_id = str(uuid4())
    secret = str(uuid4())

    gw = Gateway(id=gateway_id, name=body.name, secret_key=secret, user_id=current_user.id)
    db.add(gw)
    db.commit()

    return {
        "gateway_id": gateway_id,
        "secret": secret
    }

@app.get("/gateway/list")
async def list_gateways(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    gateways = db.query(Gateway).filter(Gateway.user_id == current_user.id).all()
    result = []
    for gw in gateways:
        result.append({
            "id": gw.id,
            "name": gw.name,
            "created_at": gw.created_at.isoformat() if gw.created_at else None
        })
    return {"gateways": result}

@app.get("/gateway/{gateway_id}/credentials")
async def get_gateway_credentials(gateway_id: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    gateway = db.query(Gateway).filter(
        Gateway.id == gateway_id,
        Gateway.user_id == current_user.id
    ).first()

    if not gateway:
        return {"error": "Gateway not found"}

    return {
        "gateway_id": gateway.id,
        "name": gateway.name,
        "secret": gateway.secret_key
    }

@app.post("/gateway/{gateway_id}/regenerate")
async def regenerate_gateway_secret(gateway_id: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    from uuid import uuid4

    gateway = db.query(Gateway).filter(
        Gateway.id == gateway_id,
        Gateway.user_id == current_user.id
    ).first()

    if not gateway:
        return {"error": "Gateway not found"}

    # Generate new secret
    new_secret = str(uuid4())
    gateway.secret_key = new_secret
    db.commit()

    return {
        "gateway_id": gateway.id,
        "name": gateway.name,
        "secret": new_secret
    }
    

@app.post("/auth/join")
def join(db=Depends(get_db)):
    # Generate unique user ID and username
    user_id = str(uuid.uuid4())
    username = generate_username()

    # Ensure username is unique
    while db.query(User).filter(User.username == username).first():
        username = generate_username()

    # Create and save user to database
    user = User(id=user_id, username=username)
    db.add(user)
    db.commit()

    return {"id": user_id, "username": username}
    
    
    
    
    
    
    
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
