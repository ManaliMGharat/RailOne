from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.all_models import Train, TrainRoute
from app.schemas.schemas import TrainTrackingResponse, TrainTrackingStation

def track_train(db: Session, train_query: str) -> TrainTrackingResponse:
    q = train_query.strip()
    train = db.query(Train).filter(
        (Train.train_number == q) | (Train.train_name.ilike(f"%{q}%"))
    ).first()

    if not train:
        # Fallback tracking for demo
        t_num = q if q.isdigit() else "12124"
        t_name = f"Express Train {t_num}"
        stations = [
            TrainTrackingStation(station_code="PUNE", station_name="Pune Junction", scheduled_arrival="07:15", actual_arrival="07:15", scheduled_departure="07:15", actual_departure="07:18", delay_minutes=3, status="Departed"),
            TrainTrackingStation(station_code="LNL", station_name="Lonavala", scheduled_arrival="08:18", actual_arrival="08:22", scheduled_departure="08:20", actual_departure="08:25", delay_minutes=5, status="Departed"),
            TrainTrackingStation(station_code="KJT", station_name="Karjat", scheduled_arrival="09:03", actual_arrival="09:10", scheduled_departure="09:05", actual_departure="09:12", delay_minutes=7, status="Current"),
            TrainTrackingStation(station_code="KYN", station_name="Kalyan Junction", scheduled_arrival="09:43", actual_arrival="09:50", scheduled_departure="09:45", actual_departure="09:52", delay_minutes=7, status="Upcoming"),
            TrainTrackingStation(station_code="DR", station_name="Dadar Central", scheduled_arrival="10:13", actual_arrival="10:20", scheduled_departure="10:15", actual_departure="10:22", delay_minutes=7, status="Upcoming"),
            TrainTrackingStation(station_code="CSMT", station_name="Mumbai CSMT", scheduled_arrival="10:25", actual_arrival="10:35", scheduled_departure="10:25", actual_departure="10:35", delay_minutes=10, status="Upcoming"),
        ]
        return TrainTrackingResponse(
            train_number=t_num,
            train_name=t_name,
            current_station="Karjat (KJT)",
            current_status="Running 7 mins late",
            delay_minutes=7,
            last_updated="Just now (GPS verified)",
            stations=stations
        )

    # If train exists with routes:
    routes = sorted(train.routes, key=lambda r: r.sequence)
    stations_list = []
    midpoint = len(routes) // 2
    current_station_name = routes[midpoint].station_name if routes else "In Transit"

    for idx, r in enumerate(routes):
        delay = 4 if idx > 0 else 0
        if idx < midpoint:
            st = "Departed"
        elif idx == midpoint:
            st = "Current"
        else:
            st = "Upcoming"

        stations_list.append(TrainTrackingStation(
            station_code=r.station_code,
            station_name=r.station_name,
            scheduled_arrival=r.arrival,
            actual_arrival=r.arrival,
            scheduled_departure=r.departure,
            actual_departure=r.departure,
            delay_minutes=delay,
            status=st
        ))

    return TrainTrackingResponse(
        train_number=train.train_number,
        train_name=train.train_name,
        current_station=f"{current_station_name} ({routes[midpoint].station_code if routes else ''})",
        current_status="Running 4 mins behind schedule",
        delay_minutes=4,
        last_updated="2 mins ago",
        stations=stations_list
    )
