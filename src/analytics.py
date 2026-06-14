import os
import logging
import uuid
import requests
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean
from clickhouse_sqlalchemy import Table, engines, get_declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

Analytics_Base = get_declarative_base()

ANALYTICS_BACKEND = os.getenv("ANALYTICS_BACKEND", "clickhouse")
TINYBIRD_API_URL = os.getenv("TINYBIRD_API_URL", "https://api.tinybird.co")
TINYBIRD_TOKEN = os.getenv("TINYBIRD_TOKEN")


class RequestAnalytics(Analytics_Base):
    __tablename__ = "request_analytics"
    __table_args__ = (
        engines.MergeTree(order_by=['timestamp']),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    response_id = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    gateway_id = Column(String)
    model = Column(String)
    provider = Column(String)
    tokens_prompt = Column(Integer)
    tokens_completion = Column(Integer)
    tokens_total = Column(Integer)
    request_type = Column(String)
    status = Column(Boolean)
    cost = Column(Float)
    latency = Column(Float)
    queue_time = Column(Float)
    prompt_time = Column(Float)
    completion_time = Column(Float)
    error_message = Column(String)
    prompt_text = Column(String)
    response_text = Column(String)
    http_status_code = Column(Integer)
    endpoint = Column(String)


# --- ClickHouse engine/session (for reads and clickhouse backend writes) ---

CLICKHOUSE_URL = os.getenv("CLICKHOUSE_URL")


def is_clickhouse_available():
    if not CLICKHOUSE_URL:
        print("CLICKHOUSE_URL not set, analytics reads will be disabled")
        return False
    return True


if is_clickhouse_available():
    try:
        analytics_engine = create_engine(
            CLICKHOUSE_URL,
            pool_pre_ping=True,
        )
        _Session = sessionmaker(bind=analytics_engine)
    except Exception as e:
        print(f"Error creating ClickHouse engine: {e}")
        analytics_engine = None
        _Session = None
else:
    analytics_engine = None
    _Session = None


# --- Save analytics ---

def save_analytics(chat_id=None, gateway_id=None, model=None, provider=None, tokens_prompt=0, tokens_completion=0,
                   request_type=None, status=False, cost=0.0, latency=None, queue_time=None,
                   prompt_time=None, completion_time=None, error_message=None, prompt_text=None,
                   response_text=None, http_status_code=None, endpoint=None):
    if ANALYTICS_BACKEND == "tinybird":
        _save_to_tinybird(chat_id, gateway_id, model, provider, tokens_prompt, tokens_completion,
                          request_type, status, cost, latency, queue_time, prompt_time, completion_time,
                          error_message, prompt_text, response_text, http_status_code, endpoint)
    else:
        _save_to_clickhouse(chat_id, gateway_id, model, provider, tokens_prompt, tokens_completion,
                            request_type, status, cost, latency, queue_time, prompt_time, completion_time,
                            error_message, prompt_text, response_text, http_status_code, endpoint)


def _save_to_tinybird(chat_id, gateway_id, model, provider, tokens_prompt, tokens_completion,
                      request_type, status, cost, latency, queue_time, prompt_time, completion_time,
                      error_message, prompt_text, response_text, http_status_code, endpoint):
    if not TINYBIRD_TOKEN:
        print("TINYBIRD_TOKEN not set, skipping analytics save")
        return

    payload = {
        "id": str(uuid.uuid4()),
        "response_id": chat_id or "",
        "timestamp": datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
        "gateway_id": gateway_id or "",
        "model": model or "",
        "provider": provider or "",
        "tokens_prompt": tokens_prompt or 0,
        "tokens_completion": tokens_completion or 0,
        "tokens_total": (tokens_prompt or 0) + (tokens_completion or 0),
        "request_type": request_type or "",
        "status": status or False,
        "cost": cost or 0.0,
        "latency": latency or 0.0,
        "queue_time": queue_time or 0.0,
        "prompt_time": prompt_time or 0.0,
        "completion_time": completion_time or 0.0,
        "error_message": error_message or "",
        "prompt_text": prompt_text or "",
        "response_text": response_text or "",
        "http_status_code": http_status_code or 0,
        "endpoint": endpoint or "",
    }

    url = f"{TINYBIRD_API_URL}/v0/events?name=request_analytics"
    headers = {
        "Authorization": f"Bearer {TINYBIRD_TOKEN}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        if response.status_code not in (200, 202):
            print(f"Tinybird ingest error ({response.status_code}): {response.text}")
    except Exception as e:
        logging.error(f"Tinybird ingest failed: {e}")


def _save_to_clickhouse(chat_id, gateway_id, model, provider, tokens_prompt, tokens_completion,
                        request_type, status, cost, latency, queue_time, prompt_time, completion_time,
                        error_message, prompt_text, response_text, http_status_code, endpoint):
    global analytics_engine, _Session
    if not analytics_engine or not _Session:
        print("ClickHouse not available, skipping analytics save")
        return

    try:
        session = _Session()
        record = RequestAnalytics(
            response_id=chat_id,
            gateway_id=gateway_id,
            model=model,
            provider=provider,
            tokens_prompt=tokens_prompt,
            tokens_completion=tokens_completion,
            tokens_total=tokens_prompt + tokens_completion,
            request_type=request_type,
            status=status,
            cost=cost,
            latency=latency,
            queue_time=queue_time,
            prompt_time=prompt_time,
            completion_time=completion_time,
            error_message=error_message,
            prompt_text=prompt_text,
            response_text=response_text,
            http_status_code=http_status_code,
            endpoint=endpoint
        )
        session.add(record)
        session.commit()
        session.close()
    except Exception as e:
        logging.error(f"Failed to save analytics to ClickHouse: {e}")
