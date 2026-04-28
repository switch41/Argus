# 🛡️ Argus

> Advanced tourist safety platform with Supabase auth/data, geofencing, SOS broadcasting, tactical monitoring, and Hyperledger Fabric integration points.

---

## Overview

Argus is a role-based travel safety platform for tourists, officials, and administrators. It supports guest access, email OTP sign-in, digital tourist registration, SOS dispatch, signal history, geofence visibility, official tactical monitoring, and a Fabric-backed identity issuance flow.

---

## Features

### Tourist Experience
- Email OTP sign-in and guest mode
- Dashboard access for guests with Digital ID creation restricted until email sign-in
- Digital tourist registration with passport, emergency contacts, and itinerary details
- SOS broadcasting with GPS coordinates
- Signal archive and notifications
- Location sharing, itinerary, profile, and offline translator flows

### Official / Authority Experience
- Live tactical alert stream
- Assign-unit workflow for active alerts
- Tactical detail page for alerts
- High authority dashboard for `admin` and `tourism_official`
- Heatmap showing tourist telemetry, geofences, and active SOS markers
- Geofence creation tools and advisory workflows

### Notifications & Geofencing
- Tourists receive notifications when new geofence zones are created
- Signal archive merges alert-backed and notification-backed entries
- Geofencing spots are visible to all users

### Blockchain / Fabric
- Digital ID issuance endpoint
- Verification and governance mock endpoints
- Admin Fabric console for testing gateway operations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4, shadcn/ui |
| Auth | Supabase Auth |
| Database | Supabase Postgres |
| Backend Gateway | Express + tsx |
| Blockchain | Hyperledger Fabric |
| Charts / UI | Recharts, Lucide, Sonner, Framer Motion |

---

## Project Structure

```text
argus/
├── public/                      # Logos / static assets / favicon
├── server/                      # Express Fabric mock gateway
├── chaincode/                   # Hyperledger Fabric chaincode
├── src/
│   ├── components/
│   │   ├── auth/                # Supabase provider + protected route helpers
│   │   ├── dashboard/           # Heatmap, analytics, incidents, geofence tools
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/
│   │   └── use-auth.ts          # Supabase-backed auth abstraction
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client helpers
│   │   └── offline-manager.ts   # Offline queue helpers
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── TouristRegistration.tsx
│   │   ├── Emergency.tsx
│   │   ├── Notifications.tsx
│   │   ├── HighAuthority.tsx
│   │   ├── AdminFabric.tsx
│   │   ├── AlertDetail.tsx
│   │   └── ...
│   └── App.tsx
├── supabase_setup.sql
├── supabase_schema.sql
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- A Supabase project

### Install and run

```bash
git clone <repository-url>
cd argus
pnpm install
```

Create `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Run the frontend:

```bash
pnpm dev
```

Run the backend gateway:

```bash
pnpm run server
```

---

## Supabase Setup

Run `supabase_setup.sql` in Supabase SQL Editor. It creates:

- profiles
- tourist profiles
- alerts
- notifications
- geo fences
- itineraries
- device signals
- advisories
- cases and case messages
- RLS policies
- realtime publication setup for alerts

Also enable:

- Email auth
- Anonymous sign-ins if guest mode is needed

If you want OTP emails instead of magic links, set the Supabase email template to use:

```html
{{ .Token }}
```

instead of `{{ .ConfirmationURL }}`.

---

## Authentication

Argus supports:

| Mode | Behavior |
|------|----------|
| Email OTP | Sign in with email code |
| Guest / Anonymous | Access dashboard without full registration |

### Guest restrictions

- Guest users can access the dashboard
- Guest users cannot create a Digital ID
- `Verify Identity Now` redirects guests to `/auth`
- Direct `/register` access is blocked for guests

### Role access

| Role | Access |
|------|--------|
| tourist | Tourist dashboard and self-service features |
| police | Official dashboard monitoring |
| tourism_official | Official dashboard, high authority view, tactical controls |
| admin | Full tactical controls and admin tools |

---

## Key Workflows

### Registration

```text
/auth -> email OTP or guest
  -> dashboard
  -> authenticated user selects Verify Identity Now
  -> /register
  -> tourist profile saved in Supabase
  -> Fabric gateway issues digital ID hash
```

### SOS

```text
Dashboard / Emergency page
  -> capture GPS
  -> create critical panic alert
  -> create device signal
  -> create tourist notification
  -> alert appears in signal archive
  -> alert appears on authority heatmap
```

### Geofencing

```text
Admin / tourism_official creates geofence
  -> zone visible on shared map
  -> tourists see geofencing spots
  -> tourists receive notification about new zone
```

### Tactical Monitoring

```text
Official dashboard
  -> Tactical Alert Stream updates in real time
  -> admin / tourism_official can open Tactical View
  -> admin / tourism_official can assign unit
```

---

## Hyperledger Fabric Integration

The Express gateway in `server/index.ts` exposes mock Fabric-facing routes:

- `/api/issue-id`
- `/api/verify-id`
- `/api/reveal-data`
- `/api/update-governance`
- `/api/audit-logs`
- `/api/link-wallet`
- `/api/get-wallet`

These are development-friendly integration points for the frontend and can be replaced with real Fabric SDK-backed logic later.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend dev server |
| `pnpm run server` | Start Express backend gateway on port 3001 |
| `pnpm build` | Build frontend |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Run Prettier |

---

## License

This project is proprietary. All rights reserved.

---

<p align="center">
  <strong>Built with 🍀 by Team FourLeaf</strong>
</p>
