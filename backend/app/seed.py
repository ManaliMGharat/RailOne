"""
RailOne Explicit Database Seed Script
Run via CLI: python -m app.seed
Safely seeds 24 stations, 12 trains, route stops, seat classes, and demo accounts.
"""

from app.db.session import SessionLocal
from app.db.seed import seed_database

def run_seed():
    print("[RailOne] Starting explicit database seeding...")
    db = SessionLocal()
    try:
        seed_database(db)
        print("[RailOne] Database seeding completed successfully.")
    except Exception as e:
        print(f"[RailOne] Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
