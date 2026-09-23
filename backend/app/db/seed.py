from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import Role, User, Notification
from app.models.station import Station
from app.models.train import SeatClass, Train, TrainRoute, TrainStop, Coach, Seat, Fare, Availability
from app.models.booking import Booking, Passenger, BookingPassenger, Payment, PnrRecord, Ticket

STATIONS_DATA = [
    {"code": "CSMT", "name": "Chhatrapati Shivaji Maharaj Terminus", "city": "Mumbai", "state": "Maharashtra", "zone": "CR"},
    {"code": "BCT", "name": "Mumbai Central", "city": "Mumbai", "state": "Maharashtra", "zone": "WR"},
    {"code": "LTT", "name": "Lokmanya Tilak Terminus", "city": "Mumbai", "state": "Maharashtra", "zone": "CR"},
    {"code": "NDLS", "name": "New Delhi", "city": "Delhi", "state": "Delhi", "zone": "NR"},
    {"code": "NZM", "name": "Hazrat Nizamuddin", "city": "Delhi", "state": "Delhi", "zone": "NR"},
    {"code": "ANVT", "name": "Anand Vihar Terminal", "city": "Delhi", "state": "Delhi", "zone": "NR"},
    {"code": "HWH", "name": "Howrah Junction", "city": "Kolkata", "state": "West Bengal", "zone": "ER"},
    {"code": "MAS", "name": "MGR Chennai Central", "city": "Chennai", "state": "Tamil Nadu", "zone": "SR"},
    {"code": "SBC", "name": "KSR Bengaluru City", "city": "Bengaluru", "state": "Karnataka", "zone": "SWR"},
    {"code": "ADI", "name": "Ahmedabad Junction", "city": "Ahmedabad", "state": "Gujarat", "zone": "WR"},
    {"code": "PUNE", "name": "Pune Junction", "city": "Pune", "state": "Maharashtra", "zone": "CR"},
    {"code": "BSB", "name": "Varanasi Junction", "city": "Varanasi", "state": "Uttar Pradesh", "zone": "NR"},
    {"code": "PNBE", "name": "Patna Junction", "city": "Patna", "state": "Bihar", "zone": "ECR"},
    {"code": "JP", "name": "Jaipur Junction", "city": "Jaipur", "state": "Rajasthan", "zone": "NWR"},
    {"code": "LKO", "name": "Lucknow Charbagh", "city": "Lucknow", "state": "Uttar Pradesh", "zone": "NR"},
    {"code": "CNB", "name": "Kanpur Central", "city": "Kanpur", "state": "Uttar Pradesh", "zone": "NCR"},
    {"code": "AGC", "name": "Agra Cantt", "city": "Agra", "state": "Uttar Pradesh", "zone": "NCR"},
    {"code": "BPL", "name": "Bhopal Junction", "city": "Bhopal", "state": "Madhya Pradesh", "zone": "WCR"},
    {"code": "NGP", "name": "Nagpur Junction", "city": "Nagpur", "state": "Maharashtra", "zone": "CR"},
    {"code": "HYB", "name": "Hyderabad Deccan", "city": "Hyderabad", "state": "Telangana", "zone": "SCR"},
    {"code": "GHY", "name": "Guwahati", "city": "Guwahati", "state": "Assam", "zone": "NFR"},
    {"code": "TVC", "name": "Thiruvananthapuram Central", "city": "Thiruvananthapuram", "state": "Kerala", "zone": "SR"},
    {"code": "BBS", "name": "Bhubaneswar", "city": "Bhubaneswar", "state": "Odisha", "zone": "ECoR"},
    {"code": "CDG", "name": "Chandigarh Junction", "city": "Chandigarh", "state": "Punjab/Haryana", "zone": "NR"}
]

CLASSES_DATA = [
    {"code": "1A", "name": "First AC", "description": "Air-conditioned luxury with private coupe / cabin lockable doors"},
    {"code": "2A", "name": "AC 2 Tier", "description": "Air-conditioned 2-tier berths with reading lamps and privacy curtains"},
    {"code": "3A", "name": "AC 3 Tier", "description": "Air-conditioned 3-tier berths with clean linen provided"},
    {"code": "CC", "name": "AC Chair Car", "description": "Air-conditioned push-back comfortable seating for daytime intercity trains"},
    {"code": "SL", "name": "Sleeper Class", "description": "Classic non-air-conditioned open berths for long distance travel"},
    {"code": "2S", "name": "Second Sitting", "description": "Reserved cushioned non-AC seats for budget daytime travel"}
]

def seed_database(db: Session):
    # 1. Seed Roles
    admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
    if not admin_role:
        admin_role = Role(name="ADMIN", description="Administrator with full platform access")
        db.add(admin_role)

    user_role = db.query(Role).filter(Role.name == "USER").first()
    if not user_role:
        user_role = Role(name="USER", description="Standard Passenger user")
        db.add(user_role)
    db.commit()

    # 2. Seed Users
    admin_user = db.query(User).filter(User.email == "admin@railone.local").first()
    if not admin_user:
        admin_user = User(
            full_name="RailOne Administrator",
            email="admin@railone.local",
            mobile="9876543210",
            hashed_password=get_password_hash("Admin@123"),
            role_id=admin_role.id,
            is_active=True
        )
        db.add(admin_user)

    demo_user = db.query(User).filter(User.email == "user@railone.local").first()
    if not demo_user:
        demo_user = User(
            full_name="Aarav Sharma",
            email="user@railone.local",
            mobile="9812345678",
            hashed_password=get_password_hash("User@123"),
            role_id=user_role.id,
            is_active=True
        )
        db.add(demo_user)
    db.commit()

    # 3. Seed Seat Classes
    class_map = {}
    for c in CLASSES_DATA:
        sc = db.query(SeatClass).filter(SeatClass.code == c["code"]).first()
        if not sc:
            sc = SeatClass(**c)
            db.add(sc)
            db.flush()
        class_map[c["code"]] = sc
    db.commit()

    # 4. Seed Stations
    station_map = {}
    for st_data in STATIONS_DATA:
        st = db.query(Station).filter(Station.code == st_data["code"]).first()
        if not st:
            st = Station(**st_data)
            db.add(st)
            db.flush()
        station_map[st_data["code"]] = st
    db.commit()

    # 5. Seed Trains & Detailed Routes
    trains_spec = [
        {
            "number": "12951",
            "name": "Mumbai Rajdhani Express",
            "source": "BCT",
            "destination": "NDLS",
            "departure": "17:00",
            "arrival": "08:32",
            "duration": "15h 32m",
            "running_days": "MON,TUE,WED,THU,FRI,SAT,SUN",
            "type": "Rajdhani Superfast",
            "classes": ["1A", "2A", "3A"],
            "base_fares": {"1A": 4450, "2A": 2850, "3A": 1980},
            "stops": [
                {"code": "BCT", "arr": "--", "dep": "17:00", "halt": 0, "km": 0, "day": 1},
                {"code": "ADI", "arr": "22:45", "dep": "22:55", "halt": 10, "km": 491, "day": 1},
                {"code": "NDLS", "arr": "08:32", "dep": "--", "halt": 0, "km": 1384, "day": 2}
            ]
        },
        {
            "number": "12952",
            "name": "New Delhi - Mumbai Rajdhani Express",
            "source": "NDLS",
            "destination": "BCT",
            "departure": "16:55",
            "arrival": "08:35",
            "duration": "15h 40m",
            "running_days": "MON,TUE,WED,THU,FRI,SAT,SUN",
            "type": "Rajdhani Superfast",
            "classes": ["1A", "2A", "3A"],
            "base_fares": {"1A": 4450, "2A": 2850, "3A": 1980},
            "stops": [
                {"code": "NDLS", "arr": "--", "dep": "16:55", "halt": 0, "km": 0, "day": 1},
                {"code": "ADI", "arr": "02:30", "dep": "02:40", "halt": 10, "km": 893, "day": 2},
                {"code": "BCT", "arr": "08:35", "dep": "--", "halt": 0, "km": 1384, "day": 2}
            ]
        },
        {
            "number": "22436",
            "name": "Vande Bharat Express",
            "source": "NDLS",
            "destination": "BSB",
            "departure": "06:00",
            "arrival": "14:00",
            "duration": "08h 00m",
            "running_days": "TUE,WED,FRI,SAT,SUN",
            "type": "Vande Bharat Semi-Highspeed",
            "classes": ["CC", "1A"],
            "base_fares": {"CC": 1750, "1A": 3300},
            "stops": [
                {"code": "NDLS", "arr": "--", "dep": "06:00", "halt": 0, "km": 0, "day": 1},
                {"code": "CNB", "arr": "10:08", "dep": "10:10", "halt": 2, "km": 440, "day": 1},
                {"code": "BSB", "arr": "14:00", "dep": "--", "halt": 0, "km": 759, "day": 1}
            ]
        },
        {
            "number": "22435",
            "name": "Varanasi Vande Bharat Express",
            "source": "BSB",
            "destination": "NDLS",
            "departure": "15:00",
            "arrival": "23:00",
            "duration": "08h 00m",
            "running_days": "TUE,WED,FRI,SAT,SUN",
            "type": "Vande Bharat Semi-Highspeed",
            "classes": ["CC", "1A"],
            "base_fares": {"CC": 1750, "1A": 3300},
            "stops": [
                {"code": "BSB", "arr": "--", "dep": "15:00", "halt": 0, "km": 0, "day": 1},
                {"code": "CNB", "arr": "18:30", "dep": "18:32", "halt": 2, "km": 319, "day": 1},
                {"code": "NDLS", "arr": "23:00", "dep": "--", "halt": 0, "km": 759, "day": 1}
            ]
        },
        {
            "number": "12004",
            "name": "Lucknow Shatabdi Express",
            "source": "NDLS",
            "destination": "LKO",
            "departure": "06:10",
            "arrival": "12:40",
            "duration": "06h 30m",
            "running_days": "MON,TUE,WED,THU,FRI,SAT,SUN",
            "type": "Shatabdi Express",
            "classes": ["CC", "1A"],
            "base_fares": {"CC": 1165, "1A": 2125},
            "stops": [
                {"code": "NDLS", "arr": "--", "dep": "06:10", "halt": 0, "km": 0, "day": 1},
                {"code": "CNB", "arr": "11:20", "dep": "11:25", "halt": 5, "km": 435, "day": 1},
                {"code": "LKO", "arr": "12:40", "dep": "--", "halt": 0, "km": 511, "day": 1}
            ]
        },
        {
            "number": "12137",
            "name": "Punjab Mail",
            "source": "CSMT",
            "destination": "NDLS",
            "departure": "19:35",
            "arrival": "21:30",
            "duration": "25h 55m",
            "running_days": "MON,TUE,WED,THU,FRI,SAT,SUN",
            "type": "Superfast Express",
            "classes": ["1A", "2A", "3A", "SL", "2S"],
            "base_fares": {"1A": 3950, "2A": 2350, "3A": 1640, "SL": 615, "2S": 355},
            "stops": [
                {"code": "CSMT", "arr": "--", "dep": "19:35", "halt": 0, "km": 0, "day": 1},
                {"code": "BPL", "arr": "09:30", "dep": "09:35", "halt": 5, "km": 837, "day": 2},
                {"code": "AGC", "arr": "17:50", "dep": "17:55", "halt": 5, "km": 1341, "day": 2},
                {"code": "NDLS", "arr": "21:30", "dep": "--", "halt": 0, "km": 1536, "day": 2}
            ]
        },
        {
            "number": "12260",
            "name": "Sealdah Duronto Express",
            "source": "NDLS",
            "destination": "HWH",
            "departure": "19:45",
            "arrival": "12:45",
            "duration": "17h 00m",
            "running_days": "MON,TUE,THU,FRI",
            "type": "Duronto Non-Stop",
            "classes": ["1A", "2A", "3A", "SL"],
            "base_fares": {"1A": 4820, "2A": 3120, "3A": 2180, "SL": 780},
            "stops": [
                {"code": "NDLS", "arr": "--", "dep": "19:45", "halt": 0, "km": 0, "day": 1},
                {"code": "CNB", "arr": "00:45", "dep": "00:50", "halt": 5, "km": 440, "day": 2},
                {"code": "HWH", "arr": "12:45", "dep": "--", "halt": 0, "km": 1450, "day": 2}
            ]
        },
        {
            "number": "12626",
            "name": "Kerala Express",
            "source": "NDLS",
            "destination": "TVC",
            "departure": "20:10",
            "arrival": "14:15",
            "duration": "42h 05m",
            "running_days": "MON,TUE,WED,THU,FRI,SAT,SUN",
            "type": "Superfast Express",
            "classes": ["2A", "3A", "SL", "2S"],
            "base_fares": {"2A": 3480, "3A": 2390, "SL": 895, "2S": 485},
            "stops": [
                {"code": "NDLS", "arr": "--", "dep": "20:10", "halt": 0, "km": 0, "day": 1},
                {"code": "AGC", "arr": "22:20", "dep": "22:25", "halt": 5, "km": 195, "day": 1},
                {"code": "BPL", "arr": "05:20", "dep": "05:25", "halt": 5, "km": 705, "day": 2},
                {"code": "NGP", "arr": "11:45", "dep": "11:50", "halt": 5, "km": 1095, "day": 2},
                {"code": "TVC", "arr": "14:15", "dep": "--", "halt": 0, "km": 3036, "day": 3}
            ]
        },
        {
            "number": "12009",
            "name": "Mumbai - Ahmedabad Shatabdi",
            "source": "CSMT",
            "destination": "ADI",
            "departure": "06:20",
            "arrival": "12:45",
            "duration": "06h 25m",
            "running_days": "MON,TUE,WED,THU,FRI,SAT",
            "type": "Shatabdi Express",
            "classes": ["CC", "1A"],
            "base_fares": {"CC": 925, "1A": 1840},
            "stops": [
                {"code": "CSMT", "arr": "--", "dep": "06:20", "halt": 0, "km": 0, "day": 1},
                {"code": "ADI", "arr": "12:45", "dep": "--", "halt": 0, "km": 492, "day": 1}
            ]
        },
        {
            "number": "12123",
            "name": "Deccan Queen Superfast",
            "source": "CSMT",
            "destination": "PUNE",
            "departure": "17:10",
            "arrival": "20:25",
            "duration": "03h 15m",
            "running_days": "MON,TUE,WED,THU,FRI,SAT,SUN",
            "type": "Intercity Superfast",
            "classes": ["CC", "2S"],
            "base_fares": {"CC": 440, "2S": 120},
            "stops": [
                {"code": "CSMT", "arr": "--", "dep": "17:10", "halt": 0, "km": 0, "day": 1},
                {"code": "PUNE", "arr": "20:25", "dep": "--", "halt": 0, "km": 192, "day": 1}
            ]
        },
        {
            "number": "22691",
            "name": "Bengaluru Rajdhani Express",
            "source": "SBC",
            "destination": "NZM",
            "departure": "20:00",
            "arrival": "05:30",
            "duration": "33h 30m",
            "running_days": "MON,TUE,WED,THU,FRI,SAT,SUN",
            "type": "Rajdhani Superfast",
            "classes": ["1A", "2A", "3A"],
            "base_fares": {"1A": 5120, "2A": 3390, "3A": 2420},
            "stops": [
                {"code": "SBC", "arr": "--", "dep": "20:00", "halt": 0, "km": 0, "day": 1},
                {"code": "HYB", "arr": "07:10", "dep": "07:20", "halt": 10, "km": 709, "day": 2},
                {"code": "NGP", "arr": "15:20", "dep": "15:25", "halt": 5, "km": 1215, "day": 2},
                {"code": "BPL", "arr": "21:40", "dep": "21:45", "halt": 5, "km": 1605, "day": 2},
                {"code": "NZM", "arr": "05:30", "dep": "--", "halt": 0, "km": 2315, "day": 3}
            ]
        },
        {
            "number": "12301",
            "name": "Howrah Rajdhani Express",
            "source": "HWH",
            "destination": "NDLS",
            "departure": "16:50",
            "arrival": "10:05",
            "duration": "17h 15m",
            "running_days": "MON,TUE,WED,THU,FRI,SAT",
            "type": "Rajdhani Superfast",
            "classes": ["1A", "2A", "3A"],
            "base_fares": {"1A": 4750, "2A": 3080, "3A": 2150},
            "stops": [
                {"code": "HWH", "arr": "--", "dep": "16:50", "halt": 0, "km": 0, "day": 1},
                {"code": "PNBE", "arr": "22:15", "dep": "22:25", "halt": 10, "km": 532, "day": 1},
                {"code": "CNB", "arr": "04:50", "dep": "04:55", "halt": 5, "km": 1010, "day": 2},
                {"code": "NDLS", "arr": "10:05", "dep": "--", "halt": 0, "km": 1450, "day": 2}
            ]
        }
    ]

    for t_spec in trains_spec:
        src_station = station_map[t_spec["source"]]
        dst_station = station_map[t_spec["destination"]]

        train = db.query(Train).filter(Train.number == t_spec["number"]).first()
        if not train:
            train = Train(
                number=t_spec["number"],
                name=t_spec["name"],
                source_station_id=src_station.id,
                destination_station_id=dst_station.id,
                departure_time=t_spec["departure"],
                arrival_time=t_spec["arrival"],
                duration=t_spec["duration"],
                running_days=t_spec["running_days"],
                train_type=t_spec["type"],
                is_active=True
            )
            db.add(train)
            db.flush()

            # Add Train Stops
            for idx, st_stop in enumerate(t_spec["stops"]):
                stop_station = station_map[st_stop["code"]]
                t_stop = TrainStop(
                    train_id=train.id,
                    station_id=stop_station.id,
                    stop_number=idx + 1,
                    arrival_time=st_stop["arr"],
                    departure_time=st_stop["dep"],
                    halt_minutes=st_stop["halt"],
                    distance_from_origin_km=float(st_stop["km"]),
                    day_count=st_stop["day"]
                )
                db.add(t_stop)

            # Add Fares & Coaches
            for c_code in t_spec["classes"]:
                s_class = class_map[c_code]
                base_f = t_spec["base_fares"].get(c_code, 500)
                fare = Fare(
                    train_id=train.id,
                    from_station_id=src_station.id,
                    to_station_id=dst_station.id,
                    class_id=s_class.id,
                    base_fare=float(base_f),
                    reservation_charge=40.0,
                    superfast_charge=45.0,
                    gst=round(base_f * 0.05, 2) if c_code in ["1A", "2A", "3A", "CC"] else 0.0,
                    total_fare=round(float(base_f) + 85.0 + (base_f * 0.05 if c_code in ["1A", "2A", "3A", "CC"] else 0), 2)
                )
                db.add(fare)

                # Add 2 coaches per class
                for coach_idx in [1, 2]:
                    prefix = {"1A": "H", "2A": "A", "3A": "B", "CC": "C", "SL": "S", "2S": "D"}.get(c_code, "B")
                    coach = Coach(
                        train_id=train.id,
                        coach_number=f"{prefix}{coach_idx}",
                        class_id=s_class.id,
                        total_seats=72
                    )
                    db.add(coach)
                    db.flush()

                    # Add sample seats
                    for s_num in range(1, 11):
                        b_type = ["LOWER", "MIDDLE", "UPPER", "SIDE_LOWER", "SIDE_UPPER"][(s_num - 1) % 5]
                        seat = Seat(
                            coach_id=coach.id,
                            seat_number=s_num,
                            berth_type=b_type
                        )
                        db.add(seat)

                # Pre-populate availability for next 7 days
                today = date.today()
                for day_offset in range(14):
                    j_date = today + timedelta(days=day_offset)
                    avail = Availability(
                        train_id=train.id,
                        journey_date=j_date,
                        class_id=s_class.id,
                        total_seats=72,
                        booked_seats=12,
                        available_seats=60,
                        rac_seats=0,
                        waiting_list=0
                    )
                    db.add(avail)

    db.commit()

    # 6. Seed a sample booking for demo user
    existing_sample_booking = db.query(Booking).filter(Booking.user_id == demo_user.id).first()
    if not existing_sample_booking:
        first_train = db.query(Train).filter(Train.number == "12951").first()
        class_3a = class_map["3A"]
        tomorrow = date.today() + timedelta(days=1)
        pnr_demo = "2104598124"

        sample_booking = Booking(
            booking_reference="RO-DEMO2026",
            user_id=demo_user.id,
            train_id=first_train.id,
            from_station_id=first_train.source_station_id,
            to_station_id=first_train.destination_station_id,
            class_id=class_3a.id,
            journey_date=tomorrow,
            total_fare=2100.0,
            status="CONFIRMED"
        )
        db.add(sample_booking)
        db.flush()

        passenger1 = Passenger(
            full_name="Aarav Sharma",
            age=29,
            gender="MALE",
            berth_preference="LOWER",
            id_type="Aadhaar",
            id_number="XXXX-XXXX-4589"
        )
        db.add(passenger1)
        db.flush()

        bp1 = BookingPassenger(
            booking_id=sample_booking.id,
            passenger_id=passenger1.id,
            coach_number="B1",
            seat_number=35,
            berth_type="LOWER",
            booking_status="CNF",
            current_status="CNF"
        )
        db.add(bp1)

        pay = Payment(
            booking_id=sample_booking.id,
            transaction_id="TXN-DEMO789123",
            amount=2100.0,
            payment_method="UPI",
            status="SUCCESS"
        )
        db.add(pay)

        pnr_rec = PnrRecord(
            pnr_number=pnr_demo,
            booking_id=sample_booking.id,
            journey_date=tomorrow,
            status="CONFIRMED"
        )
        db.add(pnr_rec)

        ticket = Ticket(
            booking_id=sample_booking.id,
            ticket_number="TKT-RO-998811",
            pnr_number=pnr_demo,
            qr_code_data=f"RAILONE|PNR:{pnr_demo}|TR:12951|DT:{tomorrow}|PAX:1|AMT:2100.0",
            issue_date=datetime.utcnow()
        )
        db.add(ticket)

        welcome_notif = Notification(
            user_id=demo_user.id,
            title="Welcome to RailOne! 🚆",
            message="Your demo confirmed ticket on Mumbai Rajdhani (PNR: 2104598124) is ready in My Bookings.",
            notification_type="SYSTEM"
        )
        db.add(welcome_notif)

        db.commit()

    print("[RailOne] Seed data initialized successfully.")
