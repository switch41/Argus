# Supabase Setup (Safe Travel ID)

Follow these steps in order.

## 1) Create a Supabase project

1. Go to [Supabase](https://supabase.com) and create a new project.
2. Wait until the database is fully provisioned.

## 2) Enable auth providers used by this app

In Supabase Dashboard:

1. Open `Authentication` -> `Providers`.
2. Enable `Email` provider.
3. Keep email confirmation enabled (OTP flow works with this).
4. Enable `Anonymous Sign-Ins` (this app uses guest login).

## 3) Run database bootstrap SQL

1. Open `SQL Editor` in your Supabase project.
2. Copy all content from `supabase_setup.sql`.
3. Run it once.

This creates tables, RLS policies, profile auto-creation trigger, indexes, and realtime subscription for alerts.

## 4) Configure app environment

Create/update `.env` in project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Where to find values:
- `Project Settings` -> `API` -> `Project URL`
- `Project Settings` -> `API` -> `anon` `public` key

## 5) Install dependencies and run app

```bash
pnpm install
pnpm dev
```

Optional backend gateway (for Fabric mock endpoints):

```bash
pnpm server
```

## 6) First login sanity check

1. Open app and go to `/auth`.
2. Sign in using email OTP, or click `Continue as Guest`.
3. Confirm you reach dashboard without RLS errors.
4. Create a tourist profile from `/register`.

## 7) Promote an account to admin (optional)

Run in SQL Editor (replace with your auth user id):

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_USER_UUID';
```

## Common issues

- `Missing Supabase credentials` in console:
  - `.env` missing keys or Vite not restarted after env change.
- `new row violates row-level security policy`:
  - `supabase_setup.sql` not run in this project, or run failed halfway.
- OTP not arriving:
  - Check `Authentication` -> `Logs` and SMTP settings.
- Guest login fails:
  - Ensure `Anonymous Sign-Ins` is enabled.

