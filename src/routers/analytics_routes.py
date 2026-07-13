from datetime import datetime, timedelta, UTC

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, case, text
from typing import Optional

from analytics import RequestAnalytics
from db import get_db
from utils import analytics_cache, safe_float

router = APIRouter()


@router.get("/analytics/{gateway_id}")
async def get_gateway_analytics(
    gateway_id: str,
    days: int = Query(default=30, ge=1, le=365),
    advanced: bool = Query(default=False, description="Include model breakdown and daily stats"),
    db=Depends(get_db),
):
    cache_key = f"analytics:{gateway_id}:{days}:{advanced}"
    if cache_key in analytics_cache:
        return analytics_cache[cache_key]

    end_date = datetime.now(UTC)
    start_date = end_date - timedelta(days=days)

    base_query = db.query(RequestAnalytics).filter(
        RequestAnalytics.gateway_id == gateway_id,
        RequestAnalytics.timestamp >= start_date,
        RequestAnalytics.timestamp <= end_date,
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
        return empty

    summary_row = base_query.with_entities(
        func.sum(RequestAnalytics.tokens_prompt).label("tokens_in"),
        func.sum(RequestAnalytics.tokens_completion).label("tokens_out"),
        func.sum(RequestAnalytics.cost).label("total_cost"),
        func.avg(RequestAnalytics.latency).label("avg_latency"),
        func.min(RequestAnalytics.latency).label("min_latency"),
        func.max(RequestAnalytics.latency).label("max_latency"),
        func.sum(case((RequestAnalytics.status.is_(False), 1), else_=0)).label("error_count"),
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
            func.count(RequestAnalytics.id).label("count"),
            func.sum(RequestAnalytics.tokens_prompt).label("tokens_in"),
            func.sum(RequestAnalytics.tokens_completion).label("tokens_out"),
            func.sum(RequestAnalytics.cost).label("cost"),
            func.avg(RequestAnalytics.latency).label("avg_latency"),
        ).group_by(RequestAnalytics.model).all()

        response["model_breakdown"] = {
            ms.model: {
                "requests": ms.count,
                "tokens_in": ms.tokens_in or 0,
                "tokens_out": ms.tokens_out or 0,
                "total_tokens": (ms.tokens_in or 0) + (ms.tokens_out or 0),
                "cost": safe_float(ms.cost),
                "avg_latency": safe_float(ms.avg_latency),
            }
            for ms in model_stats
        }

        daily_rows = base_query.with_entities(
            func.date(RequestAnalytics.timestamp).label("day"),
            func.count(RequestAnalytics.id).label("requests"),
            func.sum(RequestAnalytics.tokens_prompt).label("tokens_in"),
            func.sum(RequestAnalytics.tokens_completion).label("tokens_out"),
            func.sum(RequestAnalytics.cost).label("cost"),
            func.sum(case((RequestAnalytics.status.is_(False), 1), else_=0)).label("errors"),
        ).group_by(func.date(RequestAnalytics.timestamp)).order_by(text("day")).all()

        response["daily_stats"] = [
            {
                "date": str(dr.day),
                "requests": dr.requests,
                "tokens_in": dr.tokens_in or 0,
                "tokens_out": dr.tokens_out or 0,
                "cost": safe_float(dr.cost),
                "errors": dr.errors,
                "success_rate": round(((dr.requests - dr.errors) / dr.requests) * 100, 2),
            }
            for dr in daily_rows
        ]

    analytics_cache[cache_key] = response
    return response


@router.get("/logs/{gateway_id}")
async def get_gateway_logs(
    gateway_id: str,
    days: int = Query(default=30, ge=1, le=365),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    model: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None, description="success or error"),
    search: Optional[str] = Query(default=None, description="Search in model, response_id, error_message"),
    db=Depends(get_db),
):
    end_date = datetime.now(UTC)
    start_date = end_date - timedelta(days=days)

    query = db.query(RequestAnalytics).filter(
        RequestAnalytics.gateway_id == gateway_id,
        RequestAnalytics.timestamp >= start_date,
        RequestAnalytics.timestamp <= end_date,
    )

    if model:
        query = query.filter(RequestAnalytics.model == model)
    if status == "success":
        query = query.filter(RequestAnalytics.status.is_(True))
    elif status == "error":
        query = query.filter(RequestAnalytics.status.is_(False))
    if search:
        search_pattern_lower = f"%{search.lower()}%"
        query = query.filter(
            func.lower(RequestAnalytics.model).like(search_pattern_lower)
            | func.lower(RequestAnalytics.response_id).like(search_pattern_lower)
            | func.lower(RequestAnalytics.error_message).like(search_pattern_lower)
        )

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)

    records = (
        query.order_by(RequestAnalytics.timestamp.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    logs = [
        {
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
            "endpoint": r.endpoint,
        }
        for r in records
    ]

    models = (
        db.query(RequestAnalytics.model)
        .filter(
            RequestAnalytics.gateway_id == gateway_id,
            RequestAnalytics.timestamp >= start_date,
            RequestAnalytics.timestamp <= end_date,
        )
        .distinct()
        .all()
    )

    return {
        "logs": logs,
        "pagination": {"total": total, "page": page, "page_size": page_size, "total_pages": total_pages},
        "filters": {"available_models": [m[0] for m in models]},
    }
