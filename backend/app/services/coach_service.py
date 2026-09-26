from app.schemas.schemas import CoachPositionResponse, CoachItem

def get_coach_position(train_number: str) -> CoachPositionResponse:
    t_num = train_number.strip()
    
    # Custom composition for known trains or standard composition
    if t_num in ["12951", "12952"]: # Rajdhani
        train_name = "Mumbai Rajdhani Express"
        coaches = [
            CoachItem(position=1, code="ENG", label="WAP-7 Locomotive", category="Engine"),
            CoachItem(position=2, code="EOG", label="Generator Car", category="SLR"),
            CoachItem(position=3, code="B1", label="AC 3 Tier", category="AC"),
            CoachItem(position=4, code="B2", label="AC 3 Tier", category="AC"),
            CoachItem(position=5, code="B3", label="AC 3 Tier", category="AC"),
            CoachItem(position=6, code="B4", label="AC 3 Tier", category="AC"),
            CoachItem(position=7, code="PC", label="Pantry Car (Hot Kitchen)", category="Pantry"),
            CoachItem(position=8, code="A1", label="AC 2 Tier", category="AC"),
            CoachItem(position=9, code="A2", label="AC 2 Tier", category="AC"),
            CoachItem(position=10, code="H1", label="AC First Class", category="AC"),
            CoachItem(position=11, code="EOG", label="End-On Generator", category="SLR"),
        ]
    elif t_num in ["12123", "12124"]: # Deccan Queen
        train_name = "Deccan Queen Superfast Express"
        coaches = [
            CoachItem(position=1, code="ENG", label="WAP-7 Engine", category="Engine"),
            CoachItem(position=2, code="DL1", label="Ladies / Gen", category="General"),
            CoachItem(position=3, code="D1", label="Second Sitting (2S)", category="General"),
            CoachItem(position=4, code="D2", label="Second Sitting (2S)", category="General"),
            CoachItem(position=5, code="D3", label="Second Sitting (2S)", category="General"),
            CoachItem(position=6, code="DC", label="Dining Car", category="Pantry"),
            CoachItem(position=7, code="C1", label="AC Chair Car (CC)", category="AC"),
            CoachItem(position=8, code="C2", label="AC Chair Car (CC)", category="AC"),
            CoachItem(position=9, code="C3", label="AC Chair Car (CC)", category="AC"),
            CoachItem(position=10, code="SLR", label="Guard & Brake Van", category="SLR"),
        ]
    else: # Standard Express rake
        train_name = f"Express Special ({t_num})"
        coaches = [
            CoachItem(position=1, code="ENG", label="Locomotive", category="Engine"),
            CoachItem(position=2, code="SLR", label="Seating cum Luggage", category="SLR"),
            CoachItem(position=3, code="GS1", label="General Unreserved", category="General"),
            CoachItem(position=4, code="GS2", label="General Unreserved", category="General"),
            CoachItem(position=5, code="S1", label="Sleeper Class", category="Sleeper"),
            CoachItem(position=6, code="S2", label="Sleeper Class", category="Sleeper"),
            CoachItem(position=7, code="S3", label="Sleeper Class", category="Sleeper"),
            CoachItem(position=8, code="PC", label="Pantry Car", category="Pantry"),
            CoachItem(position=9, code="B1", label="AC 3 Tier", category="AC"),
            CoachItem(position=10, code="B2", label="AC 3 Tier", category="AC"),
            CoachItem(position=11, code="A1", label="AC 2 Tier", category="AC"),
            CoachItem(position=12, code="GS3", label="General Unreserved", category="General"),
            CoachItem(position=13, code="SLR", label="Brake Van", category="SLR"),
        ]

    return CoachPositionResponse(
        train_number=t_num,
        train_name=train_name,
        platform_number=1,
        coaches=coaches
    )
