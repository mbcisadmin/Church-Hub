# @church/nextjs-auth

NextAuth.js v5 authentication with MinistryPlatform OAuth provider.

## Features

- ✅ NextAuth.js v5 with MinistryPlatform OAuth 2.0
- ✅ JWT session strategy with automatic token refresh
- ✅ Role-based access control (Security Roles + User Groups)
- ✅ Admin impersonation support
- ✅ TypeScript support

## Installation

```bash
npm install @church/nextjs-auth
```

## Environment Variables

```env
MINISTRY_PLATFORM_BASE_URL=https://your-church.ministryplatform.com
MINISTRY_PLATFORM_CLIENT_ID=your-client-id
MINISTRY_PLATFORM_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=# Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Admin security role ID (for isAdmin check)
# Find this in MP: Admin → Security Roles → [Your Role] → check URL for Role_ID
ADMIN_SECURITY_ROLE_ID=123

# Public file URL for profile images
NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL=https://your-church.ministryplatform.com/ministryplatformapi/files
```

## Usage

### Setup Auth

```typescript
// app/api/auth/[...nextauth]/route.ts
export { handlers as GET, handlers as POST } from '@church/nextjs-auth';
```

### Use in Server Components

```typescript
import { auth } from '@church/nextjs-auth';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/signin');
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Use in Client Components

```typescript
'use client';

import { useSession } from 'next-auth/react';

export function UserInfo() {
  const { data: session } = useSession();

  if (!session) return null;

  return <div>Signed in as {session.user.email}</div>;
}
```

### Server Actions

```typescript
'use server';

import { auth } from '@church/nextjs-auth';

export async function myAction() {
  const session = await auth();

  if (!session) {
    throw new Error('Unauthorized');
  }

  // Use session.contactId for $userId in MP API calls
  await createRecord(data, session.contactId);
}
```

### Admin Access

```typescript
import { auth } from '@church/nextjs-auth';

export default async function AdminPage() {
  const session = await auth();

  // isAdmin is true if user has the admin security role (set via ADMIN_SECURITY_ROLE_ID)
  if (!session?.isAdmin) {
    return <div>Access denied</div>;
  }

  return <div>Admin content</div>;
}
```

### User Group Access

```typescript
import { auth } from '@church/nextjs-auth';

export default async function FeaturePage() {
  const session = await auth();

  // Check if user is in a specific User Group
  const hasAccess = session?.roles?.includes('Budget Team');

  if (!hasAccess) {
    return <div>Access denied</div>;
  }

  return <div>Feature content</div>;
}
```

## Session Structure

```typescript
{
  user: {
    id: string;          // User GUID
    name: string;        // Full name
    email: string;       // Email address
  };
  // User profile
  firstName: string;     // Given name
  lastName: string;      // Family name
  nickname?: string;     // Nickname (if set)
  mobilePhone?: string;  // Mobile phone
  image?: string;        // Full URL to profile image
  // IDs
  sub: string;           // User GUID (from OAuth)
  userId: string;        // User_ID (for MP audit logging)
  contactId: string;     // Contact_ID (for MP relationships)
  // Permissions
  isAdmin: boolean;      // True if user has the admin security role
  roles: string[];       // User Groups only (not security roles)
  // OAuth tokens
  accessToken: string;   // OAuth access token
  idToken?: string;      // OAuth ID token
  // Admin impersonation (if active)
  simulation?: {
    type: 'impersonate' | 'roles';
    contactId?: string;
    originalUserId: string;
    originalRoles: string[];
    originalIsAdmin?: boolean;
  };
}
```

## Middleware Protection

```typescript
// middleware.ts
export { auth as middleware } from '@church/nextjs-auth';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|signin).*)'],
};
```

## Custom Sign-In Page

```typescript
// app/signin/page.tsx
import { signIn } from '@church/nextjs-auth';

export default function SignIn() {
  return (
    <form action={async () => {
      'use server';
      await signIn('ministryplatform', { redirectTo: '/' });
    }}>
      <button type="submit">Sign in with MinistryPlatform</button>
    </form>
  );
}
```

## Sign Out

```typescript
import { signOut } from '@church/nextjs-auth';

<button onClick={() => signOut()}>Sign out</button>
```

## Features

### Automatic Token Refresh

Tokens are automatically refreshed before expiration. No additional
configuration needed.

### Role Fetching

On every session access, user profile, admin status, and User Groups are fetched
from MinistryPlatform via the `api_Custom_GetUserRolesAndGroups_JSON` stored
procedure.

**Key behavior:**

- `isAdmin` is true if the user has the Security Role specified by
  `ADMIN_SECURITY_ROLE_ID`
- `roles` contains only User Group names (not Security Roles) to save on MP
  licensing costs
- User profile info (name, email, phone, image) is fetched in the same call

### Admin Impersonation

Administrators can impersonate other users for testing/debugging. Session
includes `simulation` object with original user details.

## Requirements

### MinistryPlatform Setup

1. **Create OAuth Client** in MP Admin Console:
   - Client ID and Secret
   - Redirect URI: `https://your-domain.com/api/auth/callback/ministryplatform`
   - Scopes:
     `openid offline_access http://www.thinkministry.com/dataplatform/scopes/all`

2. **Create Stored Procedure** (for role fetching):
   ```sql
   CREATE PROCEDURE api_Custom_GetUserRolesAndGroups_JSON
     @UserGUID NVARCHAR(50)
   AS
   BEGIN
     -- Returns JSON with Security Roles + User Groups
     -- See implementation in database/customizations/
   END
   ```

## Widget Auth (Per-Church Implementation)

This package is for apps platform and microsites with full NextAuth.

For embeddable widgets, auth patterns are church-specific:

- **Public widgets** - No auth required
- **Standalone widgets** - Use this package for full auth
- **Shadow DOM widgets** - Implement per-church (postMessage, parent auth, etc.)

## Troubleshooting

### "Unauthorized" errors

- Check environment variables are set
- Verify OAuth client redirect URIs in MP
- Check stored procedure exists and returns correct format

### Roles not showing

- Verify `api_Custom_GetUserRolesAndGroups_JSON` stored procedure exists
- Check user has Security Roles or User Groups assigned in MP
- Check console logs for error messages

### Token refresh failing

- Verify client ID/secret are correct
- Check MP OAuth endpoint is accessible
- Verify refresh tokens are enabled in MP OAuth client
