# EquipFlow - Equipment Booking & Scheduling System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-equip--flow--tau.vercel.app-0ea5e9?style=for-the-badge)](https://equip-flow-tau.vercel.app)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-ORM-E83524?style=for-the-badge)
![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20HttpOnly%20Cookie-f59e0b?style=for-the-badge)

EquipFlow is a full-stack scheduling platform for managing equipment availability, bookings, and slot approval workflows. It supports role-aware access, certification-gated booking, and dependency-aware resource validation to prevent invalid reservations.

## Live Demo

- https://equip-flow-tau.vercel.app

## Core Highlights

- Role-based workflows for Admin and User (with Manager support in backend authorization for selected user-management APIs)
- Availability slot creation with overlap prevention
- Booking engine with:
  - conflict detection
  - certification requirement checks
  - dependency-aware equipment availability checks
  - alternate time suggestions when conflicts occur
- Slot request and admin approval flow
- Cookie-enabled auth (httpOnly cookie) with JWT verification, plus Bearer-token compatibility
- Responsive React dashboard with protected routes and role-aware navigation

## Tech Stack

### Frontend

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- TanStack React Query
- React Router v7
- Axios
- date-fns
- react-hot-toast

### Backend

- Node.js + TypeScript
- Express 5
- TypeORM
- PostgreSQL driver (`pg`)
- JWT (`jsonwebtoken`)
- bcrypt (password hashing)
- cookie-parser
- dotenv

### Database

- PostgreSQL
- Entities include users, slots, bookings, equipment, certifications, equipment requirements, resource dependencies, and slot requests
- Development mode uses TypeORM `synchronize` for schema sync

### Authentication & Authorization

- JWT-based authentication
- Token set in httpOnly cookie on login
- `withCredentials` frontend requests for cookie auth
- Authorization middleware supports role checks (`admin`, `manager`, `user`)
- Backend also accepts `Authorization: Bearer <token>`

## Features By Role

### Admin

- View system-wide bookings and slot usage
- Create and delete availability slots
- Approve/reject slot requests
- Manage equipment catalog
- Assign certification requirements when creating equipment
- View all users and perform admin-level user operations (create with role, update, soft delete, permanent delete)

### User

- Register and login
- View and book available equipment slots
- Cancel own bookings
- Request new availability slots for approval
- Track request status (`pending`, `approved`, `rejected`)
- View certification readiness against equipment requirements

## API Overview

Base URL (local): `http://localhost:3000/api`

Main route groups:

- `/users` - auth + user management
- `/slots` - availability slots
- `/bookings` - booking lifecycle
- `/equipment` - equipment and requirements
- `/slot-requests` - request/approve/reject slot flow
- `/certifications` and `/users/:userId/certifications` - certification data

Health check:

- `GET /health`

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+

### 1) Clone and Install

```bash
git clone <your-repository-url>
cd Scheduling_management_sis
```

### 2) Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

Update `backend/.env` values (database + JWT secret), then run:

```bash
npm run dev
```

Backend runs on `http://localhost:3000` by default.

### 3) Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

Frontend runs on `http://localhost:5173` by default.

## Environment Variables

### Backend (`backend/.env`)

You can use either `DATABASE_URI` or individual DB variables.

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `development` | Affects cookie security and TypeORM behavior |
| `PORT` | Yes | `3000` | API port |
| `JWT_SECRET` | Yes | `change_me` | Use a long random value in production |
| `JWT_EXPIRES_IN` | No | `7d` | Defaults to `7d` |
| `DATABASE_URI` | Yes* | `postgresql://user:pass@localhost:5432/scheduling_db` | Use this OR the fields below |
| `DB_HOST` | Yes* | `localhost` | Required if `DATABASE_URI` is not set |
| `DB_PORT` | Yes* | `5432` | Required if `DATABASE_URI` is not set |
| `DB_USERNAME` | Yes* | `postgres` | Required if `DATABASE_URI` is not set |
| `DB_PASSWORD` | Yes* | `your_password` | Required if `DATABASE_URI` is not set |
| `DB_DATABASE` | Yes* | `scheduling_db` | Required if `DATABASE_URI` is not set |

`*` Required depending on DB configuration strategy.

### Frontend (`frontend/.env`)

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `VITE_API_URL` | Yes | `http://localhost:3000/api` | Base URL for frontend API calls |

## Scripts

### Backend

- `npm run dev` - Run API with ts-node
- `npm run build` - Compile TypeScript
- `npm run prod` - Run compiled app (`dist/app.js`)

### Frontend

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check and build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```text
Scheduling_management_sis/
|- backend/
|  |- app.ts
|  |- config/
|  |  |- config.service.ts
|  |  |- database.ts
|  |- src/
|     |- controllers/
|     |- entities/
|     |- middlewares/
|     |- routes/
|     |- services/
|     |- utils/
|- frontend/
|  |- src/
|     |- components/
|     |- context/
|     |- hooks/
|     |- pages/
|     |- services/
|     |- types/
|- AUTH_SYSTEM_GUIDE.md
|- COOKIE_AUTH_GUIDE.md
|- QUICK_START.md
```

## Architecture Notes

- Backend is organized by layers: routes -> controllers -> services -> entities
- Frontend uses React Query hooks for server-state caching and automatic invalidation
- Auth state is managed in React context, with protected route guards
- CORS configuration currently allows:
  - `http://localhost:5173`
  - `http://localhost:3000`
  - `https://equip-flow-tau.vercel.app`

## Production Considerations

- Set strong `JWT_SECRET` and production-safe DB credentials
- Run behind HTTPS so secure cookies are enforced
- Disable TypeORM `synchronize` in production and use migrations
- Restrict CORS origins to trusted domains only

## Additional Documentation

- `AUTH_SYSTEM_GUIDE.md`
- `COOKIE_AUTH_GUIDE.md`
- `QUICK_START.md`
- `backend/API_DOCUMENTATION.md`

---

EquipFlow is designed for practical scheduling constraints, not just CRUD: it combines role-aware UX with backend-enforced booking rules so invalid reservations are rejected before they happen.