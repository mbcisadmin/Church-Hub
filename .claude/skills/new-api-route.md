# New API Route

Create a new API route with proper authentication, type safety, and MinistryPlatform integration.

## What You'll Create

A Next.js API route at `apps/platform/src/app/api/[route-name]/route.ts` with:
- NextAuth session validation
- Type-safe request/response handling
- Proper error handling
- MinistryPlatform service integration

## Implementation

### Step 1: Gather Requirements

Ask the user:
- What is the route name? (e.g., "users", "events/[eventId]")
- What HTTP methods are needed? (GET, POST, PUT, DELETE)
- Does it require authentication?
- What MP service will it use?

### Step 2: Create the Route File

Create `apps/platform/src/app/api/[route-name]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { YourService } from "@/services/yourService";

/**
 * GET /api/[route-name]
 * Description: [What this endpoint does]
 * Auth: Required
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.contactId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const param1 = searchParams.get("param1");

    // Validate required parameters
    if (!param1) {
      return NextResponse.json(
        { error: "Missing required parameter: param1" },
        { status: 400 }
      );
    }

    // Call service
    const service = new YourService(parseInt(session.contactId));
    const data = await service.getData(param1);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/[route-name]:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/[route-name]
 * Description: [What this endpoint does]
 * Auth: Required
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.contactId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Optional: Use Zod schema for validation
    // const validatedData = YourSchema.parse(body);

    // Call service
    const service = new YourService(parseInt(session.contactId));
    const result = await service.createData(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/[route-name]:", error);

    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create data" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/[route-name]
 * Description: [What this endpoint does]
 * Auth: Required
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.contactId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const service = new YourService(parseInt(session.contactId));
    await service.updateData(id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PUT /api/[route-name]:", error);
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/[route-name]
 * Description: [What this endpoint does]
 * Auth: Required
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.contactId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    const service = new YourService(parseInt(session.contactId));
    await service.deleteData(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/[route-name]:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
```

## Dynamic Routes

For routes with parameters like `/api/users/[userId]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.contactId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Access dynamic parameter
    const { userId } = await params;

    // Your logic here
    const data = await fetchUserData(parseInt(userId));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
```

## Public Routes (No Auth Required)

For public routes like `/api/public-data/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { YourService } from "@/services/yourService";

export async function GET(request: NextRequest) {
  try {
    // No auth check - uses client credentials
    const service = new YourService();
    const data = await service.getPublicData();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
```

## Best Practices

1. **Always validate authentication** for protected routes
2. **Use session.contactId** for userId (not user.id or accessToken)
3. **Validate all inputs** - query params and request body
4. **Use descriptive error messages** for debugging
5. **Log errors with context** - include endpoint name
6. **Return proper HTTP status codes**
   - 200: Success
   - 201: Created
   - 400: Bad Request (validation error)
   - 401: Unauthorized
   - 404: Not Found
   - 500: Server Error
7. **Use TypeScript types** from `@church/database`
8. **Keep routes thin** - business logic goes in services

## Testing

After creation:
1. Test with curl or Postman
2. Check error responses for all edge cases
3. Verify authentication works correctly
4. Test with missing/invalid parameters
5. Check MP audit logs to ensure userId is being tracked
