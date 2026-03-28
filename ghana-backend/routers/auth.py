from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
import os

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class SignupRequest(BaseModel):
    fullName: str
    email: str
    company: str = ""
    awsAccountId: str = ""
    password: str

USERS = [
    {"id": 1, "username": "Quidditch", 
     "password": "Team", "name": "Ghana Admin",
     "email": "admin@ghana.ai"}
]

def create_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(
        hours=int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", 24))
    )
    return jwt.encode(
        {**data, "exp": expire},
        os.getenv("SECRET_KEY", "ghana_jwt_secret_2026"),
        algorithm=os.getenv("ALGORITHM", "HS256")
    )

@router.post("/login")
async def login(req: LoginRequest):
    user = next(
        (u for u in USERS 
         if u["username"] == req.username 
         and u["password"] == req.password), None
    )
    if not user:
        raise HTTPException(status_code=401, 
                            detail="Invalid credentials")
    token = create_token({"id": user["id"], "name": user["name"]})
    return {"token": token, "name": user["name"], 
            "email": user["email"]}

@router.post("/signup")
async def signup(req: SignupRequest):
    token = create_token({"name": req.fullName, "email": req.email})
    return {"token": token, "name": req.fullName, 
            "email": req.email}
