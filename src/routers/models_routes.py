from fastapi import APIRouter, Query

from model_registry import registry

router = APIRouter()


@router.get("/v1/models")
async def list_models():
    return {
        "object": "list",
        "data": [
            {"id": model_id, "object": "model", "owned_by": provider_id}
            for model_id, provider_id in registry.model_to_provider.items()
        ],
    }


@router.get("/models/list")
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
