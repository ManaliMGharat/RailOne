from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
import app.models # Ensure all models are registered with Base

# Import all routers
from app.routers.auth_router import router as auth_router
from app.routers.station_router import router as station_router
from app.routers.train_router import router as train_router
from app.routers.booking_router import router as booking_router
from app.routers.uts_router import (
    platform_router, season_router, uts_router
)
from app.routers.pnr_router import router as pnr_router
from app.routers.coach_router import router as coach_router
from app.routers.tracking_router import router as tracking_router
from app.routers.wallet_router import router as wallet_router
from app.routers.food_router import router as food_router
from app.routers.refund_router import router as refund_router
from app.routers.notification_router import router as notification_router
from app.routers.support_router import router as support_router
from app.routers.passenger_router import router as passenger_router
from app.routers.admin_router import router as admin_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"RailOne Backend API — {settings.TAGLINE}",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception handler for friendly JSON errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log internal error and return standard error JSON
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal railway server error occurred. Please try again later."}
    )

# Register all API routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(station_router, prefix=settings.API_V1_STR)
app.include_router(train_router, prefix=settings.API_V1_STR)
app.include_router(booking_router, prefix=settings.API_V1_STR)
app.include_router(uts_router, prefix=settings.API_V1_STR)
app.include_router(platform_router, prefix=settings.API_V1_STR)
app.include_router(season_router, prefix=settings.API_V1_STR)
app.include_router(pnr_router, prefix=settings.API_V1_STR)
app.include_router(coach_router, prefix=settings.API_V1_STR)
app.include_router(tracking_router, prefix=settings.API_V1_STR)
app.include_router(wallet_router, prefix=settings.API_V1_STR)
app.include_router(food_router, prefix=settings.API_V1_STR)
app.include_router(refund_router, prefix=settings.API_V1_STR)
app.include_router(notification_router, prefix=settings.API_V1_STR)
app.include_router(support_router, prefix=settings.API_V1_STR)
app.include_router(passenger_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
