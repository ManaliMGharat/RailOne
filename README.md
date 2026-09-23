# RailOne — Production-Grade Railway Passenger Platform 🚆

[![Vercel](https://img.shields.io/badge/Frontend-Vercel%20Deploy-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render%20Web%20Service-46E3B7?style=flat-square&logo=render)](https://render.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/UI-React%2019%20%2B%20Vite%20%2B%20TS-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Alembic](https://img.shields.io/badge/Migrations-Alembic-E44D26?style=flat-square)]()
[![Tests](https://img.shields.io/badge/Tests-42%20Pytest%20Passing-brightgreen?style=flat-square)]()

A complete, production-ready railway reservation and passenger assistance network inspired by modern Indian railway platforms. Built with clean architecture, original UI/UX, zero placeholder buttons, and full end-to-end functionality.

---

## 🏛️ Production Architecture

```text
                 PASSENGER / ADMIN USER
                           |
                           v
        +-------------------------------------+
        |           VERCEL FRONTEND           |
        |  React 19 + TypeScript + Vite + CSS |
        |  SPA Routing via vercel.json        |
        +------------------+------------------+
                           |
                           | HTTPS REST API (CORS with Preview Support)
                           v
        +-------------------------------------+
        |            RENDER BACKEND           |
        |  FastAPI + SQLAlchemy + Pydantic    |
        |  Port dynamically bound via $PORT   |
        +------------------+------------------+
                           |
            +--------------+--------------+
            |                             |
            v                             v
+-----------------------+     +-----------------------+
|  MANAGED POSTGRESQL   |     |     MANAGED REDIS     |
|  20+ Normalized Tables|     |  Sessions & Cache     |
|  Alembic Migrations   |     |  (Optional / Add-on)  |
+-----------------------+     +-----------------------+
```

---

## 🔑 Demo & Verification Credentials

| Role | Username / Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@railone.local` | `Admin@123` | Full access to `/admin` dashboard, fleet management, station directory, and audit logs |
| **Passenger** | `user@railone.local` | `User@123` | Seeded demo user with active confirmed booking (`PNR: 2104598124`) |

*(The login page includes **one-click demo login buttons** for instant sign-in without manual typing)*

---

## 📋 Production Environment Variables Matrix

### Frontend (Configured in Vercel Project Settings)
> [!CAUTION]
> Never store sensitive keys (`SECRET_KEY`, `DATABASE_URL`, `POSTGRES_PASSWORD`) in frontend environment variables. Any variable prefixed with `VITE_` is publicly exposed to the browser.

| Variable Name | Required | Example Production Value | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `https://railone-api.onrender.com` | Base URL of the deployed Render FastAPI backend. **Do NOT add `/api` suffix**; the client automatically formats all endpoints to `${VITE_API_BASE_URL}/api`. |

### Backend (Configured in Render Web Service Environment)
| Variable Name | Required | Example Production Value | Purpose |
| :--- | :---: | :--- | :--- |
| `ENVIRONMENT` | **Yes** | `production` | Sets execution mode and disables hot-reload |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@host:5432/railone_db` | Connection string to Managed PostgreSQL (Render auto-populates via `fromDatabase`) |
| `SECRET_KEY` | **Yes** | `f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4...` | Cryptographically secure 32+ character key for JWT token hashing |
| `JWT_ALGORITHM` | No | `HS256` | JWT cryptographic algorithm (default: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` | JWT access token validity (1440 mins = 24 hours) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Refresh token duration (7 days) |
| `FRONTEND_URL` | **Yes** | `https://railone.vercel.app` | Production Vercel domain permitted in CORS |
| `CORS_ORIGINS` | No | `https://railone.vercel.app,https://mycustomdomain.com` | Additional allowed origins (comma-separated). Vercel previews (`*.vercel.app`) are automatically permitted via regex! |
| `REDIS_URL` | No | `rediss://default:pass@redis-host:6379` | Managed Redis connection string if cache is enabled |

---

## 🚀 Deployment Guide: Step-by-Step

### Part 1: Deploy Backend & PostgreSQL on Render

#### Option A: One-Click Infrastructure with `render.yaml`
1. Push this repository to your GitHub account.
2. In the Render Dashboard, navigate to **Blueprints** and click **New Blueprint Instance**.
3. Select your repository. Render will detect `render.yaml` and automatically provision:
   - **`railone-db`**: A managed PostgreSQL database.
   - **`railone-backend`**: A Python web service running `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Fill in `FRONTEND_URL` with your Vercel URL once known.

#### Option B: Manual Service Configuration
1. **Create PostgreSQL Database on Render**:
   - Click **New +** > **PostgreSQL**.
   - Name: `railone-db`
   - Database: `railone_db`
   - User: `railone_user`
   - Copy the **Internal Database URL** (or External URL).
2. **Create Web Service for FastAPI**:
   - Click **New +** > **Web Service**.
   - Connect your GitHub repository.
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Add Environment Variables in Render**:
   - `ENVIRONMENT` = `production`
   - `DATABASE_URL` = Paste your PostgreSQL connection string.
   - `SECRET_KEY` = Generate a random 32+ character hex string.
   - `FRONTEND_URL` = `https://railone.vercel.app` (your Vercel app domain).
4. **Run Safe Initial Database Seeding**:
   - In Render Web Service, open the **Shell** tab and run:
     ```bash
     python -m app.seed
     ```
   - This safely populates 24 stations, 12 trains, timetables, seat classes, and demo accounts without overwriting existing data.
5. **Verify Backend**:
   - Health check: `https://your-backend.onrender.com/health` (Returns `{"status": "ok"}`)
   - Swagger Docs: `https://your-backend.onrender.com/docs`

---

### Part 2: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New...** > **Project**.
2. Select your imported GitHub repository.
3. Configure the Project:
   - **Root Directory**: Click *Edit* and select **`frontend`**.
   - **Framework Preset**: **Vite** (auto-detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend.onrender.com` (Your live Render backend URL).
5. Click **Deploy**.
6. **SPA Routing**:
   - The included `frontend/vercel.json` automatically configures URL rewrites so deep routes (`/search`, `/pnr`, `/bookings`, `/admin`, etc.) refresh seamlessly without 404 errors.

---

## 🧪 Post-Deployment Verification Checklist

After deploying both services, run through this verification checklist:

- [ ] **Health Check**: Open `https://your-backend.onrender.com/health` in browser. Expect `{"status": "ok"}`.
- [ ] **API Documentation**: Open `https://your-backend.onrender.com/docs` to verify OpenAPI schemas.
- [ ] **Frontend Loading**: Visit `https://your-app.vercel.app/`. Ensure navbar, hero, search widget, and quick services load without console errors.
- [ ] **Train Search**: Search from `Mumbai (CSMT)` to `Delhi (NDLS)` on tomorrow's date. Verify train cards display running days, class availability badges (`AVAILABLE`, `RAC`, `WL`), and fares.
- [ ] **Passenger Authentication**:
  - Click **Sign In**, click **Passenger Demo** (`user@railone.local`), and log in.
  - Verify user dropdown displays passenger name and avatar.
- [ ] **Booking Flow**:
  - Search trains, pick class `3A`, and click **Book Now**.
  - Add passenger details and proceed to Payment Simulation.
  - Select UPI / Card / Net Banking and click **Pay & Confirm Booking**.
  - Verify instant redirection to confirmed booking receipt with unique 10-digit PNR.
- [ ] **PNR Status**: Enter the newly generated 10-digit PNR on `/pnr` and verify coach, seat number, and berth type.
- [ ] **Printable E-Ticket**: Click **View Ticket** to open the official Electronic Reservation Slip (ERS) and test print / PDF rendering.
- [ ] **Cancellation & Refund**: In **My Bookings**, click **Cancel Ticket**, select passenger(s), verify class-based cancellation deduction, and confirm instant refund credit.
- [ ] **Admin Portal**:
  - Sign in as `admin@railone.local` / `Admin@123`.
  - Navigate to `/admin` to verify operational KPI metrics, 7-day booking/revenue charts, and class distribution.
  - Test adding a station in `/admin/stations` and inspect the newly created entry in `/admin/audit-logs`.

---

## 💻 Local Development (Zero-Friction Zero-Setup)

For local development, SQLite and default local settings allow running without external databases:

```bash
# 1. Backend
cd backend
python -m venv venv
.\venv\Scripts\activate   # Or source venv/bin/activate on Linux/Mac
pip install -r requirements.txt
python -m app.seed        # Seeds local database
uvicorn app.main:app --reload --port 8000

# 2. Frontend (in another terminal)
cd frontend
npm install
npm run dev               # Runs at http://localhost:5173
```

### Automated Backend Tests
Run the comprehensive Pytest test suite:
```bash
cd backend
.\venv\Scripts\python.exe -m pytest -v
```
**Results: 42 passed in ~3.7s**

---

## 📄 License
MIT License. Built for production simulation, educational, and portfolio development.
