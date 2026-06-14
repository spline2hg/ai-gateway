import json
import os
from pathlib import Path
from fastapi import HTTPException

DATA_DIR = Path(__file__).parent.parent / "data"
PROVIDERS_FILE = DATA_DIR / "providers.json"
MODELS_FILE = DATA_DIR / "models.json"


class ModelRegistry:
    def __init__(self):
        self.providers: dict = {}
        self.model_to_provider: dict = {}
        self.model_cost: dict = {}

    def initialize(self):
        with open(PROVIDERS_FILE) as f:
            self.providers = json.load(f)

        with open(MODELS_FILE) as f:
            models = json.load(f)

        self.model_to_provider = {}
        self.model_cost = {}
        for model_id, data in models.items():
            self.model_to_provider[model_id] = data["provider"]
            if data.get("cost"):
                self.model_cost[model_id] = data["cost"]

        print(f"Registry ready: {len(self.providers)} providers, {len(self.model_to_provider)} models, {len(self.model_cost)} priced")

    def resolve_route(self, model_name: str):
        if model_name == "free":
            api_key = os.getenv("FREE_MODEL_API_KEY")
            return "gemini-2.5-flash", "google", "https://generativelanguage.googleapis.com/v1beta/openai/", api_key

        if "/" in model_name:
            provider_id, model_id = model_name.split("/", 1)
        else:
            provider_id = self.model_to_provider.get(model_name)
            model_id = model_name
            if not provider_id:
                raise HTTPException(400, f"Unknown model: {model_name}. Use provider/model format (e.g., openai/gpt-4o)")

        base_url = self.providers.get(provider_id)
        if not base_url:
            raise HTTPException(400, f"Provider not available: {provider_id}")

        return model_id, provider_id, base_url, None

    def get_cost(self, provider_id: str, model_id: str, prompt_tokens: int, completion_tokens: int) -> float:
        cost = self.model_cost.get(model_id)
        if not cost:
            return 0.0

        input_rate = cost.get("input", 0)
        output_rate = cost.get("output", 0)

        input_cost = (prompt_tokens / 1_000_000) * input_rate
        output_cost = (completion_tokens / 1_000_000) * output_rate

        return input_cost + output_cost


registry = ModelRegistry()
