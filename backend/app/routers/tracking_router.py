from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import TrainTrackingResponse
from app.services.tracking_service import track_train

router = APIRouter(prefix="/tracking", tags=["Train Tracking"])

@router.get("/{train_query}", response_model=TrainTrackingResponse)
def get_live_tracking(train_query: str, db: Session = Depends(get_db)):
    return track_train(db, train_query)
