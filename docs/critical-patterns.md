# Critical Patterns

> Patterns that must be followed in every Gospel Kit project.

## 1. Always Use $userId for Audit Logging

MinistryPlatform requires `$userId` for audit trails on stored procedures.

**Correct:**

```typescript
import { z } from 'zod';

// ALWAYS include $userId in schema
export const updateContactSchema = z.object({
  contactId: z.number(),
  firstName: z.string(),
  $userId: z.number(), // Required for MP audit logging
});

// Service layer enforces this
async function updateContact(data: UpdateContactInput, userId: number) {
  return await mp.storedProcedure('api_UpdateContact', {
    ...data,
    $userId: userId, // TypeScript ensures this is passed
  });
}
```

**Incorrect:**

```typescript
// Missing $userId - MP will reject or not audit properly
async function updateContact(data: UpdateContactInput) {
  return await mp.storedProcedure('api_UpdateContact', data);
}
```

TypeScript types enforce `$userId` at compile time, preventing runtime errors.

## 2. CSS Theming via Custom Properties

Gospel Kit uses CSS custom properties for church branding (not hardcoded
colors).

**Correct:**

```typescript
// Uses semantic color tokens
<button className="bg-primary text-primary-foreground">
  Sign Up
</button>

// Churches customize in globals.css
:root {
  --brand-primary: #4a90d9;
  --primary: var(--brand-primary);
}
```

**Incorrect:**

```typescript
// Hardcoded color (can't be customized per church)
<button className="bg-[#4a90d9] text-white">
  Sign Up
</button>
```

Use `@church/tailwind-config` tokens, customize via CSS variables.

## 3. Raw TypeScript Packages (No Build Step)

Gospel Kit packages export raw `.ts` files for better developer experience.

**Correct:**

```json
// packages/core/database/package.json
{
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./schemas/*": "./src/schemas/*.ts"
  },
  "scripts": {
    "build": "echo 'Skipping build - using raw TypeScript files'"
  }
}
```

**Incorrect:**

```json
// Don't add build step for internal packages
{
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc"
  }
}
```

Next.js transpiles TypeScript — no need for pre-build. Faster, better DX.

## 4. Zod Schemas for Type Safety

Use Zod for runtime validation + TypeScript inference.

**Correct:**

```typescript
// packages/core/database/src/schemas/contacts.ts
import { z } from 'zod';

export const contactSchema = z.object({
  Contact_ID: z.number(),
  First_Name: z.string(),
  Last_Name: z.string(),
  Email_Address: z.string().email().nullable(),
});

export type Contact = z.infer<typeof contactSchema>;

// Runtime validation
const contact = contactSchema.parse(apiResponse);
```

**Incorrect:**

```typescript
// Just TypeScript types (no runtime validation)
export interface Contact {
  Contact_ID: number;
  First_Name: string;
  Last_Name: string;
  Email_Address: string | null;
}
```

Zod validates API responses at runtime, catches breaking changes early.

## 5. Streaming Suspense for Multi-Tab Dashboards

Dashboard pages that fetch from multiple endpoints should NOT `await` all data
before rendering. Only await the default tab's data. Stream other tabs via async
server components in `<Suspense>` boundaries.

See [ADR-006](../.architecture/ADR-006-streaming-suspense-tabs.md) for full
details. Reference implementation: `dashboards/circles/`.

**Key rules:**

- Extract data fetchers into `_data/fetchers.ts` so stream components can import
  them
- Use `TabReadyProvider` + `TabReadyMarker` to track when streamed tabs are
  ready
- Keep `<Suspense>` boundaries always mounted — use `display: none` to hide
  inactive tabs, not conditional rendering
- Dispatch `window.dispatchEvent(new Event('resize'))` on tab switch for
  Chart.js charts that were in hidden containers
