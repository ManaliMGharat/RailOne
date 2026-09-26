import json
import random
from typing import Optional
from sqlalchemy.orm import Session
from app.models.all_models import Booking, PNRRecord
from app.schemas.schemas import PNRResponse, PNRPassengerStatus

def get_pnr_status(db: Session, pnr: str) -> PNRResponse:
    clean_pnr = pnr.strip()
    if not clean_pnr.isdigit() or len(clean_pnr) != 10:
        raise ValueError("PNR must be a 10-digit numeric code.")

    # 1. Check live bookings in DB
    booking = db.query(Booking).filter(Booking.pnr_number == clean_pnr).first()
    if booking:
        pax_list = []
        for i, t in enumerate(booking.tickets, start=1):
            pax_list.append(PNRPassengerStatus(
                serial_no=i,
                name=t.passenger_name,
                booking_status=f"{t.status} {t.coach} {t.berth}",
                current_status=f"{t.status} {t.coach} {t.berth}",
                coach=t.coach,
                berth=t.berth,
                berth_type=t.berth_type
            ))
        return PNRResponse(
            pnr_number=clean_pnr,
            train_number=booking.train_number,
            train_name=booking.train_name,
            source=f"{booking.source_name} ({booking.source_code})",
            destination=f"{booking.dest_name} ({booking.dest_code})",
            journey_date=booking.journey_date,
            class_type=booking.class_type,
            chart_status="Chart Prepared",
            is_demo=False,
            passengers=pax_list
        )

    # 2. Check seeded PNRRecord
    record = db.query(PNRRecord).filter(PNRRecord.pnr_number == clean_pnr).first()
    if record:
        raw_pax = json.loads(record.passengers_json)
        pax_list = [PNRPassengerStatus(**p) for p in raw_pax]
        return PNRResponse(
            pnr_number=clean_pnr,
            train_number=record.train_number,
            train_name=record.train_name,
            source=record.source,
            destination=record.destination,
            journey_date=record.journey_date,
            class_type=record.class_type,
            chart_status=record.chart_status,
            is_demo=record.is_demo,
            passengers=pax_list
        )

    # 3. Deterministic realistic Mock PNR response clearly marked as DEMO
    # Generate based on PNR number hash
    random.seed(int(clean_pnr))
    trains = [
        ("12124", "Deccan Queen Superfast", "Pune Junction (PUNE)", "Mumbai CSMT (CSMT)"),
        ("12951", "Mumbai Rajdhani Express", "Mumbai Central (MMCT)", "New Delhi (NDLS)"),
        ("12009", "Shatabdi Express", "Mumbai Central (MMCT)", "Ahmedabad Jn (ADI)"),
        ("11019", "Konark Express", "Mumbai CSMT (CSMT)", "Bhubaneswar (BBS)"),
    ]
    t_num, t_name, src, dst = random.choice(trains)
    classes = ["3A", "2A", "CC", "SL"]
    cls_choice = random.choice(classes)
    coach = f"{cls_choice[0]}{random.randint(1, 4)}" if cls_choice in ["3A", "2A"] else f"S{random.randint(1, 6)}"

    demo_passengers = [
        PNRPassengerStatus(
            serial_no=1,
            name="Manali Manish Gharat",
            booking_status=f"CNF {coach} {random.randint(12, 64)}",
            current_status=f"CNF {coach} {random.randint(12, 64)}",
            coach=coach,
            berth=f"{random.randint(12, 64)}",
            berth_type="Lower Berth"
        ),
        PNRPassengerStatus(
            serial_no=2,
            name="Manish Gharat",
            booking_status=f"CNF {coach} {random.randint(13, 65)}",
            current_status=f"CNF {coach} {random.randint(13, 65)}",
            coach=coach,
            berth=f"{random.randint(13, 65)}",
            berth_type="Middle Berth"
        )
    ]

    return PNRResponse(
        pnr_number=clean_pnr,
        train_number=t_num,
        train_name=t_name,
        source=src,
        destination=dst,
        journey_date="2026-10-15",
        class_type=cls_choice,
        chart_status="Chart Prepared",
        is_demo=True,
        passengers=demo_passengers
    )
