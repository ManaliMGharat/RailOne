import math
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.all_models import Station
from app.schemas.schemas import FareCalculationResponse, FareOption

# Haversine distance formula in KM between two lat/lon
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

# Fare configuration per KM for different classes
CLASS_RATES = {
    "1A": {"rate_per_km": 3.6, "min_fare": 550, "name": "AC First Class (1A)"},
    "2A": {"rate_per_km": 2.2, "min_fare": 350, "name": "AC 2 Tier (2A)"},
    "3A": {"rate_per_km": 1.5, "min_fare": 250, "name": "AC 3 Tier (3A)"},
    "3E": {"rate_per_km": 1.3, "min_fare": 220, "name": "AC 3 Economy (3E)"},
    "CC": {"rate_per_km": 1.2, "min_fare": 180, "name": "AC Chair Car (CC)"},
    "EC": {"rate_per_km": 2.5, "min_fare": 450, "name": "Executive Chair Car (EC)"},
    "SL": {"rate_per_km": 0.65, "min_fare": 120, "name": "Sleeper Class (SL)"},
    "2S": {"rate_per_km": 0.40, "min_fare": 60, "name": "Second Sitting (2S)"},
}

def calculate_fare(
    db: Session,
    source_code: str,
    dest_code: str,
    class_type: str = "ALL",
    journey_type: str = "reserved",
    passenger_count: int = 1,
    duration_type: str = "Monthly"
) -> FareCalculationResponse:
    source_code = source_code.upper().strip()
    dest_code = dest_code.upper().strip()

    if source_code == dest_code:
        raise ValueError("Source and destination stations cannot be the same.")

    source_station = db.query(Station).filter(Station.station_code == source_code).first()
    dest_station = db.query(Station).filter(Station.station_code == dest_code).first()

    src_name = source_station.station_name if source_station else source_code
    dst_name = dest_station.station_name if dest_station else dest_code

    # Calculate distance
    distance_km = 120.0 # fallback standard distance
    if source_station and dest_station and source_station.latitude and dest_station.latitude:
        distance_km = haversine_distance(
            source_station.latitude, source_station.longitude,
            dest_station.latitude, dest_station.longitude
        )
        if distance_km < 5:
            distance_km = 10.0
    elif source_station and dest_station and source_station.suburban_sequence and dest_station.suburban_sequence:
        # Suburban sequence approx 2.5 km per station
        seq_diff = abs(source_station.suburban_sequence - dest_station.suburban_sequence)
        distance_km = max(5.0, round(seq_diff * 2.5, 1))

    fare_options: List[FareOption] = []

    if journey_type == "platform":
        fare_per_person = 15.0
        fare_options.append(FareOption(
            class_code="PLATFORM",
            class_name="Platform Ticket (Valid 2 hrs)",
            fare_per_passenger=fare_per_person,
            total_fare=round(fare_per_person * passenger_count, 2),
            distance_km=0.0
        ))

    elif journey_type == "unreserved":
        # Suburban / UTS fare rules
        # II (Second Class Ordinary)
        ii_fare = 5.0
        if distance_km > 10:
            ii_fare = 10.0
        if distance_km > 25:
            ii_fare = 15.0
        if distance_km > 50:
            ii_fare = 20.0
        if distance_km > 75:
            ii_fare = 25.0
        if distance_km > 100:
            ii_fare = round(distance_km * 0.35, 0)

        # FC (First Class Suburban)
        fc_fare = max(50.0, round(ii_fare * 6.5, 0))

        fare_options.append(FareOption(
            class_code="II",
            class_name="Second Class (Ordinary)",
            fare_per_passenger=float(ii_fare),
            total_fare=round(ii_fare * passenger_count, 2),
            distance_km=distance_km
        ))
        fare_options.append(FareOption(
            class_code="FC",
            class_name="First Class (Suburban)",
            fare_per_passenger=float(fc_fare),
            total_fare=round(fc_fare * passenger_count, 2),
            distance_km=distance_km
        ))

    elif journey_type == "season":
        # Season ticket multiplier
        base_single = 10.0
        if distance_km > 15:
            base_single = 15.0
        if distance_km > 40:
            base_single = 25.0
        if distance_km > 70:
            base_single = 35.0

        multiplier = 20.0 # Monthly
        if duration_type == "Quarterly":
            multiplier = 54.0
        elif duration_type == "Half-Yearly":
            multiplier = 105.0
        elif duration_type == "Yearly":
            multiplier = 200.0

        ii_season = round(base_single * multiplier, 0)
        fc_season = round(base_single * 5.0 * multiplier, 0)

        fare_options.append(FareOption(
            class_code="II_SEASON",
            class_name=f"Second Class ({duration_type})",
            fare_per_passenger=float(ii_season),
            total_fare=round(ii_season * passenger_count, 2),
            distance_km=distance_km
        ))
        fare_options.append(FareOption(
            class_code="FC_SEASON",
            class_name=f"First Class ({duration_type})",
            fare_per_passenger=float(fc_season),
            total_fare=round(fc_season * passenger_count, 2),
            distance_km=distance_km
        ))

    else: # Reserved
        classes_to_calc = [class_type] if class_type != "ALL" and class_type in CLASS_RATES else list(CLASS_RATES.keys())
        for code in classes_to_calc:
            if code not in CLASS_RATES:
                continue
            cfg = CLASS_RATES[code]
            raw_fare = distance_km * cfg["rate_per_km"]
            per_pax = max(cfg["min_fare"], round(raw_fare / 5) * 5) # Rounded to nearest 5
            fare_options.append(FareOption(
                class_code=code,
                class_name=cfg["name"],
                fare_per_passenger=float(per_pax),
                total_fare=round(per_pax * passenger_count, 2),
                distance_km=distance_km
            ))

    return FareCalculationResponse(
        source_code=source_code,
        source_name=src_name,
        dest_code=dest_code,
        dest_name=dst_name,
        distance_km=distance_km,
        passenger_count=passenger_count,
        journey_type=journey_type,
        fare_options=fare_options
    )
