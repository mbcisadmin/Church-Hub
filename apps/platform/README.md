# Apps Platform

Internal tools platform for church staff and volunteers.

## Overview

This is the main apps platform that hosts multiple micro-apps under a single
domain (e.g., `apps.church.org`). Each micro-app is independently installable as
a PWA.

**Live URL:** `apps.church.org`

## Included Micro-Apps

- **Counter** (`/counter`) - Event metrics input tool for tracking attendance

## Tech Stack

- Next.js 15 with App Router
- NextAuth.js v5 with MinistryPlatform OAuth
- Shadcn/UI components
- Tailwind CSS v4
- PWA support (each micro-app installable independently)

## Shared Packages

This app uses shared packages from the monorepo:

- `@church/ministry-platform` - MP API client
- `@church/database` - Zod schemas
- `@church/nextjs-auth` - NextAuth configuration
- `@church/nextjs-ui` - UI components

## Development

### Prerequisites

- Node.js 20+
- MinistryPlatform instance with OAuth configured

### Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Copy environment variables:**

   ```bash
   cp .env.example .env
   ```

3. **Configure .env:**

   ```env
   MINISTRY_PLATFORM_BASE_URL=https://your-church.ministryplatform.com
   MINISTRY_PLATFORM_CLIENT_ID=your-client-id
   MINISTRY_PLATFORM_CLIENT_SECRET=your-client-secret
   NEXTAUTH_SECRET=# Generate with: openssl rand -base64 32
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run development server:**

   ```bash
   npm run dev
   ```

5. **Open:** http://localhost:3000

### Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Protected routes (requires auth)
│   │   ├── counter/        # Counter micro-app
│   │   ├── layout.tsx      # App shell with navigation
│   │   └── page.tsx        # Dashboard/home
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth routes
│   │   └── counter/        # Counter API endpoints
│   ├── signin/             # Public sign-in page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── middleware.ts           # Route protection
└── ...
```

## Authentication

Uses NextAuth.js v5 with MinistryPlatform OAuth:

- **Session:** JWT-based
- **Token refresh:** Automatic
- **Roles:** Fetched from MP Security Roles + User Groups
- **Protection:** Middleware protects all routes except `/signin` and
  `/api/auth`

## Adding a New Micro-App

1. **Create route folder:**

   ```bash
   mkdir src/app/(app)/my-app
   ```

2. **Create page:**

   ```typescript
   // src/app/(app)/my-app/page.tsx
   import { auth } from '@church/nextjs-auth';

   export default async function MyApp() {
     const session = await auth();
     return <div>My App</div>;
   }
   ```

3. **Add API routes (if needed):**

   ```bash
   mkdir src/app/api/my-app
   ```

4. **Add to navigation:** Update `src/app/(app)/layout.tsx` to include link

5. **Configure as PWA:** Each micro-app can have its own manifest and be
   installed independently

## PWA Configuration

Each micro-app is independently installable:

- `apps.church.org/counter` - Counter app
- `apps.church.org/my-app` - Your new app

Users can install just the apps they need.

## Deployment

### Vercel

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy:**
   - Framework: Next.js
   - Root Directory: `apps/platform`
   - Build Command: Auto-detected
   - Install Command: `npm install` (runs from monorepo root)

### Domain

Point `apps.church.org` to Vercel deployment.

## MinistryPlatform Setup

### OAuth Client

Create OAuth client in MP Admin Console:

- **Client ID & Secret:** Use in environment variables
- **Redirect URI:** `https://apps.church.org/api/auth/callback/ministryplatform`
- **Scopes:**
  `openid offline_access http://www.thinkministry.com/dataplatform/scopes/all`

### Required Stored Procedure

Create `api_Custom_GetUserRolesAndGroups_JSON` for role fetching:

```sql
-- Returns JSON with Security Roles + User Groups
-- See database/customizations/ for implementation
```

### Counter App Requirements

The Counter app requires:

- **Custom Table:** `Event_Metrics`
- **View:** Events with congregations
- **Metrics table:** Metric types (head count, guests, etc.)

See `database/customizations/` for SQL definitions.

## Troubleshooting

### Auth not working

- Check MP OAuth redirect URIs
- Verify environment variables
- Check `NEXTAUTH_SECRET` is set

### Build errors

- Ensure all `@church/*` packages are installed
- Run `npm install` from monorepo root
- Check TypeScript errors: `npm run lint`

### Counter app not loading data

- Verify `Event_Metrics` table exists in MP
- Check stored procedures are registered in MP
- Verify user has permissions to view events

## Support

Internal tool - Contact your developer for assistance.
