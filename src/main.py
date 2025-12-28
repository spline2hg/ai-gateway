import json
import time
import sys
from pathlib import Path
import uuid
from starlette.responses import StreamingResponse

from db import Base, engine, get_db, Gateway, User

# Add the src directory to the path for imports
sys.path.append(str(Path(__file__).parent))

from models import ChatCompletionRequest, GatewayCreate
from utils import resolve_route, validate_gateway, extract_status_code_from_error, get_cost, make_cache_key, analytics_cache, generate_username, get_current_user
from analytics import save_analytics, Analytics_Base, analytics_engine, _Session, RequestAnalytics

from fastapi import FastAPI, Header, Query, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from typing import Dict, List, Optional


app = FastAPI(title="OpenAI-compatible API")


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Create tables during startup if engine is available
    if analytics_engine:
        try:
            Analytics_Base.metadata.create_all(analytics_engine)
            print("ClickHouse connected and tables created")
        except Exception as e:
            print(f"ClickHouse available but failed to create tables: {e}")
    else:
        print("ClickHouse not available, analytics will be disabled")

    Base.metadata.create_all(engine)
    
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
    
    model_name, provider, mapped_llm_url, api_key = resolve_route(request.model)
    
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
                    cost_estimate = get_cost(model_name, provider, tokens_prompt, tokens_completion)
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
            cost_estimate = get_cost(model_name, provider, tokens_prompt, tokens_completion)
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
    days: int = Query(default=30, description="Number of days to look back", ge=1, le=365),
    include_logs: bool = Query(default=False, description="Include full log records in response")
):
    """
    Get comprehensive analytics for a specific gateway
    Returns request counts, token usage, costs, latency, error rates, model breakdown, and optional full logs
    """
    global analytics_engine, _Session
    if not analytics_engine or not _Session:
        return {"error": "Analytics database not available"}

    cache_key = make_cache_key(gateway_id, days, include_logs)
    
    if cache_key in analytics_cache:
        print("cached")
        return analytics_cache[cache_key]
    try:
        from datetime import datetime, timedelta, UTC
        from sqlalchemy import func, text

        session = _Session()

        # Calculate date range (using timezone-aware UTC)
        end_date = datetime.now(UTC)
        start_date = end_date - timedelta(days=days)

        # Base query for gateway's data within date range
        base_query = session.query(RequestAnalytics).filter(
            RequestAnalytics.gateway_id == gateway_id,
            RequestAnalytics.timestamp >= start_date,
            RequestAnalytics.timestamp <= end_date
        )

        # Total requests
        total_requests = base_query.count()

        if total_requests == 0:
            return {
                "gateway_id": gateway_id,
                "date_range": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "days": days
                },
                "summary": {
                    "total_requests": 0,
                    "tokens_in": 0,
                    "tokens_out": 0,
                    "total_tokens": 0,
                    "total_cost": 0.0,
                    "avg_latency": 0.0,
                    "error_count": 0,
                    "error_rate": 0.0
                },
                "model_breakdown": {},
                "daily_stats": []
            }

        # Token statistics
        token_stats = base_query.with_entities(
            func.sum(RequestAnalytics.tokens_prompt).label('total_tokens_in'),
            func.sum(RequestAnalytics.tokens_completion).label('total_tokens_out'),
            func.sum(RequestAnalytics.cost).label('total_cost')
        ).first()

        # Latency statistics (only for successful requests)
        latency_stats = base_query.filter(
            RequestAnalytics.status == True,
            RequestAnalytics.latency.isnot(None)
        ).with_entities(
            func.avg(RequestAnalytics.latency).label('avg_latency'),
            func.min(RequestAnalytics.latency).label('min_latency'),
            func.max(RequestAnalytics.latency).label('max_latency')
        ).first()

        # Error statistics
        error_count = base_query.filter(RequestAnalytics.status == False).count()
        error_rate = (error_count / total_requests) * 100 if total_requests > 0 else 0

        # Model usage breakdown
        model_stats = base_query.with_entities(
            RequestAnalytics.model,
            func.count(RequestAnalytics.id).label('count'),
            func.sum(RequestAnalytics.tokens_prompt).label('tokens_in'),
            func.sum(RequestAnalytics.tokens_completion).label('tokens_out'),
            func.sum(RequestAnalytics.cost).label('cost'),
            func.avg(RequestAnalytics.latency).label('avg_latency')
        ).group_by(RequestAnalytics.model).all()

        # Format model breakdown
        model_breakdown = {}
        for model_stat in model_stats:
            model_breakdown[model_stat.model] = {
                "requests": model_stat.count,
                "tokens_in": model_stat.tokens_in or 0,
                "tokens_out": model_stat.tokens_out or 0,
                "total_tokens": (model_stat.tokens_in or 0) + (model_stat.tokens_out or 0),
                "cost": float(model_stat.cost or 0),
                "avg_latency": float(model_stat.avg_latency or 0) if model_stat.avg_latency else 0
            }

        # Daily statistics for the requested time range
        daily_stats = []
        for i in range(days):
            day_start = end_date - timedelta(days=i)
            day_end = day_start + timedelta(days=1)

            day_query = base_query.filter(
                RequestAnalytics.timestamp >= day_start,
                RequestAnalytics.timestamp < day_end
            )

            day_requests = day_query.count()
            if day_requests > 0:
                day_tokens = day_query.with_entities(
                    func.sum(RequestAnalytics.tokens_prompt).label('tokens_in'),
                    func.sum(RequestAnalytics.tokens_completion).label('tokens_out'),
                    func.sum(RequestAnalytics.cost).label('cost')
                ).first()

                day_errors = day_query.filter(RequestAnalytics.status == False).count()

                daily_stats.append({
                    "date": day_start.date().isoformat(),
                    "requests": day_requests,
                    "tokens_in": day_tokens.tokens_in or 0,
                    "tokens_out": day_tokens.tokens_out or 0,
                    "cost": float(day_tokens.cost or 0),
                    "errors": day_errors,
                    "success_rate": ((day_requests - day_errors) / day_requests) * 100
                })

        # Retrieve full logs if requested
        logs = []
        if include_logs:
            log_records = base_query.order_by(RequestAnalytics.timestamp.desc()).all()

            for record in log_records:
                log_entry = {
                    "id": record.id,
                    "response_id": record.response_id,
                    "timestamp": record.timestamp.isoformat() if record.timestamp else None,
                    "gateway_id": record.gateway_id,
                    "model": record.model,
                    "provider": record.provider,
                    "tokens_prompt": record.tokens_prompt,
                    "tokens_completion": record.tokens_completion,
                    "tokens_total": record.tokens_total,
                    "request_type": record.request_type,
                    "status": record.status,
                    "cost": float(record.cost) if record.cost else 0,
                    "latency": float(record.latency) if record.latency else None,
                    "queue_time": float(record.queue_time) if record.queue_time else None,
                    "prompt_time": float(record.prompt_time) if record.prompt_time else None,
                    "completion_time": float(record.completion_time) if record.completion_time else None,
                    "error_message": record.error_message,
                    "prompt_text": record.prompt_text,
                    "response_text": record.response_text,
                    "http_status_code": record.http_status_code,
                    "endpoint": record.endpoint
                }
                logs.append(log_entry)

        # Prepare response
        response = {
            "gateway_id": gateway_id,
            "date_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "summary": {
                "total_requests": total_requests,
                "tokens_in": token_stats.total_tokens_in or 0,
                "tokens_out": token_stats.total_tokens_out or 0,
                "total_tokens": (token_stats.total_tokens_in or 0) + (token_stats.total_tokens_out or 0),
                "total_cost": float(token_stats.total_cost or 0),
                "avg_latency": float(latency_stats.avg_latency or 0) if latency_stats.avg_latency else 0,
                "min_latency": float(latency_stats.min_latency or 0) if latency_stats.min_latency else 0,
                "max_latency": float(latency_stats.max_latency or 0) if latency_stats.max_latency else 0,
                "error_count": error_count,
                "error_rate": round(error_rate, 2),
                "success_rate": round(100 - error_rate, 2),
                "log_count": len(logs)
            },
            "model_breakdown": model_breakdown,
            "daily_stats": list(reversed(daily_stats)),  # Most recent first
            "logs": logs if include_logs else None
        }
        analytics_cache[cache_key] = response

        session.close()
        return response

    except Exception as e:
        print(f"Error fetching analytics: {e}")
        return {"error": f"Failed to fetch analytics: {str(e)}"}



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
