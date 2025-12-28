import os
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean
from clickhouse_sqlalchemy import Table, engines, get_declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid
import logging

Analytics_Base = get_declarative_base()

class RequestAnalytics(Analytics_Base):
    __tablename__ = "request_analytics4"
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


# Initialize engine only if ClickHouse is available
import socket
from contextlib import closing

CLICKHOUSE_URL = os.getenv("CLICKHOUSE_URL")

    
def is_clickhouse_available():
    try:
        if not CLICKHOUSE_URL:
            print("CLICKHOUSE_URL not set, analytics will be disabled")
            return False
        host = os.getenv("CLICKHOUSE_HOST", "localhost")
        port = int(os.getenv("CLICKHOUSE_PORT", 8123))
        
        with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
            sock.settimeout(1.0)  # 1 second timeout
            result = sock.connect_ex((host, port))
            return result == 0
    except:
        return False

if is_clickhouse_available():
    try:
        analytics_engine = create_engine(
            CLICKHOUSE_URL,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 1, "send_receive_timeout": 2},
        )
        _Session = sessionmaker(bind=analytics_engine)
    except Exception as e:
        print(f"Error creating ClickHouse engine: {e}")
        analytics_engine = None
        _Session = None
else:
    print("ClickHouse server not available at localhost:8123")
    analytics_engine = None
    _Session = None

def save_analytics(chat_id=None, gateway_id=None, model=None, provider=None, tokens_prompt=0, tokens_completion=0,
                   request_type=None, status=False, cost=0.0, latency=None, queue_time=None,
                   prompt_time=None, completion_time=None, error_message=None, prompt_text=None,
                   response_text=None, http_status_code=None, endpoint=None):
    global analytics_engine, _Session
    if not analytics_engine or not _Session:
        # Silently return if ClickHouse is not available
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
