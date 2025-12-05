# New Micro-App

Create a new micro-app within the Apps Platform with complete setup including routes, API endpoints, and PWA manifest.

## What You'll Create

1. **App Route** - `apps/platform/src/app/(app)/[app-name]/page.tsx`
2. **API Routes** - `apps/platform/src/app/api/[app-name]/route.ts`
3. **Service Layer** - `apps/platform/src/services/[appName]Service.ts`
4. **PWA Manifest** - Dynamic manifest route for standalone installation
5. **Navigation** - Add to app shell navigation

## Implementation

### Step 1: Gather Requirements

Ask the user:
- What is the app name? (e.g., "events", "giving", "check-in")
- What is the app description?
- What icon from lucide-react should be used?
- What MP tables/stored procedures will it use?

### Step 2: Create the Service Layer

Create `apps/platform/src/services/[appName]Service.ts`:

```typescript
import { MinistryPlatformClient, TableService, ProcedureService } from "@church/ministry-platform";
import type { YourEntity } from "@church/database";

export class [AppName]Service {
  private tableService: TableService;
  private procedureService: ProcedureService;
  private client: MinistryPlatformClient;
  private userId?: number;

  constructor(userId?: number) {
    this.client = new MinistryPlatformClient();
    this.tableService = new TableService(this.client);
    this.procedureService = new ProcedureService(this.client);
    this.userId = userId;
  }

  // Add methods for data operations
  async getSomeData() {
    return this.tableService.getTableRecords<YourEntity>("YourTable", {
      $select: "Field1,Field2",
      $orderby: "Field1"
    });
  }

  async createSomeData(data: YourEntity) {
    if (!this.userId) {
      throw new Error("User ID is required for creating data");
    }
    const result = await this.tableService.createTableRecords(
      "YourTable",
      [data],
      this.userId  // REQUIRED: userId for audit logging
    );
    return result[0];
  }
}
```

### Step 3: Create API Routes

Create `apps/platform/src/app/api/[app-name]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { [AppName]Service } from "@/services/[appName]Service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.contactId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    const service = new [AppName]Service(parseInt(session.contactId));
    const data = await service.getSomeData();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.contactId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const service = new [AppName]Service(parseInt(session.contactId));
    const result = await service.createSomeData(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating data:", error);
    return NextResponse.json(
      { error: "Failed to create data" },
      { status: 500 }
    );
  }
}
```

### Step 4: Create the App Page

Create `apps/platform/src/app/(app)/[app-name]/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@church/nextjs-ui";
import { Button } from "@church/nextjs-ui";
import { Loader2, [IconName] } from "lucide-react";

export default function [AppName]Page() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Set page title
  useEffect(() => {
    document.title = "[App Name] - Ministry Apps";
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/[app-name]");
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary dark:text-foreground mb-2">
            [APP NAME]
          </h1>
          <p className="text-muted-foreground">
            [App description]
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Your app content here */}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 5: Add to Navigation (Optional)

If this app should appear in the main navigation, update the database to add it to the Applications table, or add it to the layout manually.

## Best Practices

1. **Always use userId parameter** for CREATE/UPDATE operations
2. **Use the service layer** - don't put business logic in API routes
3. **Handle errors gracefully** with user-friendly messages
4. **Add loading states** for better UX
5. **Use TypeScript types** from `@church/database` package
6. **Follow naming conventions** - kebab-case for routes, PascalCase for components

## Testing

After creation:
1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/[app-name]`
3. Test API endpoints with actual data
4. Check browser console for errors
5. Verify audit logging in MP (check Domain_User table)
