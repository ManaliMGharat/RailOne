from fastapi import APIRouter
from app.schemas.schemas import CoachPositionResponse
from app.services.coach_service import get_coach_position

router = APIRouter(prefix="/coaches", tags=["Coach Position"])

@router.get("/{train_number}", response_model=CoachPositionResponse)
def coach_position(train_number: str):
    return get_coach_position(train_number)
