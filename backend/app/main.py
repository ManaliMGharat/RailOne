import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import engine, SessionLocal, get_db
from app.models import Base, Station, Train
from app.db.seed import seed_database

from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.stations import router as stations_router
from app.api.trains import router as trains_router
from app.api.bookings import router as bookings_router
from app.api.pnr import router as pnr_router
from app.api.users import router as users_router
from app.api.notifications import router as notifications_router
from app.api.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # For local SQLite zero-setup development, ensure tables exist
    if settings.DATABASE_URL.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)
    
    # Auto-seed database if empty (applies to SQLite and Render PostgreSQL)
    db = SessionLocal()
    try:
        station_count = db.query(Station).count()
        if station_count == 0:
            print("[RailOne Startup] No stations found in database. Initializing seed data...")
            seed_database(db)
            print("[RailOne Startup] Database seed completed successfully.")
        else:
            print(f"[RailOne Startup] Database already populated with {station_count} stations.")
    except Exception as e:
        print(f"[RailOne Startup] Note: Could not auto-seed database: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title="RailOne API",
    description="Production-grade modern Indian railway passenger booking platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Secure Production CORS configuration
# Allows configured FRONTEND_URL, CORS_ORIGINS, and dynamically supports Vercel preview environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handlers
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred", "error": str(exc)}
    )

# Root-level health check endpoint
@app.get("/health", tags=["Health"])
def root_health():
    return {"status": "ok", "service": "RailOne Railway Platform"}

# Include API routers under /api
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(stations_router, prefix="/api")
app.include_router(trains_router, prefix="/api")
app.include_router(bookings_router, prefix="/api")
app.include_router(pnr_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

# System Seeding Endpoint (Idempotent: safely initializes/checks stations, trains, seat classes)
@app.post("/api/seed", tags=["System Seeding"])
def trigger_system_seed(db: Session = Depends(get_db)):
    """Explicitly initializes or verifies platform seed data. Safe to execute multiple times."""
    seed_database(db)
    station_count = db.query(Station).count()
    train_count = db.query(Train).count()
    return {
        "status": "success",
        "message": "RailOne database seed initialized/verified successfully.",
        "stations_count": station_count,
        "trains_count": train_count
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.ENVIRONMENT == "development")
