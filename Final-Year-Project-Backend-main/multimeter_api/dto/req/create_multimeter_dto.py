from pydantic import BaseModel, Field, StrictStr
from typing import Optional
from datetime import datetime

class CreateMultimeterDTO(BaseModel):
    model: StrictStr
    description: StrictStr
    photo: StrictStr
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)
    com_protocol: StrictStr
    com_configure: object
    created_by: StrictStr