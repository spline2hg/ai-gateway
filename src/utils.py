from fastapi import Depends, HTTPException
from db import Gateway, get_db
from cachetools import TTLCache
import hashlib
import json
import random
import re
from typing import Optional
from fastapi import Header
from db import User
from dotenv import load_dotenv

load_dotenv()


def validate_gateway(gateway_id, auth, db):
    gw = db.query(Gateway).filter(Gateway.id == gateway_id).first()
    if not gw:
        return None

    if gw.secret_key != auth:
        return None

    return gw

def extract_status_code_from_error(error_msg):
    match = re.search(r'Error code:\s*(\d+)', str(error_msg))
    if match:
        return int(match.group(1))

    json_match = re.search(r'"code":\s*["\']?(\d{3})["\']?', str(error_msg))
    if json_match:
        return int(json_match.group(1))

    return 500


analytics_cache = TTLCache(maxsize=256, ttl=15)


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
