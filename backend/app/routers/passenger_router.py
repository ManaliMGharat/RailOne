from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import User, Passenger
from app.auth.security import get_current_user
from pydantic import BaseModel, Field, ConfigDict

router = APIRouter(prefix="/passengers", tags=["Passenger Management"])

class PassengerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    berth_preference: str = "No Preference"
    id_type: str = "Aadhaar"
    id_number_masked: str = ""

class PassengerOut(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    berth_preference: str
    id_type: str
    id_number_masked: str

    model_config = ConfigDict(from_attributes=True)

@router.get("", response_model=List[PassengerOut])
def get_passengers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Passenger).filter(Passenger.user_id == current_user.id).all()

@router.post("", response_model=PassengerOut)
def add_passenger(req: PassengerCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = Passenger(
        user_id=current_user.id,
        name=req.name.strip(),
        age=req.age,
        gender=req.gender,
        berth_preference=req.berth_preference,
        id_type=req.id_type,
        id_number_masked=req.id_number_masked.strip()
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.delete("/{passenger_id}")
def delete_passenger(passenger_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(Passenger).filter(Passenger.id == passenger_id, Passenger.user_id == current_user.id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Passenger not found.")
    db.delete(p)
    db.commit()
    return {"status": "success", "message": "Passenger removed."}
