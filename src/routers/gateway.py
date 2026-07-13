from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException

from db import get_db, Gateway, User
from models import GatewayCreate
from utils import get_current_user

router = APIRouter(prefix="/gateway")


@router.post("/create")
async def create_gateway(body: GatewayCreate, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    gateway_id = str(uuid4())
    secret = str(uuid4())

    gw = Gateway(id=gateway_id, name=body.name, secret_key=secret, user_id=current_user.id)
    db.add(gw)
    db.commit()

    return {"gateway_id": gateway_id, "secret": secret}


@router.get("/list")
async def list_gateways(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    gateways = db.query(Gateway).filter(Gateway.user_id == current_user.id).all()
    return {
        "gateways": [
            {
                "id": gw.id,
                "name": gw.name,
                "created_at": gw.created_at.isoformat() if gw.created_at else None,
            }
            for gw in gateways
        ]
    }


@router.get("/{gateway_id}/credentials")
async def get_gateway_credentials(gateway_id: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    gateway = db.query(Gateway).filter(
        Gateway.id == gateway_id,
        Gateway.user_id == current_user.id,
    ).first()

    if not gateway:
        raise HTTPException(status_code=404, detail="Gateway not found")

    return {"gateway_id": gateway.id, "name": gateway.name, "secret": gateway.secret_key}


@router.post("/{gateway_id}/regenerate")
async def regenerate_gateway_secret(gateway_id: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    gateway = db.query(Gateway).filter(
        Gateway.id == gateway_id,
        Gateway.user_id == current_user.id,
    ).first()

    if not gateway:
        raise HTTPException(status_code=404, detail="Gateway not found")

    new_secret = str(uuid4())
    gateway.secret_key = new_secret
    db.commit()

    return {"gateway_id": gateway.id, "name": gateway.name, "secret": new_secret}
