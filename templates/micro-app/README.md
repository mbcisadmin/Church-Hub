# Micro-App Template

Template for creating new micro-apps within the `apps/platform` application.

## What is a Micro-App?

Micro-apps are **routes within the main apps platform** (`apps/platform`):

- Live at: `apps.yourchurch.org/counter`, `apps.yourchurch.org/projects`, etc.
- Share authentication, layout, and navigation
- Can be installed as standalone PWAs
- Internal tools for church staff

## When to Use This Template

Use this template when building:
- ✅ Internal tools (Counter, Projects, People Search)
- ✅ Staff dashboards
- ✅ Admin interfaces
- ✅ Data entry forms

**Don't use for:**
- ❌ Public-facing websites → Use `templates/microsite/`
- ❌ Embeddable widgets → Use `templates/widget/`

## How to Use

### Option 1: Claude Skill (Recommended)

```bash
/new-micro-app
```

The skill will:
1. Ask for app name and description
2. Generate route structure
3. Create API endpoints
4. Add to navigation

### Option 2: Manual Creation

```bash
# Copy template
cp -r templates/micro-app apps/platform/src/app/(app)/my-app

# Edit files
# - Update page.tsx with your UI
# - Update API routes
# - Add to navigation
```

## Template Structure (To Be Built)

When this template is created, it will include:

```
templates/micro-app/
├── page.tsx              # Main app page
├── components/
│   └── MyAppForm.tsx     # Example form component
├── api/
│   └── route.ts          # API endpoint
└── README.md             # This file
```

## Standard Micro-App Pattern

Every micro-app should follow this structure in `apps/platform`:

```
src/app/(app)/my-app/
├── page.tsx              # Main route
├── layout.tsx            # Optional: app-specific layout
└── components/           # Optional: app-specific components
    └── MyForm.tsx

src/app/api/my-app/
└── route.ts              # API endpoint

src/services/
└── myAppService.ts       # Business logic
```

## Example Micro-Apps

- **Counter** - Event metrics tracking (already built)
- **Projects** - Budget and project management
- **People Search** - Contact lookup
- **Prayer Moderation** - Review prayer requests
- **Group Management** - Small group admin

---

**Status:** Template not yet built - use `/new-micro-app` skill or copy from Counter app
**Next Steps:** Create template when pattern is established
