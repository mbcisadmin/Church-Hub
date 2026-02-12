# Microsite Template

Template for creating standalone Next.js applications for public-facing church
websites.

## What is a Microsite?

Microsites are **separate Next.js applications** deployed to their own domains:

- Live at: `groups.yourchurch.org`, `events.yourchurch.org`, etc.
- Standalone deployment (separate Vercel project)
- Public-facing (congregation + visitors)
- Optional authentication

## When to Use This Template

Use this template when building:

- ✅ Groups directory and registration
- ✅ Event calendar and sign-ups
- ✅ Volunteer/serve portal
- ✅ Giving/donation pages
- ✅ Resource libraries

**Don't use for:**

- ❌ Internal staff tools → Use `templates/micro-app/`
- ❌ Embeddable components → Use `templates/widget/`

## How to Use

### Option 1: Claude Skill (When Available)

```bash
/new-microsite
```

### Option 2: Manual Creation

```bash
# Copy template to microsites directory
cp -r templates/microsite microsites/groups

# Navigate and install
cd microsites/groups
npm install

# Configure
cp .env.example .env
# Edit .env with church-specific settings

# Develop
npm run dev
```

## Template Structure (To Be Built)

When this template is created, it will include:

```
templates/microsite/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Home page
│   │   ├── [slug]/
│   │   │   └── page.tsx       # Detail page (group, event, etc.)
│   │   └── api/
│   │       └── route.ts       # API endpoints
│   ├── components/
│   │   ├── Header.tsx         # Public header
│   │   ├── Footer.tsx         # Public footer
│   │   └── SearchFilter.tsx   # Search/filter UI
│   └── lib/
│       └── data.ts            # Data fetching helpers
├── public/
│   └── images/
├── .env.example
├── package.json
├── next.config.ts
└── README.md
```

## Standard Microsite Features

Every microsite should include:

- **Public layout** - Header, footer, navigation
- **SEO optimization** - Metadata, Open Graph tags
- **Responsive design** - Mobile-first
- **Search/filter** - Find groups, events, etc.
- **Detail pages** - Individual group/event info
- **Registration forms** - Sign up, RSVP
- **MinistryPlatform integration** - Read/write data to MP

## Deployment

Each microsite deploys separately:

1. **Create Vercel project**
   - Root directory: `microsites/groups`
   - Build command:
     `cd ../.. && npm run build --filter=@church/groups-microsite`

2. **Environment variables** (use team-wide)
   - `MINISTRY_PLATFORM_BASE_URL`
   - `MINISTRY_PLATFORM_CLIENT_ID`
   - `MINISTRY_PLATFORM_CLIENT_SECRET`
   - `NEXTAUTH_URL=https://groups.yourchurch.org`
   - `NEXTAUTH_SECRET` (unique per microsite)

3. **Custom domain**
   - Add: `groups.yourchurch.org`
   - Configure DNS CNAME

## Authentication

Microsites can optionally use NextAuth:

```typescript
// Optional: protect certain routes
import { auth } from '@church/nextjs-auth';

export default async function MyGroupPage() {
  const session = await auth(); // null if not logged in

  // Show different content for logged-in users
  if (session?.contactId) {
    return <MemberView />;
  }

  return <PublicView />;
}
```

## Example Microsites

- **Groups** - Browse and join small groups
- **Events** - View events, register, directions
- **Serve** - Volunteer opportunities and sign-ups
- **Give** - Donation portal
- **Resources** - Sermons, downloads, articles

---

**Status:** Template not yet built **Next Steps:** Build template when first
microsite is needed **Pattern:** Use similar structure to `apps/platform` but
simplified for public use
