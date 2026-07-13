import json
import time

from analytics import save_analytics
from utils import extract_status_code_from_error


def serialize_messages(messages) -> str:
    return json.dumps(
        [msg.model_dump() if hasattr(msg, "model_dump") else dict(msg) for msg in messages]
    )


def extract_timing(time_info: dict | None, start_time: float):
    if time_info:
        return (
            time_info.get("total_time"),
            time_info.get("queue_time"),
            time_info.get("prompt_time"),
            time_info.get("completion_time"),
        )
    return (time.time() - start_time, None, None, None)


def record_success(
    *,
    chat_id, gateway_id, model, provider, request_type,
    tokens_prompt, tokens_completion, cost, start_time,
    time_info, response_text, prompt_text,
):
    latency, queue_time, prompt_time, completion_time = extract_timing(time_info, start_time)
    save_analytics(
        chat_id=chat_id, gateway_id=gateway_id, model=model, provider=provider,
        tokens_prompt=tokens_prompt, tokens_completion=tokens_completion,
        request_type=request_type, status=True, cost=cost,
        latency=latency, queue_time=queue_time, prompt_time=prompt_time,
        completion_time=completion_time, error_message=None,
        prompt_text=prompt_text, response_text=response_text,
        http_status_code=200, endpoint="/chat/completions",
    )


def record_error(
    *, gateway_id, model, provider, request_type, error, prompt_text,
):
    save_analytics(
        gateway_id=gateway_id, model=model, provider=provider,
        tokens_prompt=0, tokens_completion=0,
        request_type=request_type, status=False, cost=0,
        latency=None, queue_time=None, prompt_time=None,
        completion_time=None, error_message=str(error),
        prompt_text=prompt_text, response_text=None,
        http_status_code=extract_status_code_from_error(str(error)),
        endpoint="/chat/completions",
    )
