import logging
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Index

from db import Base, SessionLocal


class RequestAnalytics(Base):
    __tablename__ = "request_analytics"
    __table_args__ = (
        Index("ix_request_analytics_gateway_timestamp", "gateway_id", "timestamp"),
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


def save_analytics(chat_id=None, gateway_id=None, model=None, provider=None, tokens_prompt=0, tokens_completion=0,
                   request_type=None, status=False, cost=0.0, latency=None, queue_time=None,
                   prompt_time=None, completion_time=None, error_message=None, prompt_text=None,
                   response_text=None, http_status_code=None, endpoint=None):
    session = SessionLocal()
    try:
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
            endpoint=endpoint,
        )
        session.add(record)
        session.commit()
    except Exception as e:
        session.rollback()
        logging.error(f"Failed to save analytics: {e}")
    finally:
        session.close()
