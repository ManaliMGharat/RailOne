# RailOne — "Your journey, simplified."

> **Official Next-Generation Indian Railways & Mumbai Suburban Travel Companion**

RailOne is a clean, production-grade, full-stack railway application architected to simplify everyday railway journeys. It unifies reserved intercity travel, paperless UTS suburban local journeys, 2-hour platform tickets, season passes, live PNR tracking, platform rake coach compositions, on-seat food ordering, instant wallet refunds, and passenger grievance support.

---

## 1. Core Architecture & Technology Stack

```
railone/
├── frontend/                     # React 18, TypeScript, Vite, Tailwind CSS, React Router v6
│   ├── src/
│   │   ├── api/                  # Central API client with cold-start resilience & auth handling
│   │   ├── components/           # Reusable components (Header, BottomNav, StationAutocomplete, etc.)
│   │   ├── context/              # AuthContext (JWT, mPIN, Passkey WebAuthn) & LanguageContext (EN/HI/MR)
│   │   ├── layouts/              # Responsive AppLayout (360px-430px mobile up to desktop)
│   │   ├── pages/                # All 15 functional screens
│   │   ├── types/                # Unified TypeScript interfaces
│   │   ├── App.tsx               # Central application router
│   │   └── main.tsx              # React DOM entry
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json               # SPA client-side routing rewrites
│   └── tsconfig.json
│
├── backend/                      # Python, FastAPI, SQLAlchemy 2.0, Pydantic v2
│   ├── app/
│   │   ├── main.py               # FastAPI entry point & CORS configuration
│   │   ├── config.py             # App settings (Pydantic SettingsConfigDict)
│   │   ├── database.py           # Database engine & session generator
│   │   ├── models/               # SQLAlchemy ORM models (21 relational entities)
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── routers/              # Modular API endpoints (/auth, /stations, /trains, etc.)
│   │   ├── services/             # Fare calculation engine, PNR, Coach, Tracking
│   │   ├── auth/                 # PBKDF2-HMAC-SHA256, JWT, mPIN, OTP & WebAuthn
│   │   └── seed.py               # Database seeder with 210+ authoritative stations
│   ├── tests/
│   │   └── test_railone.py       # Comprehensive pytest test suite (16 test suites)
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env.example
│
├── README.md
└── .gitignore
```

### Frontend Technology
- **React 18** with **TypeScript** and **Vite**
- **Tailwind CSS** with custom navy typography (`#1B254B`), soft background (`#F4F7FE`), and pastel service themes
- **Lucide React** icons
- **React Router DOM v6** with protected route guards

### Backend Technology
- **Python 3.10+ / 3.14 compatible**
- **FastAPI** with auto-generated Swagger UI (`/docs`) & ReDoc (`/redoc`)
- **SQLAlchemy 2.0** ORM supporting SQLite (local) & PostgreSQL (Render production)
- **PBKDF2-HMAC-SHA256** cryptographic password & mPIN hashing (NIST approved)
- **JWT Authentication** (python-jose) with deterministic logout
- **WebAuthn / Passkey Biometric Architecture** with graceful browser fallback

---

## 2. Key Implemented Features

| Feature | Description |
|---|---|
| **Personalized Home** | Greets user ("Hi, Manali Manish Gharat!"), journey planner cards, and quick search. |
| **Journey Planner** | 3 large visual cards: **Reserved** (scenic coach), **Unreserved** (suburban commuter), **Platform** (2-hr QR pass). |
| **8 More Offerings** | Search Trains, PNR Status, Coach Position, Track Your Train, Order Food, File Refund, Season Ticket, Railway Support. |
| **Station System** | 210+ database-backed railway stations with code, name, city, zone, coordinates, and suburban sequences. |
| **Station Autocomplete** | Keyboard-navigable autocomplete with popular stations, recent stations, swap button, and **Same-Station Validation** (prevents `MMCT → MMCT`). |
| **Mumbai Suburban Network** | Full station sequences for **Western Line**, **Central Main Line**, **Harbour Line**, and **Trans-Harbour Line**. |
| **Nerul–Uran Corridor** | Complete official corridor (`NEU`, `SWDV`, `SGSM`, `TRGR`, `BMDR`, `KARP`, `GAVN`, `RJNP`, `SMKR`, `NUSH`, `DRGI`, `UNR`) with bidirectional suburban locals (`99701` & `99702`). |
| **Reserved Train Search** | Search between stations (e.g. `MMCT → PUNE`), all classes supported (`ALL`, `1A`, `2A`, `3A`, `3E`, `CC`, `EC`, `SL`, `2S`). |
| **Fare Engine** | Backend `fare_service.py` calculates distance-based fare, class multiplier, suburban slabs, and season pass rates. |
| **PNR Status** | 10-digit PNR lookup with passenger berths, chart status, and clearly labeled demo simulations. |
| **Coach Position** | Horizontal visual train rake composition (Engine, General, Sleeper, AC, Pantry, SLR). |
| **Track Your Train** | GPS simulation with current station, schedule delays, and stoppage timeline. |
| **Wallet & Payments** | Instant digital wallet balance, UPI/card top-up, debit on booking, and 90% instant refund on cancellation. |
| **E-Ticket & QR** | Verifiable electronic tickets with secure QR tokens, passenger coach/berths, and print/download view. |
| **Food Ordering** | Station restaurant menus, veg/non-veg tags, cart drawer, and train seat delivery tracking. |
| **Railway Support** | Pre-populated FAQs, grievance ticket creation, and administrative replies. |
| **Multilingual UI** | One-click language switching between **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** in the header. |
| **Admin Dashboard** | Protected dashboard with live metrics, refund approval actions, and grievance management. |

---

## 3. Local Development Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database seeder (seeds 210+ stations, trains, routes, demo user, admin, etc.)
python app/seed.py

# Run backend tests (16 test suites)
pytest tests/test_railone.py -q

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
- **Backend API:** `http://localhost:8000/api`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run production build validation
npm run build
```
- **Frontend App:** `http://localhost:5173`

---

## 4. Demo Credentials

| Role | Username / Email | Password | mPIN | Features |
|---|---|---|---|---|
| **Passenger** | `manali@railone.in` (or phone `9820098200`) | `manali123` | `1234` | Full passenger booking, ₹3,500 wallet balance, active booking `8421095812`, 15 notifications. |
| **Admin** | `admin@railone.in` (or phone `9999999999`) | `admin123` | `9999` | Administrator dashboard, refund approvals, grievance resolutions, stats. |

*Note: You can also use the **Phone OTP Fast Login** tab on the login screen with any 10-digit mobile number.*

---

## 5. Deployment Instructions

### A. Deploy Frontend to Vercel
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set the project configuration:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend-app.onrender.com/api`
4. Deploy!

### B. Deploy Backend to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository and configure:
   - **Root Directory:** `backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt && python app/seed.py`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Environment Variables:
   - `DATABASE_URL` = PostgreSQL connection string provided by Render PostgreSQL database (or fallback SQLite).
   - `SECRET_KEY` = `railone-production-secret-jwt-key-2026-super-secure`
   - `ENVIRONMENT` = `production`
   - `CORS_ORIGINS` = `https://your-frontend-app.vercel.app,http://localhost:5173`
4. Deploy!

---

## 6. Official Station & Route Data Details

### Seeded Railway Stations (210 Stations Total)
- **Mumbai Western Line:** Churchgate (CCG) to Dahanu Road (DRD), including Marine Lines, Charni Road, Grant Road, Mumbai Central (MMCT), Lower Parel, Prabhadevi, Dadar (DDR), Bandra, Andheri, Borivali (BVI), Vasai Road, Virar (VR), Palghar, etc.
- **Mumbai Central Main Line:** CSMT (CSMT) to Kasara (KSRA) & Khopoli (KHPI), including Byculla, Parel, Dadar Central (DR), Kurla, Ghatkopar, Bhandup, Mulund, Thane (TNA), Dombivli, Kalyan (KYN), Ambernath, Badlapur, Neral, Karjat (KJT), etc.
- **Mumbai Harbour & Trans-Harbour Line:** CSMT, Vadala Road, Chembur, Vashi, Sanpada, Juinagar, Nerul (NEU), Seawoods (SWDV), Belapur, Kharghar, Panvel (PNVL), Airoli, Rabale, Ghansoli, Koparkhairane, Turbhe.
- **Nerul–Uran Corridor (Official IR Sequence):**
  1. Nerul (`NEU`)
  2. Seawoods-Darave (`SWDV`)
  3. Sagar Sangam (`SGSM`)
  4. Targhar (`TRGR`)
  5. Bamandongri (`BMDR`)
  6. Kharkopar (`KARP`)
  7. Gavan (`GAVN`)
  8. Ranjanpada (`RJNP`)
  9. Shematikhar (`SMKR`)
  10. Nhava Sheva (`NUSH`)
  11. Dronagiri (`DRGI`)
  12. Uran (`UNR`)
- **Major National Hubs:** New Delhi (`NDLS`), Howrah (`HWH`), Puratchi Thalaivar Dr. M.G.R. Central Chennai (`MAS`), KSR Bengaluru (`SBC`), Pune Junction (`PUNE`), Ahmedabad (`ADI`), Jaipur (`JP`), Lucknow (`LKO`), Varanasi (`BSB`), Patna (`PNBE`), Secunderabad (`SC`), Bhopal (`BPL`), Madgaon Goa (`MAO`), etc.

---

## 7. Verification & Test Suite Summary

- **Backend Pytest:** 16 tests executed and passed (covering registration, password hashing, phone OTP, mPIN verification, station search, same-station rejection, Mumbai suburban lines, Nerul-Uran route, `MMCT → PUNE` search, `ALL` class handling, fare calculation, booking creation, wallet deduction, notifications, and admin role authorization).
- **Frontend Build:** `npm run build` executed and passed with zero TypeScript errors.
