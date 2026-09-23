from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class DashboardStatsResponse(BaseModel):
    total_users: int
    total_trains: int
    total_stations: int
    today_bookings: int
    today_revenue: float
    cancelled_tickets: int
    bookings_by_date: List[Dict[str, Any]]
    revenue_by_date: List[Dict[str, Any]]
    popular_routes: List[Dict[str, Any]]
    class_utilization: List[Dict[str, Any]]

class AuditLogResponse(BaseModel):
    id: int
    admin_id: Optional[int] = None
    admin_name: Optional[str] = "System"
    action: str
    entity: str
    entity_id: Optional[str] = None
    description: str
    ip_address: Optional[str] = "127.0.0.1"
    created_at: datetime

    class Config:
        from_attributes = True
