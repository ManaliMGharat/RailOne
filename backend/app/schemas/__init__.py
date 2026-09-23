from app.schemas.auth import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, RefreshTokenRequest, UserResponse
)
from app.schemas.station import StationBase, StationCreate, StationUpdate, StationResponse
from app.schemas.train import (
    TrainBase, TrainCreate, TrainUpdate, TrainResponse, TrainStopResponse,
    ClassAvailabilityResponse, TrainSearchResult
)
from app.schemas.booking import (
    PassengerInput, BookingCreateRequest, BookingResponse, BookingPassengerResponse,
    PaymentResponse, TicketResponse, CancellationRequest, CancellationResponse
)
from app.schemas.pnr import PnrStatusResponse
from app.schemas.user import (
    UserProfileResponse, UserProfileUpdate, PasswordChangeRequest, NotificationResponse
)
from app.schemas.admin import DashboardStatsResponse, AuditLogResponse
