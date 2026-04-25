# 🛡️ Safe Travel ID

> **Advanced Tourist Safety Management System** — Blockchain-secured digital identity, AI-powered risk assessment, and real-time emergency response for comprehensive tourist safety.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Application Workflows](#application-workflows)
- [Hyperledger Fabric Integration](#hyperledger-fabric-integration)
- [Authentication](#authentication)
- [Team](#team)

---

## Overview

Safe Travel ID is a comprehensive, real-time tourist safety management platform that combines blockchain-secured digital identity verification, AI-powered risk assessment, and instant emergency response. It serves three stakeholder groups — **tourists**, **law enforcement**, and **tourism officials** — through a unified, role-based dashboard with live alerts, case management, and analytics.

---

## Features

### 🪪 Digital Tourist ID
- Blockchain-secured (Hyperledger Fabric) digital identity issuance and verification
- Passport-based registration with emergency contact storage
- On-chain hash for tamper-proof identity validation

### 🗺️ Real-Time Location Tracking
- GPS-based location sharing with accuracy metrics
- Geo-fence zone management (safe / restricted / high-risk / emergency services)
- Route deviation detection from planned itineraries

### 🚨 Emergency Response System
- **One-tap PANIC button** with instant GPS-tagged alerts to authorities
- Automatic E-FIR (Electronic First Information Report) generation
- Case management with priority-based assignment to officers
- Two-way communication between tourists and response units

### 📊 AI-Powered Safety Scoring
- Dynamic 0–100 safety score computed from multiple risk factors:
  - Location risk · Behavior patterns · Time of day · Crowd density · Weather conditions
- Per-area risk flags on itinerary waypoints
- Risk level classification: Safe → Moderate → High Risk → Critical

### 👥 Multi-Stakeholder Dashboards
- **Tourist Dashboard**: Safety score, itinerary management, quick actions, alerts, offline translator
- **Officer/Admin Dashboard**: Live alert feed, alert statistics, heatmap visualization, IoT signal monitoring, incident board, analytics charts, advisory management

### 🌐 Offline-First Capabilities
- Offline mutation queue with automatic background sync when connectivity resumes
- Edge AI-powered offline translator with pre-loaded safety phrases (Hindi, Spanish, French)
- Network status indicator across the app

### 📢 Advisory & Notification System
- Travel advisories targeted by audience (all / tourists / officials) and geographic area
- Real-time notification center with categorized alerts (alert, safety update, system, emergency)
- Toast notifications for all user-facing actions

### 📈 Analytics & Monitoring
- System-wide statistics: active tourists, alert counts, response times, safety averages
- IoT device signal tracking (SOS, vitals, location)
- Heatmap of incident clusters
- Audit logging for all administrative actions

### 🌍 Multi-Language Support
- Auth flow available in English, Spanish, and Hindi
- Offline translator with quick-access safety phrase cards

### ☁️ Live Weather Integration
- Real-time local weather on the landing page via Open-Meteo API
- Temperature, wind speed, and weather condition display

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 6 |
| **Routing** | React Router v7 |
| **Styling** | Tailwind CSS v4, shadcn/ui (New York style) |
| **Animations** | Framer Motion |
| **3D Graphics** | Three.js, React Three Fiber, Drei |
| **Icons** | Lucide React |
| **Backend & Database** | Convex (real-time serverless) |
| **Authentication** | Convex Auth (Email OTP + Anonymous) |
| **Blockchain** | Hyperledger Fabric (Digital ID issuance & verification) |
| **Toasts** | Sonner |
| **Charts** | Recharts |
| **Package Manager** | pnpm |

---

## Project Structure

```
safe-travel-id/
├── public/                      # Static assets (logos)
├── src/
│   ├── App.tsx                  # Root component — providers + routing
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Tailwind + theme variables
│   ├── instrumentation.tsx      # Error boundary & error handling
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (46 components)
│   │   ├── dashboard/           # Dashboard cards (Heatmap, IoT, Analytics, etc.)
│   │   └── LogoDropdown.tsx     # Logo component
│   ├── convex/
│   │   ├── schema.ts            # Full database schema (16 tables)
│   │   ├── auth.ts              # Auth configuration
│   │   ├── auth/emailOtp.ts     # Email OTP provider
│   │   ├── tourists.ts          # Tourist CRUD, safety scores, itineraries
│   │   ├── alerts.ts            # Alert management, panic button
│   │   ├── cases.ts             # Case management
│   │   ├── fabric.ts            # Hyperledger Fabric integration
│   │   ├── users.ts             # User management
│   │   ├── notifications.ts     # Notification system
│   │   ├── advisories.ts        # Travel advisories
│   │   ├── analytics.ts         # System statistics
│   │   ├── devices.ts           # IoT device signals
│   │   ├── messages.ts          # Two-way messaging
│   │   ├── audit.ts             # Audit logging
│   │   ├── exports.ts           # Data export
│   │   └── seed.ts              # Seed data
│   ├── pages/
│   │   ├── Landing.tsx          # Landing page with hero, features, weather
│   │   ├── Auth.tsx             # Email OTP + anonymous + multi-language auth
│   │   ├── Dashboard.tsx        # Role-based dashboard (tourist / officer / admin)
│   │   ├── TouristRegistration.tsx  # Digital ID registration form
│   │   ├── Profile.tsx          # User profile management
│   │   ├── Emergency.tsx        # PANIC button with GPS + map
│   │   ├── Itinerary.tsx        # Trip itinerary planning
│   │   ├── LocationShare.tsx    # Location sharing
│   │   ├── Notifications.tsx    # Notification center
│   │   ├── Translator.tsx       # Offline AI translator
│   │   ├── AdminFabric.tsx      # Blockchain admin panel
│   │   └── NotFound.tsx         # 404 page
│   ├── hooks/
│   │   ├── use-auth.ts          # Authentication hook
│   │   └── use-mobile.ts        # Mobile detection
│   ├── lib/
│   │   ├── utils.ts             # cn() utility (clsx + twMerge)
│   │   └── offline-manager.ts   # Offline queue & sync manager
│   └── types/                   # TypeScript type definitions
├── chaincode/                   # Hyperledger Fabric chaincode
├── package.json
├── vite.config.ts
├── convex.json
├── vercel.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (recommended package manager)
- A **Convex** account ([convex.dev](https://convex.dev))

### Installation

```bash
# Clone the repository
git clone https://github.com/fourleaf/safe-travel-id.git
cd safe-travel-id

# Install dependencies
pnpm install

# Set up environment variables (see section below)
cp .env.example .env

# Start the Convex backend
npx convex dev

# In a separate terminal, start the frontend
pnpm dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### Client-Side (`.env`)

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment
```

### Convex Server (Dashboard → Settings → Environment Variables)

```env
# Authentication
JWKS=<your-jwks>
JWT_PRIVATE_KEY=<your-jwt-private-key>
SITE_URL=<your-site-url>

# Hyperledger Fabric (optional)
CONNECTION_PROFILE_PATH=/path/to/connection-profile.yaml
WALLET_PATH=/path/to/wallet
FABRIC_IDENTITY_LABEL=appUser
FABRIC_CHANNEL=mychannel
FABRIC_CHAINCODE=SafeTourContract
FABRIC_SDK_DISCOVERY=true
DISCOVERY_AS_LOCALHOST=true
```

---

## Application Workflows

### 1. Tourist Registration Flow

```
Landing Page → Sign In / Sign Up (Email OTP or Guest)
    → Dashboard → "Create Digital ID"
    → Fill Tourist Registration Form
        (Passport, Nationality, Entry Point, Duration,
         Emergency Contacts, Medical Conditions)
    → Digital Tourist ID issued (on-chain hash via Fabric or local fallback)
    → Dashboard unlocks full safety features
```

### 2. Emergency Response Flow

```
Tourist triggers PANIC button (Dashboard or floating SOS)
    → GPS location acquired automatically
    → Optional: Tourist adds emergency description
    → Alert created with severity "critical" + type "panic_button"
    → Alert appears in Officer Dashboard → Live Alert Feed
    → Officer assigns alert to available unit
    → Case created → Investigation → Resolution
    → E-FIR automatically generated with incident details
    → Tourist notified of resolution
```

### 3. Safety Scoring & Itinerary Flow

```
Tourist creates itinerary (waypoints + dates)
    → System calculates per-area risk assessment
    → Dynamic safety score (0–100) computed from:
        Location Risk + Behavior + Time of Day + Crowd + Weather
    → Risk flags displayed per itinerary waypoint
    → Geo-fence monitoring begins for active itinerary
    → Route deviation → automatic alert to authorities
```

### 4. Officer / Admin Workflow

```
Officer logs in → Safety Control Center
    → View live alert feed (filterable by severity)
    → Assign alerts to units
    → Case management: open → assigned → investigating → resolved → closed
    → View heatmap of incident clusters
    → Monitor IoT signals (SOS, vitals, location)
    → Create travel advisories (targeted by audience + area)
    → Review analytics: active tourists, response times, alert trends
    → Audit log for all administrative actions
```

### 5. Offline Workflow

```
Tourist loses connectivity
    → App detects offline state → shows "Offline Mode" indicator
    → Mutations queued locally (localStorage)
    → Tourist can still use:
        - Offline Translator (pre-loaded safety phrases)
        - SOS (queued for when back online)
    → Connectivity restored → automatic background sync
    → Toast: "All offline actions successfully synced!"
```

### 6. Authentication Flow

```
User opens /auth
    → Choose language (English / Spanish / Hindi)
    → Enter email → OTP sent (server console in dev)
    → Enter 6-digit OTP → verified → redirect to dashboard
    OR
    → "Continue as Guest" → anonymous session → dashboard
```

### 7. Blockchain Verification Flow

```
Admin opens /admin/fabric
    → View all tourist profiles with Digital ID hashes
    → "Verify on Chain" → queries Hyperledger Fabric
    → Returns on-chain validity status
    → Discrepancies flagged for manual review
```

---

## Hyperledger Fabric Integration

Server actions in `src/convex/fabric.ts` integrate with a Hyperledger Fabric network:

- **Issuance**: When a tourist profile is created, `fabric.issueDigitalId` is called to store an on-chain hash. Falls back to a local `DID_...` placeholder if Fabric is unavailable.
- **Verification**: `fabric.verifyDigitalIdOnChain` reconciles database state with on-chain validity.
- **Chaincode**: Must implement `IssueDigitalId`, `VerifyDigitalId`, and related functions.

See `chaincode/` directory for the Fabric chaincode source.

---

## Authentication

### Setup

Authentication is fully configured using **Convex Auth** with two providers:

| Provider | Description |
|----------|-------------|
| **Email OTP** | 6-digit code sent to email (console-logged in dev mode) |
| **Anonymous** | Instant guest access with limited permissions |

### Frontend Usage

```typescript
import { useAuth } from "@/hooks/use-auth";

const { isLoading, isAuthenticated, user, signIn, signOut } = useAuth();
```

### Role-Based Access

| Role | Access Level |
|------|-------------|
| `tourist` / `user` | Tourist dashboard, self-service features |
| `police` | Officer dashboard, alert management, cases |
| `tourism_official` | Officer dashboard + advisory creation |
| `admin` | Full system governance, Fabric admin, analytics |

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | TypeScript check + production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |

---

## License

This project is proprietary. All rights reserved.

---

<p align="center">
  <strong>Built with 🍀 by Team FourLeaf</strong>
</p>
