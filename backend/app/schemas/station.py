from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class StationBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=10)
    name: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    zone: Optional[str] = "CR"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class StationCreate(StationBase):
    pass

class StationUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class StationResponse(StationBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
