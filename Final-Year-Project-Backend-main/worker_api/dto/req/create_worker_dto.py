from pydantic import BaseModel, Field, StrictStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    admin = "admin"
    worker = "worker"


class RefreshToken(BaseModel):
    token: Optional[StrictStr] = Field(default="")
    expires_at: Optional[datetime] = Field(default_factory=datetime.utcnow)  # Fix here


class CreateWorkerDTO(BaseModel):
    name: StrictStr
    reg_no: StrictStr
    password: StrictStr
    photo: StrictStr
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    user_role: UserRole = Field(default=UserRole.worker)
    refresh_token: RefreshToken = Field(default_factory=RefreshToken)
    email: Optional[StrictStr] = Field(default="")
