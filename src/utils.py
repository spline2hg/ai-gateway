from sqlalchemy.event import api
from routing import MODEL_TO_PROVIDER, PROVIDER_TO_BASEURL
from fastapi import Depends, HTTPException
from db import Gateway, get_db
from routing import MODEL_COST
from cachetools import TTLCache
import hashlib
import json
import os
import random
from typing import Optional
from fastapi import Header
from db import User
from dotenv import load_dotenv

load_dotenv()


def resolve_route(model_name: str):
    print(model_name)
    
    if model_name ==  "free":
        api_key = os.getenv("FREE_MODEL_API_KEY")
        return "gemini-2.5-flash", "playground", "https://generativelanguage.googleapis.com/v1beta/openai/", api_key
        
    if "/" in model_name:
        provider, model_name = model_name.split("/", 1)
    else:
        provider = MODEL_TO_PROVIDER.get(model_name)
        
    if not provider:
        raise HTTPException(400, "Provider must be specified for unknown model")

    if provider not in PROVIDER_TO_BASEURL:
        raise HTTPException(400, f"Provider not available: {provider}")
        
    base_url = PROVIDER_TO_BASEURL.get(provider)
    if not base_url:
        raise HTTPException(500, f"No base URL configured for provider {provider}")
    return model_name, provider, base_url, None
    
    
def validate_gateway(gateway_id, auth, db):
    gw = db.query(Gateway).filter(Gateway.id == gateway_id).first()
    if not gw:
        return None

    if gw.secret_key != auth:
        return None

    return gw

def extract_status_code_from_error(error_msg):
    """Extract HTTP status code from error message string"""
    import re
    # Pattern to match "Error code: 401" or similar
    match = re.search(r'Error code:\s*(\d+)', str(error_msg))
    if match:
        return int(match.group(1))

    # Pattern to match status codes at end of JSON-like error
    json_match = re.search(r'"code":\s*["\']?(\d{3})["\']?', str(error_msg))
    if json_match:
        return int(json_match.group(1))

    # Return 500 if no status code found
    return 500
    
def get_cost(
    model_name:str, 
    provider_name:str,
    prompt_tokens: int, 
    completion_tokens: int
):
    dict_key_name = f"{provider_name}:{model_name}"
    
    
    model_data = MODEL_COST.get(dict_key_name)
    print(model_data)
    print("**********")
    if not model_data:
        return 0.0
    
    input_cost = (prompt_tokens / 1_000_000) * model_data["input_per_million"]
    output_cost = (completion_tokens / 1_000_000) * model_data["output_per_million"]

    return input_cost + output_cost





analytics_cache = TTLCache(maxsize=256, ttl=15)  # 30 seconds


def make_cache_key(gateway_id: str, days: int, include_logs: bool):
    raw = json.dumps(
        {"gateway_id": gateway_id, "days": days, "include_logs": include_logs},
        sort_keys=True
    )
    return hashlib.sha256(raw.encode()).hexdigest()



# Group 1: adjectives + colors
group1 = ["Brave", "Sneaky", "Gentle", "Fierce", "Curious", "Misty", "Electric",
          "Crimson", "Azure", "Golden", "Emerald", "Silver", "Violet", "Orange"]

# Group 2: animals + objects
group2 = ["Fox", "Penguin", "Elephant", "Tiger", "Otter", "Wolf", "Hawk",
          "Comet", "Wave", "Clock", "Star", "Leaf", "Stone", "Flame"]

def generate_username():
    first = random.choice(group1)
    second = random.choice(group2)
    return f"{first}_{second}"
    
    
async def get_current_user(x_user_id: Optional[str] = Header(None, alias="x-user-id"), db=Depends(get_db)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-ID header required")

    user = db.query(User).filter(User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user ID")

    return user