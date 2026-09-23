from datetime import date, datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.station import Station
from app.models.train import Train, TrainStop, SeatClass, Availability, Fare, Coach

DAY_MAP = {
    0: "MON",
    1: "TUE",
    2: "WED",
    3: "THU",
    4: "FRI",
    5: "SAT",
    6: "SUN"
}

def resolve_station_ids(db: Session, query: str) -> List[int]:
    """Resolve station input by Station Code or Station City name (metro aggregation)."""
    cleaned = query.strip().upper()
    stations = db.query(Station).filter(
        or_(
            Station.code == cleaned,
            Station.name.ilike(f"%{query.strip()}%"),
            Station.city.ilike(f"%{query.strip()}%")
        )
    ).all()
    return [s.id for s in stations]

def get_or_create_availability(db: Session, train_id: int, journey_date: date, class_id: int) -> Availability:
    avail = db.query(Availability).filter(
        Availability.train_id == train_id,
        Availability.journey_date == journey_date,
        Availability.class_id == class_id
    ).first()

    if not avail:
        # Count coach seats if coaches exist for this train & class
        coaches = db.query(Coach).filter(Coach.train_id == train_id, Coach.class_id == class_id).all()
        total_seats = sum(c.total_seats for c in coaches) if coaches else 72

        avail = Availability(
            train_id=train_id,
            journey_date=journey_date,
            class_id=class_id,
            total_seats=total_seats,
            booked_seats=0,
            available_seats=total_seats,
            rac_seats=0,
            waiting_list=0
        )
        db.add(avail)
        db.commit()
        db.refresh(avail)

    return avail

def search_trains(
    db: Session,
    from_query: str,
    to_query: str,
    journey_date: date,
    travel_class: Optional[str] = None
) -> List[dict]:
    from_ids = resolve_station_ids(db, from_query)
    to_ids = resolve_station_ids(db, to_query)

    if not from_ids or not to_ids:
        return []

    day_of_week = DAY_MAP[journey_date.weekday()]

    # Retrieve all active trains
    trains = db.query(Train).filter(Train.is_active == True).all()
    results = []

    for train in trains:
        stops = sorted(train.stops, key=lambda s: s.stop_number)
        if not stops:
            # Fallback if stops not yet populated: check direct source & destination
            if train.source_station_id in from_ids and train.destination_station_id in to_ids:
                from_stop_num = 1
                to_stop_num = 2
                dep_time = train.departure_time
                arr_time = train.arrival_time
                from_station = train.source_station
                to_station = train.destination_station
            else:
                continue
        else:
            from_stop = None
            to_stop = None

            for stop in stops:
                if stop.station_id in from_ids and from_stop is None:
                    from_stop = stop
                elif from_stop is not None and stop.station_id in to_ids:
                    to_stop = stop
                    break

            if not from_stop or not to_stop:
                continue

            from_stop_num = from_stop.stop_number
            to_stop_num = to_stop.stop_number
            dep_time = from_stop.departure_time
            arr_time = to_stop.arrival_time
            from_station = from_stop.station
            to_station = to_stop.station

        # Check running days
        runs_today = (day_of_week in train.running_days) or ("DAILY" in train.running_days)

        # Get classes and calculate availability & fare
        all_classes = db.query(SeatClass).all()
        class_list = []
        min_fare = float("inf")

        for sc in all_classes:
            if travel_class and travel_class != "ALL" and sc.code != travel_class:
                continue

            avail = get_or_create_availability(db, train.id, journey_date, sc.id)

            # Determine fare
            fare_rec = db.query(Fare).filter(
                Fare.train_id == train.id,
                Fare.class_id == sc.id
            ).first()

            if fare_rec:
                fare_amount = fare_rec.total_fare
            else:
                # Default pricing base per class
                base_mult = {"1A": 2200, "2A": 1400, "3A": 950, "CC": 650, "SL": 380, "2S": 180}.get(sc.code, 400)
                fare_amount = float(base_mult)

            if fare_amount < min_fare:
                min_fare = fare_amount

            if avail.available_seats > 0:
                status_label = f"AVAILABLE {avail.available_seats}"
            elif avail.rac_seats < 10:
                status_label = f"RAC {avail.rac_seats + 1}"
            else:
                status_label = f"WL {avail.waiting_list + 1}"

            class_list.append({
                "class_code": sc.code,
                "class_name": sc.name,
                "total_seats": avail.total_seats,
                "available_seats": avail.available_seats,
                "booked_seats": avail.booked_seats,
                "rac_seats": avail.rac_seats,
                "waiting_list": avail.waiting_list,
                "status_label": status_label,
                "base_fare": round(fare_amount * 0.85, 2),
                "total_fare": round(fare_amount, 2)
            })

        if not class_list:
            continue

        results.append({
            "id": train.id,
            "number": train.number,
            "name": train.name,
            "train_type": train.train_type,
            "from_station_code": from_station.code,
            "from_station_name": from_station.name,
            "to_station_code": to_station.code,
            "to_station_name": to_station.name,
            "departure_time": dep_time,
            "arrival_time": arr_time,
            "duration": train.duration,
            "running_days": [d.strip() for d in train.running_days.split(",")],
            "runs_on_requested_date": runs_today,
            "classes": class_list,
            "min_fare": min_fare if min_fare != float("inf") else 350.0
        })

    return results
