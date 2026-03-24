# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Overview

A barbershop management application built with Next.js 16.2.0, React 19.2.4, TypeScript, and Supabase. Uses JWT-based authentication with bcrypt password hashing.

## Architecture

### Framework Notes

**Next.js 16.2.0 has breaking changes** — APIs, conventions, and file structure differ from earlier versions. Consult `node_modules/next/dist/docs/` for accurate reference. This applies especially to:
- Async cookies/headers APIs
- Route handlers in App Router
- SSR patterns with `@supabase/ssr`

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── login/route.ts      # POST /api/login - JWT auth
│   │   └── register/route.ts   # POST /api/register - user creation
│   ├── login/
│   │   └── page.tsx            # Client login form
│   ├── register/
│   │   └── page.tsx            # Client registration form
│   ├── dashboard/
│   │   └── page.tsx            # Protected dashboard with logout
│   ├── layout.tsx              # Root layout with Geist font
│   ├── page.tsx                # Home page with auth links
│   └── globals.css             # Tailwind v4 imports
├── lib/
│   ├── auth/
│   │   ├── jwt.ts              # JWT signing (server-only)
│   │   └── client.ts           # Client-side auth (localStorage)
│   └── supabase/
│       ├── admin.ts            # Service role client (server-only)
│       ├── server.ts           # SSR client with cookie handling
│       └── browser.ts          # Browser client
└── supabase/                 # SQL migrations
    ├── 001_app_users.sql
    └── 002_add_password_hash_column.sql
```

### Authentication Architecture

Three Supabase clients for different contexts:
1. **Admin client** (`@/lib/supabase/admin`): Uses service role key for database operations in API routes. Imported with `"server-only"` directive.
2. **Server client** (`@/lib/supabase/server`): For SSR with cookie-based session management. Handles read-only cookie store via async `cookies()`.
3. **Browser client** (`@/lib/supabase/browser`): For client-side Supabase operations.

**JWT Auth flow**: API routes validate credentials against Supabase, then issue signed JWT tokens using `jsonwebtoken`. Tokens include `sub` (user id) and `email`.

**Client-side auth** (`@/lib/auth/client`): Utilities for browser-side auth:
- `saveToken(token)` / `getToken()` / `removeToken()` - localStorage operations
- `login(email, password)` - POST to `/api/login`, stores token on success
- `register(email, password)` - POST to `/api/register`, stores token on success
- `logout()` - removes token and redirects to `/login`
- `isAuthenticated()` - checks if token exists in localStorage

**Auth pages**:
- `/login` - Client form with email/password, redirects to `/dashboard` on success
- `/register` - Client form with email/password/confirm, redirects to `/dashboard` on success
- `/dashboard` - Protected page (client-side auth check), displays logout button

### Key Patterns

- **Path alias**: `@/*` maps to `./src/*` (configured in tsconfig.json)
- **Server-only code**: Files using server secrets import `"server-only"` to prevent accidental client bundling
- **Validation**: Zod schemas for API input validation (see `LoginSchema` and `RegisterSchema` in route files)
- **Error handling**: API routes return JSON with structured error codes (`INVALID_JSON`, `INVALID_INPUT`, `DB_SCHEMA_ERROR`, `EMAIL_ALREADY_EXISTS`, `INVALID_CREDENTIALS`)
- **Bcrypt**: Password hashing with `bcrypt.hash(password, 10)` and `bcrypt.compare()`

### Database Schema

Table `public.app_users`:
- `id`: uuid primary key
- `email`: text (unique, case-insensitive via `ilike` queries)
- `password_hash`: text (bcrypt)
- `created_at`: timestamptz

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (optional, defaults to "7d")

### Dependencies

- `@supabase/ssr` and `@supabase/supabase-js` for database
- `bcryptjs` for password hashing
- `jsonwebtoken` for tokens
- `zod` for validation
- `tailwindcss` v4 with `@import "tailwindcss"` syntax
- `next/font` with Geist font family
