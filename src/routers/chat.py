import time

from fastapi import APIRouter, Header, Depends, HTTPException
from openai import AsyncOpenAI
from starlette.responses import StreamingResponse

from chat_service import serialize_messages, record_success, record_error
from db import get_db
from model_registry import registry
from models import ChatCompletionRequest
from utils import validate_gateway, extract_status_code_from_error

router = APIRouter()


@router.post("/chat/completions")
async def chat_completions(
    request: ChatCompletionRequest,
    authorization: str = Header(None),
    x_gateway_authorization: str = Header(None, alias="x-gateway-authorization"),
    x_gateway_id: str = Header(None, alias="x-gateway-id"),
    db=Depends(get_db),
):
    api_key = None
    if authorization and authorization.startswith("Bearer "):
        api_key = authorization.split(" ", 1)[1]

    gateway = validate_gateway(x_gateway_id, x_gateway_authorization, db)
    if not gateway:
        raise HTTPException(status_code=401, detail="Invalid gateway ID or authorization")

    model_name, provider, mapped_llm_url, resolved_api_key = registry.resolve_route(request.model)
    if resolved_api_key is not None:
        api_key = resolved_api_key
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing API key")

    client = AsyncOpenAI(api_key=api_key, base_url=mapped_llm_url)
    prompt_text = serialize_messages(request.messages)

    if request.stream:
        async def upstream_generator():
            try:
                start_time = time.time()
                stream = await client.chat.completions.create(
                    model=model_name,
                    messages=request.messages,
                    stream=True,
                    stream_options={"include_usage": True},
                )
                usage_dict = None
                time_info = None
                chat_id = None
                full_response_text = ""

                async for chunk in stream:
                    yield f"data: {chunk.model_dump_json()}\n\n"
                    if chat_id is None:
                        chat_id = chunk.id
                    if chunk.usage:
                        usage_dict = chunk.usage
                    if hasattr(chunk, "time_info") and chunk.time_info:
                        time_info = chunk.time_info
                    if chunk.choices and chunk.choices[0].delta.content:
                        full_response_text += chunk.choices[0].delta.content

                tokens_prompt = usage_dict.prompt_tokens if usage_dict else 0
                tokens_completion = usage_dict.completion_tokens if usage_dict else 0
                cost_estimate = registry.get_cost(provider, model_name, tokens_prompt, tokens_completion)

                record_success(
                    chat_id=chat_id, gateway_id=x_gateway_id, model=model_name,
                    provider=provider, request_type="streaming",
                    tokens_prompt=tokens_prompt, tokens_completion=tokens_completion,
                    cost=cost_estimate, start_time=start_time, time_info=time_info,
                    response_text=full_response_text, prompt_text=prompt_text,
                )
                yield "data: [DONE]\n\n"

            except Exception as e:
                record_error(
                    gateway_id=x_gateway_id, model=model_name, provider=provider,
                    request_type="streaming", error=e, prompt_text=prompt_text,
                )
                yield f'data: {{"error": "{e}"}}\n\n'

        return StreamingResponse(upstream_generator(), media_type="text/event-stream")

    else:
        try:
            start_time = time.time()
            upstream = await client.chat.completions.create(
                messages=request.messages,
                model=model_name,
            )
            assistant_text = upstream.choices[0].message.content

            tokens_prompt = upstream.usage.prompt_tokens
            tokens_completion = upstream.usage.completion_tokens
            cost_estimate = registry.get_cost(provider, model_name, tokens_prompt, tokens_completion)

            time_info = getattr(upstream, "time_info", None)
            record_success(
                chat_id=upstream.id, gateway_id=x_gateway_id, model=model_name,
                provider=provider, request_type="non-streaming",
                tokens_prompt=tokens_prompt, tokens_completion=tokens_completion,
                cost=cost_estimate, start_time=start_time, time_info=time_info,
                response_text=assistant_text, prompt_text=prompt_text,
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
                "usage": upstream.usage.model_dump() if hasattr(upstream, "usage") else None,
            }
        except Exception as e:
            record_error(
                gateway_id=x_gateway_id, model=model_name, provider=provider,
                request_type="non-streaming", error=e, prompt_text=prompt_text,
            )
            raise HTTPException(status_code=extract_status_code_from_error(str(e)), detail=str(e))
