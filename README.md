# MedSathi (मेदसाथी) — AI Medication Companion

> **"Care that speaks. Confidence that stays."**  
> An AI-powered voice-first medication companion dedicated to helping elderly and low-literacy patients understand, verify, and complete their medication routine while keeping caregivers peacefully informed.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Official Tech Stack](#official-tech-stack)
3. [Folder Structure](#folder-structure)
4. [Environment Variables](#environment-variables)
5. [Frontend Setup & Commands](#frontend-setup--commands)
6. [Backend Setup & Commands](#backend-setup--commands)
7. [Running the Application & Testing](#running-the-application--testing)
8. [Phase 2: Caregiver Authentication & Supabase RLS](#phase-2-caregiver-authentication--supabase-rls)
9. [Phase 3: Patient Management & Multi-Caregiver Access](#phase-3-patient-management--multi-caregiver-access)
10. [Database Schema & Migrations](#database-schema--migrations)
11. [Future Phases Roadmap](#future-phases-roadmap)

---

## 🌟 Project Overview

**MedSathi** addresses a critical healthcare challenge: medication non-adherence and confusion among elderly individuals and patients with limited literacy. Traditional healthcare applications rely on dense tables, small fonts, and clinical jargon. MedSathi transforms this paradigm:

- **Human-First, Not Clinical:** Warm, calm, reassuring visual identity with high contrast and generous touch targets.
- **Voice-First Paradigm:** Conversational interaction designed for spoken natural dialect in future phases.
- **Caregiver Bridge:** A connected loop between caregiver supervision and patient independence:
  ```
  CAREGIVER  ──►  MEDSATHI  ──►  PATIENT
  ```

---

## 🛠 Official Tech Stack

### Frontend (`client/`)
- **React 19** with **Vite 8**
- **TypeScript 5.7+**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **React Router v7** (`react-router-dom`)
- **Lucide React** (Accessible medical and UI iconography)
- **Framer Motion** (Subtle, calm micro-interactions)
- **Supabase JavaScript Client** (`@supabase/supabase-js`)
- **Cloudinary Client Foundation** (Secure public delivery abstraction)

### Backend (`server/`)
- **Node.js** (v22+)
- **Express.js 4**
- **TypeScript 5.7+** with `tsx` (fast runtime development watch)
- **CORS** & **dotenv** (Centralized environment configuration)
- **Architecture:** Layered Controller-Service-Route structure

### Data & Cloud Infrastructure
- **Database:** Supabase PostgreSQL (with Row Level Security)
- **Authentication:** Supabase Auth (Email / Magic Link / Phone)
- **Image Storage:** Cloudinary (Secure CDN & image optimization)
- **AI Engine:** Google Gemini API (Visual medicine verification & speech understanding)
- **Version Control:** GitHub
- **Deployment:** Vercel

---

## 📁 Folder Structure

```
MedSathi/
├── .env.example               # Root template for all environment variables
├── .gitignore                  # Git ignore rules for node_modules, dist, .env
├── package.json               # Root workspace scripts (convenience runners)
├── README.md                  # Project documentation & Phase 1 architecture
│
├── client/                    # Frontend (React + Vite + TypeScript)
│   ├── .env.example           # Frontend-specific environment template
│   ├── .gitignore             # Frontend git ignore rules
│   ├── index.html             # Application HTML shell with accessibility fonts
│   ├── package.json           # Frontend dependencies & scripts
│   ├── tsconfig.json          # Frontend TypeScript configuration
│   ├── vite.config.ts         # Vite configuration with React & Tailwind plugins
│   └── src/
│       ├── assets/            # Static assets and icons
│       ├── components/        # Reusable UI components
│       │   ├── ui/            # Design system primitives
│       │   │   ├── Badge.tsx         # Soft healthcare status pill badges
│       │   │   ├── Button.tsx        # Motion-enabled accessible buttons
│       │   │   ├── Card.tsx          # Warm, rounded container cards
│       │   │   ├── FlowDiagram.tsx   # Visual Caregiver -> MedSathi -> Patient flow
│       │   │   └── Input.tsx         # High-contrast accessible input field
│       │   ├── Footer.tsx            # Accessible site footer
│       │   └── Navbar.tsx            # Sticky responsive header with navigation
│       ├── config/            # Centralized configuration
│       │   └── env.ts                # Centralized environment access module
│       ├── context/           # React Context providers
│       │   └── AppContext.tsx        # App foundation context
│       ├── hooks/             # Custom React hooks
│       │   └── useHealthCheck.ts     # Hook to check backend health status
│       ├── layouts/           # Application layouts
│       │   └── RootLayout.tsx        # Navbar + Outlet + Footer layout shell
│       ├── pages/             # Route page views
│       │   ├── CaregiverDashboardPage.tsx # /caregiver/dashboard (Placeholder)
│       │   ├── HomePage.tsx               # / (Landing page foundation)
│       │   ├── LoginPage.tsx              # /login (Placeholder)
│       │   ├── NotFoundPage.tsx           # 404 handler
│       │   ├── PatientCompanionPage.tsx   # /patient/:patientId (Mobile-first view)
│       │   └── RegisterPage.tsx           # /register (Placeholder)
│       ├── routes/            # Routing configuration
│       │   └── AppRoutes.tsx         # React Router route registry
│       ├── services/          # Service layer
│       │   ├── api.ts                # API client with health check method
│       │   ├── cloudinary.ts         # Cloudinary delivery & safe upload abstraction
│       │   └── supabase.ts           # Supabase client foundation
│       ├── types/             # Shared TypeScript interfaces
│       │   └── index.ts              # Core types
│       ├── utils/             # Helper utilities
│       │   └── cn.ts                 # Tailwind class merging utility
│       ├── App.tsx            # Root application provider wrapper
│       ├── index.css          # Tailwind CSS styles & typography variables
│       ├── main.tsx           # React entry point
│       └── vite-env.d.ts      # TypeScript environment declarations
│
└── server/                    # Backend (Express + TypeScript)
    ├── .env.example           # Backend-specific environment template
    ├── package.json           # Backend dependencies & scripts
    ├── tsconfig.json          # Backend TypeScript configuration
    ├── app.ts                 # Express application factory & middleware
    ├── index.ts               # Server entry point & graceful shutdown
    ├── config/                # Centralized backend configuration
    │   └── env.ts                    # Central environment configuration
    ├── controllers/           # HTTP Request controllers
    │   └── health.controller.ts      # Health check controller
    ├── middleware/            # Express middleware
    │   ├── errorHandler.ts           # Global error handler
    │   └── logger.ts                 # Request logging middleware
    ├── routes/                # Express API routes
    │   ├── health.routes.ts          # GET /api/health route definition
    │   └── index.ts                  # Central API router (/api/*)
    ├── services/              # Business logic services
    │   └── health.service.ts         # Health check service logic
    ├── types/                 # Backend TypeScript interfaces
    │   └── index.ts                  # Server types & API response formats
    └── utils/                 # Utility functions
        └── response.ts               # Standard API response helpers
```

---

## 🔑 Environment Variables

MedSathi strictly avoids hardcoding secrets or URLs. Configuration is loaded via centralized modules:
- Frontend: `client/src/config/env.ts`
- Backend: `server/config/env.ts`

### `.env.example` Reference:

```bash
# ------------------------------------------
# Frontend Environment Variables (Vite)
# ------------------------------------------
# Supabase (PostgreSQL & Auth)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Cloudinary (Public client values only — NEVER place private secret in client)
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

# Backend API URL for client
VITE_API_BASE_URL=http://localhost:5000/api

# ------------------------------------------
# Backend Server Configuration
# ------------------------------------------
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# ------------------------------------------
# AI Configuration (Phase 3+)
# ------------------------------------------
GEMINI_API_KEY=

# ------------------------------------------
# Backend Cloudinary Credentials (Server-only, never exposed to client)
# ------------------------------------------
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ------------------------------------------
# Backend Supabase Credentials (Server-only)
# ------------------------------------------
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

To configure:
```bash
cp .env.example .env
```

---

## 💻 Frontend Setup & Commands

Navigate to `client/`:
```bash
cd client
npm install
```

Available scripts:
- `npm run dev`: Starts Vite local development server on `http://localhost:5173`
- `npm run build`: Type-checks and compiles production bundle to `dist/`
- `npm run preview`: Locally previews the production build

---

## 🖥 Backend Setup & Commands

Navigate to `server/`:
```bash
cd server
npm install
```

Available scripts:
- `npm run dev`: Runs server with real-time reload via `tsx watch index.ts`
- `npm run build`: Compiles TypeScript to `dist/` using `tsc`
- `npm run start`: Runs compiled server from `dist/index.js`

### Health Endpoint
- **Method:** `GET`
- **Path:** `/api/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "medsathi-api"
  }
  ```

---

## 🚀 How to Run

### Method 1: Independent Terminals (Recommended during development)

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
*API will be listening at http://localhost:5000 (Health check: http://localhost:5000/api/health)*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Frontend will be running at http://localhost:5173*

### Method 2: From Workspace Root

```bash
# Start frontend
npm run dev:client

# Start backend (in another window)
npm run dev:server

# Build both frontend and backend
npm run build

# Run unit and integration tests
npm test
```

---

## 🔐 Phase 2: Caregiver Authentication & Supabase RLS

Phase 2 introduces secure caregiver authentication, session management, profile storage, and Row Level Security isolation.

### 🌟 What is Implemented & Verified in Phase 2:
1. **Supabase Auth Integration:**
   - Email and password caregiver registration (`authService.signUp`).
   - Secure login (`authService.signIn`) and logout (`authService.signOut`).
   - Session persistence across page reloads using `@supabase/supabase-js` auth listeners.
   - User metadata preservation (`full_name`, `role`, `age`, `phone`, `relationship_to_patient`).
2. **Empathetic Error Handling:**
   - Friendly healthcare-oriented messages for invalid credentials, weak passwords, duplicate emails, unconfirmed emails, network failures, and rate limits.
   - Comprehensive client-side form validation (email format, password matching, length >= 6, age boundaries 18–110, phone digit validation).
3. **Caregiver Profile Record & Auto-Healing:**
   - Dedicated `public.profiles` PostgreSQL table linked to `auth.users(id)` with `on delete cascade`.
   - `ProfileService` for creating, reading, and updating caregiver profile records.
   - Auto-healing in `AuthContext` to ensure profile records are automatically provisioned even if email confirmation was required during signup.
4. **Route Protection & Session Guard:**
   - `ProtectedRoute` wrapper guarding `/caregiver/dashboard`.
   - Animated session verification loading spinner during auth hydration.
   - Redirect to intended destination after login (`state.from.pathname`).
   - Automatic redirection for authenticated users away from `/login` and `/register`.
5. **Dynamic Navigation & Badges:**
   - Navbar dynamically renders caregiver name, active session pill badge, and accessible logout trigger.
   - Mobile navigation drawer includes caregiver session details and quick actions.
6. **Automated Testing Suite:**
   - Vitest test suite (`npm test`) covering `authService` error translation, `profileService` fallbacks, and boundary conditions.

---

## 👥 Phase 3: Patient Management & Multi-Caregiver Access

Phase 3 implements patient profile creation, caregiver-patient relationships, multi-caregiver access, Cloudinary image integration, and strict Row Level Security (RLS).

### 🌟 Core Architectural Rules & Features:
1. **Caregivers Authenticate, Patients Do Not:**
   - Patients do not have Supabase Auth accounts and do not register/log in.
   - The Caregiver is the authenticated entity managing one or more patients.
   - A single caregiver can manage multiple patients.
2. **Primary Caregiver Rule:**
   - The caregiver who creates the patient record is automatically designated as the **Primary Caregiver** (`is_primary = true`).
   - Only the Primary Caregiver has permission to update patient profile details, remove secondary caregivers, or delete the patient profile.
3. **Multi-Caregiver Collaboration (Care Circle):**
   - A patient can have **at most 3 caregivers**.
   - The Primary Caregiver can invite other caregivers by their registered MedSathi email address.
   - If the caregiver account does not exist, the system informs the user: *"This caregiver does not have a MedSathi account yet."*
   - Duplicate caregiver assignments and assignments exceeding 3 caregivers are blocked at both database and service levels.
4. **Required Patient Information:**
   - Patient Name (required, trimmed, min 2 characters).
   - Patient Age (required, 1–125 integer).
   - Patient Photo (strictly required, uploaded to Cloudinary).
5. **Secure Cloudinary Architecture:**
   - `CLOUDINARY_API_SECRET` is kept strictly on the backend Express server (`server/services/cloudinary.service.ts`).
   - The client uploads through `POST /api/upload/patient-photo` which validates file types (`jpg`, `jpeg`, `png`, `webp`) and sizes (max 5MB).
   - Failed patient creation initiates automatic cleanup of orphaned uploads via `DELETE /api/upload/patient-photo/:publicId`.
6. **Protected Patient Companion Route (`/patient/:patientId`):**
   - Protected by `ProtectedRoute`.
   - Checks that the authenticated caregiver is assigned to the patient; blocks unrelated caregivers.
   - Features a clear milestone notice: *"Medication guidance will be introduced in a future phase."*

### 🚫 Phase 3 Boundaries (Deferred to Subsequent Phases):
- Medication creation & schedules (Phase 4)
- Dosage & meal routine builders (Phase 4)
- Gemini AI vision (pill bottle label verification) (Phase 4)
- Spoken voice companion & speech-to-text (Phase 4)
- Adherence logging & missed-dose alerts (Phase 4)

---

## 🗄 Database Schema & Migrations

### Migrations:
1. `supabase/migrations/20260925000000_create_profiles_table.sql` (Caregiver Profiles)
2. `supabase/migrations/20260927000000_create_patient_management.sql` (Patients & Caregiver Relationships)

### Table: `public.profiles` (Caregiver Account Record)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, `default gen_random_uuid()` | Unique record identifier |
| `user_id` | `uuid` | Unique, Not Null, References `auth.users(id) on delete cascade` | Linked Supabase Auth UID |
| `role` | `text` | Not Null, `default 'caregiver' check (role in ('caregiver'))` | Access role |
| `full_name` | `text` | Not Null | Caregiver's full name |
| `age` | `integer` | Check `(age is null or (age > 0 and age < 130))` | Caregiver age |
| `phone` | `text` | Nullable | Contact number |
| `relationship_to_patient` | `text` | Nullable | e.g. "Daughter", "Son", "Spouse" |
| `created_at` | `timestamptz` | Not Null, `default now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | Not Null, `default now()` | Auto-updated via trigger |

### Table: `public.patients`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, `default gen_random_uuid()` | Unique patient identifier |
| `full_name` | `text` | Not Null, `check (length(trim(full_name)) > 0)` | Patient's full name |
| `age` | `integer` | Not Null, `check (age > 0 and age < 130)` | Patient's age |
| `photo_url` | `text` | Not Null, `check (length(trim(photo_url)) > 0)` | Cloudinary photo URL |
| `photo_public_id` | `text` | Nullable | Cloudinary asset identifier |
| `created_at` | `timestamptz` | Not Null, `default now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | Not Null, `default now()` | Auto-updated via trigger |

### Table: `public.caregiver_patients` (Junction Table)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, `default gen_random_uuid()` | Relationship identifier |
| `caregiver_user_id` | `uuid` | Not Null, References `auth.users(id) on delete cascade` | Caregiver Auth UID |
| `patient_id` | `uuid` | Not Null, References `public.patients(id) on delete cascade` | Patient identifier |
| `is_primary` | `boolean` | Not Null, `default false` | Primary caregiver designation |
| `created_at` | `timestamptz` | Not Null, `default now()` | Assignment timestamp |

- **Unique Constraint:** `(caregiver_user_id, patient_id)` prevents duplicate caregiver relationships.
- **Partial Unique Index:** `idx_unique_primary_caregiver_per_patient` on `(patient_id) where (is_primary = true)` guarantees exactly one primary caregiver per patient.
- **Database Trigger:** `check_max_caregivers_per_patient()` strictly limits each patient to a maximum of 3 caregivers.

### Row Level Security (RLS) Policies
- **`public.patients`:**
  - `SELECT`: `using (public.is_caregiver_for_patient(id))` — Caregivers can only view patients assigned to them.
  - `INSERT`: `to authenticated with check (true)` — Authenticated caregivers can create patient records.
  - `UPDATE`: `using (public.is_primary_caregiver(id))` — Only the Primary Caregiver can update patient info.
  - `DELETE`: `using (public.is_primary_caregiver(id))` — Only the Primary Caregiver can delete patient records.
- **`public.caregiver_patients`:**
  - `SELECT`: `using (caregiver_user_id = auth.uid() or public.is_caregiver_for_patient(patient_id))` — Caregivers see their own relationships and fellow caregivers in the same patient's care circle.
  - `INSERT`: Allowed when creator self-assigns as primary or when primary caregiver adds a secondary caregiver (`is_primary = false`).
  - `DELETE`: `using (public.is_primary_caregiver(patient_id) and is_primary = false)` — Primary caregiver can remove secondary caregivers.

---

## 🗺 Future Phases Roadmap

- **Phase 4: Medication Management, Gemini Vision & Spoken Voice Companion**
  - Medication routine builder (frequency, dosage, time slots, meal timing)
  - Gemini API vision integration for bottle label recognition and verification
  - Spoken conversational interface with multi-dialect support (Hindi, English)
  - Audio playback with friendly tone and speech cadence for elderly comprehension
  - Real-time dose adherence logging and caregiver alerts


