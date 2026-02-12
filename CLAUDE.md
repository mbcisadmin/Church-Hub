# CLAUDE.md

Guidance for Claude Code when working with the Church Hub template.

## Repository Overview

Church Hub is a Next.js + MinistryPlatform integration template for churches.
Turborepo monorepo with shared packages, OAuth, API client, and audit logging.

```
church-hub-template/
├── apps/platform/                 # Main church apps platform (Next.js)
├── packages/
│   ├── core/
│   │   ├── database/              # Zod schemas, data models
│   │   └── ministry-platform/     # MP API client
│   └── nextjs/
│       ├── auth/                  # NextAuth + MP OAuth
│       ├── ui/                    # Shared React components (Shadcn)
│       └── tailwind-config/       # Design tokens, Tailwind preset
├── database/                      # SQL scripts (baseline, custom, migrations)
├── microsites/                    # Standalone church microsites
└── widgets/                       # Embeddable widgets
```

## Architecture Rules

- `packages/core/*` — No React/Next.js dependencies (framework-agnostic)
- `packages/nextjs/*` — Next.js/React-specific code
- `apps/*` — Specific applications (not shared across churches)
- If a file is used across multiple apps → move to a package

## Abstraction Quick Reference

| Code Type        | Church-Agnostic? | Decision                                   |
| ---------------- | ---------------- | ------------------------------------------ |
| UI Component     | Yes              | Abstract now → `@church/nextjs-ui`         |
| MP API Pattern   | Yes              | Abstract now → `@church/ministry-platform` |
| Data Schema (MP) | Yes              | Abstract now → `@church/database`          |
| Utility Function | Yes              | Abstract now → appropriate package         |
| Business Logic   | No               | Keep local (Rule of Three)                 |
| Custom Logic     | No               | Keep local                                 |

Full decision framework with examples:
[docs/abstraction-guidelines.md](./docs/abstraction-guidelines.md)

## Critical Patterns (Summary)

1. **$userId for audit logging** — Always pass `$userId` to MP stored procs.
   TypeScript enforces at compile time.
2. **CSS theming via custom properties** — Use `bg-primary` etc., never hardcode
   colors. Customize in `globals.css`.
3. **Raw TypeScript packages** — No build step for internal packages. Export
   `.ts` files directly.
4. **Zod schemas for type safety** — Runtime validation + TypeScript inference.
   Never use bare `interface` for MP data.
5. **Streaming Suspense for dashboards** — Don't await all data. Stream
   non-default tabs via `<Suspense>`. See
   [ADR-006](./.architecture/ADR-006-streaming-suspense-tabs.md).

Full details with code examples:
[docs/critical-patterns.md](./docs/critical-patterns.md)

## Church Customization

When deploying for a new church, edit these three files:

1. **`src/config/church.ts`** — Church name, abbreviation, tagline, URLs, app
   name
2. **`src/app/globals.css`** — Brand colors (`--brand-primary`,
   `--brand-secondary`)
3. **`public/icon.svg`** — Church logo (used for favicon and PWA icon)

The `church.ts` config is the single source of truth for all church identity
text. Components import from `@/config/church` — never hardcode church names.

## Code Style

### Naming

- **Packages**: `@church/package-name` (kebab-case)
- **Components**: `PascalCase` (e.g., `ContactCard`, `EventList`)
- **Functions**: `camelCase` (e.g., `getContact`, `updateEvent`)
- **Files**: `kebab-case.tsx` or `PascalCase.tsx` for components
- **MP Fields**: `Snake_Case` (MinistryPlatform convention)

### File Organization

```
apps/platform/src/
├── app/              # Next.js app router
├── components/       # React components (local to app)
├── config/           # Church config, app constants
├── lib/              # Utilities (local to app)
├── services/         # Business logic / API calls
└── types/            # TypeScript types
```

### Imports

Use package imports for shared code, not relative paths:

```typescript
import { Contact } from '@church/database/schemas/contacts';
import { MinistryPlatformClient } from '@church/ministry-platform';
import { Button } from '@church/nextjs-ui/button';
```

## Common Tasks

- **New UI component** → Check if church-agnostic, create in `@church/nextjs-ui`
- **New MP API pattern** → Create in `@church/ministry-platform` + Zod schema in
  `@church/database`
- **New micro-app** → Use `/new-micro-app` skill

Step-by-step guides: [docs/common-tasks.md](./docs/common-tasks.md)

## Testing & Deployment

- **Testing**: Test in browser during development. Test MP integration with real
  instance.
- **Deployment**: Vercel (primary target). See `.env.example` for required
  variables.
- **Team variables**: Set shared MP credentials at Vercel team level.

## Upstream Workflow

When working in a **church fork** (not the template itself):

1. Fix bugs normally
2. Ask: "Is this a template bug or church-specific?"
3. If template bug → run `/mark-upstream` to document in `UPSTREAM_FIXES.md`
4. Periodically backport fixes to the template

Full workflow: [docs/upstream-workflow.md](./docs/upstream-workflow.md)

## References

| Document                                                           | Description                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------- |
| [SETUP.md](./SETUP.md)                                             | Church onboarding guide                                 |
| [DEVELOPMENT.md](./DEVELOPMENT.md)                                 | Day-to-day dev workflow                                 |
| [docs/abstraction-guidelines.md](./docs/abstraction-guidelines.md) | When to abstract vs keep local                          |
| [docs/critical-patterns.md](./docs/critical-patterns.md)           | Must-follow patterns with examples                      |
| [docs/common-tasks.md](./docs/common-tasks.md)                     | Step-by-step task guides                                |
| [docs/upstream-workflow.md](./docs/upstream-workflow.md)           | Fork-to-template backporting                            |
| [docs/navigation-system.md](./docs/navigation-system.md)           | App navigation architecture                             |
| [.architecture/](./.architecture/)                                 | Architecture Decision Records (ADR-001 through ADR-006) |
| [UPSTREAM_FIXES.md](./UPSTREAM_FIXES.md)                           | Pending fixes to backport                               |
