from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import PNRResponse
from app.services.pnr_service import get_pnr_status

router = APIRouter(prefix="/pnr", tags=["PNR Status"])

@router.get("/{pnr_number}", response_model=PNRResponse)
def check_pnr_status(pnr_number: str, db: Session = Depends(get_db)):
    try:
        return get_pnr_status(db, pnr_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
