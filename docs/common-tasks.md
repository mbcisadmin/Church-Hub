# Common Tasks

> Step-by-step guides for frequent development tasks.

## Adding a New UI Component

1. **Check if church-agnostic** — no hardcoded colors/content? Continue.
   Otherwise keep in app.

2. **Create in @church/nextjs-ui**

   ```bash
   # packages/nextjs/ui/my-component/my-component.tsx
   ```

3. **Export from package**

   ```typescript
   // packages/nextjs/ui/src/index.ts
   export * from './my-component/my-component';
   ```

4. **Use in app**

   ```typescript
   import { MyComponent } from '@church/nextjs-ui/my-component';
   ```

## Adding a New MP API Pattern

1. **Create in @church/ministry-platform**

   ```typescript
   // packages/core/ministry-platform/src/contacts.ts
   export async function getContactByEmail(
     email: string,
     userId: number // Always include!
   ) {
     // Implementation
   }
   ```

2. **Create Zod schema in @church/database**

   ```typescript
   // packages/core/database/src/schemas/contacts.ts
   export const contactSchema = z.object({
     Contact_ID: z.number(),
     // ...
   });
   ```

3. **Use in app**

   ```typescript
   import { getContactByEmail } from '@church/ministry-platform';
   const contact = await getContactByEmail(email, session.contactId);
   ```

## Adding a New Micro-App

Use the `/new-micro-app` skill for scaffolding, or manually:

1. Create route: `apps/platform/src/app/(app)/my-app/page.tsx`
2. Create API: `apps/platform/src/app/api/my-app/route.ts`
3. Create service: `apps/platform/src/services/myAppService.ts`
4. Add to Applications database table (for listing in nav)
