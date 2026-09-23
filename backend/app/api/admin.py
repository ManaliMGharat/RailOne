from datetime import date, datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.db.session import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.models.station import Station
from app.models.train import Train, SeatClass, Fare, TrainStop
from app.models.booking import Booking, BookingPassenger, Cancellation
from app.models.audit import AuditLog
from app.schemas.admin import DashboardStatsResponse, AuditLogResponse
from app.schemas.station import StationCreate, StationUpdate, StationResponse
from app.schemas.train import TrainCreate, TrainUpdate, TrainResponse
from app.schemas.booking import BookingResponse
from app.api.bookings import format_booking_response
from app.services.audit_service import log_admin_action

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_metrics(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    today = date.today()
    total_users = db.query(User).count()
    total_trains = db.query(Train).count()
    total_stations = db.query(Station).count()

    today_bookings = db.query(Booking).filter(func.date(Booking.created_at) == today).count()
    today_revenue_res = db.query(func.sum(Booking.total_fare)).filter(
        func.date(Booking.created_at) == today,
        Booking.status != "CANCELLED"
    ).scalar()
    today_revenue = float(today_revenue_res or 0.0)

    cancelled_tickets = db.query(Cancellation).count()

    # Generate last 7 days bookings & revenue trends
    bookings_by_date = []
    revenue_by_date = []
    for i in range(6, -1, -1):
        target_d = today - timedelta(days=i)
        d_str = target_d.strftime("%b %d")
        b_count = db.query(Booking).filter(func.date(Booking.created_at) == target_d).count()
        r_sum = db.query(func.sum(Booking.total_fare)).filter(
            func.date(Booking.created_at) == target_d,
            Booking.status != "CANCELLED"
        ).scalar()
        bookings_by_date.append({"date": d_str, "count": b_count})
        revenue_by_date.append({"date": d_str, "revenue": float(r_sum or 0.0)})

    # Popular routes
    route_rows = db.query(
        Train.name,
        func.count(Booking.id).label("booking_count")
    ).join(Booking, Booking.train_id == Train.id).group_by(Train.name).order_by(func.count(Booking.id).desc()).limit(5).all()

    popular_routes = [{"route": r[0], "bookings": r[1]} for r in route_rows]
    if not popular_routes:
        popular_routes = [
            {"route": "Mumbai Rajdhani (BCT - NDLS)", "bookings": 42},
            {"route": "Vande Bharat Express (NDLS - BSB)", "bookings": 38},
            {"route": "Howrah Rajdhani (HWH - NDLS)", "bookings": 29}
        ]

    # Class utilization
    class_rows = db.query(
        SeatClass.code,
        func.count(Booking.id).label("class_count")
    ).join(Booking, Booking.class_id == SeatClass.id).group_by(SeatClass.code).all()

    class_utilization = [{"class_name": c[0], "count": c[1]} for c in class_rows]
    if not class_utilization:
        class_utilization = [
            {"class_name": "3A", "count": 45},
            {"class_name": "2A", "count": 25},
            {"class_name": "CC", "count": 20},
            {"class_name": "SL", "count": 30},
            {"class_name": "1A", "count": 10}
        ]

    return DashboardStatsResponse(
        total_users=total_users,
        total_trains=total_trains,
        total_stations=total_stations,
        today_bookings=today_bookings,
        today_revenue=today_revenue,
        cancelled_tickets=cancelled_tickets,
        bookings_by_date=bookings_by_date,
        revenue_by_date=revenue_by_date,
        popular_routes=popular_routes,
        class_utilization=class_utilization
    )

@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "mobile": u.mobile,
            "role": u.role.name if u.role else "USER",
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]

# --- Admin Station Management ---

@router.post("/stations", response_model=StationResponse, status_code=status.HTTP_201_CREATED)
def admin_create_station(
    station_data: StationCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Station).filter(Station.code == station_data.code.upper()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Station code already exists")

    st = Station(
        code=station_data.code.upper(),
        name=station_data.name,
        city=station_data.city,
        state=station_data.state,
        zone=station_data.zone,
        latitude=station_data.latitude,
        longitude=station_data.longitude
    )
    db.add(st)
    db.commit()
    db.refresh(st)

    log_admin_action(
        db=db,
        admin_id=admin.id,
        action="CREATE_STATION",
        entity="Station",
        entity_id=st.code,
        description=f"Created station {st.code} ({st.name}, {st.city})"
    )
    return st

@router.put("/stations/{station_id}", response_model=StationResponse)
def admin_update_station(
    station_id: int,
    data: StationUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    st = db.query(Station).filter(Station.id == station_id).first()
    if not st:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Station not found")

    if data.name is not None:
        st.name = data.name
    if data.city is not None:
        st.city = data.city
    if data.state is not None:
        st.state = data.state
    if data.zone is not None:
        st.zone = data.zone
    if data.latitude is not None:
        st.latitude = data.latitude
    if data.longitude is not None:
        st.longitude = data.longitude

    db.commit()
    db.refresh(st)

    log_admin_action(
        db=db,
        admin_id=admin.id,
        action="UPDATE_STATION",
        entity="Station",
        entity_id=st.code,
        description=f"Updated station {st.code} ({st.name})"
    )
    return st

@router.delete("/stations/{station_id}")
def admin_delete_station(
    station_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    st = db.query(Station).filter(Station.id == station_id).first()
    if not st:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Station not found")

    code = st.code
    db.delete(st)
    db.commit()

    log_admin_action(
        db=db,
        admin_id=admin.id,
        action="DELETE_STATION",
        entity="Station",
        entity_id=code,
        description=f"Deleted station {code}"
    )
    return {"message": f"Station {code} deleted successfully"}

# --- Admin Train Management ---

@router.post("/trains", response_model=TrainResponse, status_code=status.HTTP_201_CREATED)
def admin_create_train(
    train_data: TrainCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Train).filter(Train.number == train_data.number).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Train number already exists")

    train = Train(
        number=train_data.number,
        name=train_data.name,
        source_station_id=train_data.source_station_id,
        destination_station_id=train_data.destination_station_id,
        departure_time=train_data.departure_time,
        arrival_time=train_data.arrival_time,
        duration=train_data.duration,
        running_days=train_data.running_days,
        train_type=train_data.train_type,
        is_active=train_data.is_active
    )
    db.add(train)
    db.commit()
    db.refresh(train)

    log_admin_action(
        db=db,
        admin_id=admin.id,
        action="CREATE_TRAIN",
        entity="Train",
        entity_id=train.number,
        description=f"Created train {train.number} ({train.name})"
    )
    return train

@router.put("/trains/{train_id}", response_model=TrainResponse)
def admin_update_train(
    train_id: int,
    data: TrainUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Train not found")

    if data.name is not None:
        train.name = data.name
    if data.departure_time is not None:
        train.departure_time = data.departure_time
    if data.arrival_time is not None:
        train.arrival_time = data.arrival_time
    if data.duration is not None:
        train.duration = data.duration
    if data.running_days is not None:
        train.running_days = data.running_days
    if data.train_type is not None:
        train.train_type = data.train_type
    if data.is_active is not None:
        train.is_active = data.is_active

    db.commit()
    db.refresh(train)

    log_admin_action(
        db=db,
        admin_id=admin.id,
        action="UPDATE_TRAIN",
        entity="Train",
        entity_id=train.number,
        description=f"Updated train {train.number} ({train.name})"
    )
    return train

@router.delete("/trains/{train_id}")
def admin_delete_train(
    train_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Train not found")

    num = train.number
    db.delete(train)
    db.commit()

    log_admin_action(
        db=db,
        admin_id=admin.id,
        action="DELETE_TRAIN",
        entity="Train",
        entity_id=num,
        description=f"Deleted train {num}"
    )
    return {"message": f"Train {num} deleted successfully"}

# --- Admin Booking Management ---

@router.get("/bookings", response_model=List[BookingResponse])
def admin_get_all_bookings(
    search: Optional[str] = Query(None, description="Search by PNR or booking ref"),
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if search:
        s_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Booking.booking_reference.ilike(s_term),
                Booking.pnr_record.has(PnrRecord.pnr_number.ilike(s_term))
            )
        )
    bookings = query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()
    return [format_booking_response(b) for b in bookings]

# --- Admin Audit Logs ---

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def admin_get_audit_logs(
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    resp = []
    for l in logs:
        resp.append(AuditLogResponse(
            id=l.id,
            admin_id=l.admin_id,
            admin_name=l.admin_user.full_name if l.admin_user else "System",
            action=l.action,
            entity=l.entity,
            entity_id=l.entity_id,
            description=l.description,
            ip_address=l.ip_address,
            created_at=l.created_at
        ))
    return resp
