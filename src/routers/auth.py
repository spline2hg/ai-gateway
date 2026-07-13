import uuid

from fastapi import APIRouter, Depends

from db import get_db, User
from utils import generate_username

router = APIRouter(prefix="/auth")


@router.post("/join")
def join(db=Depends(get_db)):
    user_id = str(uuid.uuid4())
    username = generate_username()

    while db.query(User).filter(User.username == username).first():
        username = generate_username()

    user = User(id=user_id, username=username)
    db.add(user)
    db.commit()

    return {"id": user_id, "username": username}
