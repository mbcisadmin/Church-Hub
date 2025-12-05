# MinistryPlatform Troubleshooting

Debug common MinistryPlatform API integration issues.

## What This Skill Does

Helps diagnose and fix common problems with:
- Authentication and token issues
- API requests and responses
- Stored procedure calls
- Data formatting issues
- Permission errors

## Common Issues and Solutions

### 1. Authentication Issues

#### Problem: "401 Unauthorized" errors

**Diagnosis Steps:**
1. Check if `MINISTRY_PLATFORM_BASE_URL` is set correctly
2. Verify `MINISTRY_PLATFORM_CLIENT_ID` and `CLIENT_SECRET` are valid
3. Check if token is being refreshed properly

**Check Token Status:**
```typescript
// Add this to your service
console.log('Token expires at:', this.client['expiresAt']);
console.log('Current time:', new Date());
```

**Solutions:**
- Verify environment variables are loaded: `console.log(process.env.MINISTRY_PLATFORM_BASE_URL)`
- Check OAuth client in MP Admin Console is active
- Ensure redirect URIs match exactly (including http vs https)
- Regenerate client secret if compromised

---

### 2. "Failed to get client credentials token"

**Diagnosis:**
- OAuth endpoint not accessible
- Invalid credentials
- Network/firewall issues

**Debug:**
```typescript
// In clientCredentials.ts, add logging
console.log('OAuth URL:', `${mpOauthUrl}/connect/token`);
console.log('Client ID:', process.env.MINISTRY_PLATFORM_CLIENT_ID);

const response = await fetch(`${mpOauthUrl}/connect/token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: params.toString(),
});

console.log('Response status:', response.status);
console.log('Response:', await response.text());
```

**Solutions:**
- Test OAuth endpoint manually with curl
- Verify no special characters in client secret
- Check MP instance is accessible
- Ensure scope is correct: `http://www.thinkministry.com/dataplatform/scopes/all`

---

### 3. API Requests Failing

#### Problem: Table queries returning errors

**Check the Request:**
```typescript
// In httpClient.ts, this logging is already there
console.log('===== HTTP GET =====');
console.log('Endpoint:', endpoint);
console.log('URL:', url);
console.log('Query Params:', queryParams);
```

**Common Issues:**

**a) Invalid $filter syntax**
```typescript
// WRONG
$filter: "Event_ID = '123'"  // Event_ID is int, not string

// RIGHT
$filter: "Event_ID = 123"

// WRONG
$filter: "Event_Title = Test"  // Missing quotes for strings

// RIGHT
$filter: "Event_Title = 'Test'"
```

**b) Field names with FK traversal**
```typescript
// For fields from related tables, use dot notation
$select: "Event_ID,Event_Title,Program_ID_Table.Program_Name"
$filter: "Program_ID_Table.Ministry_ID = 127"
```

**c) Invalid orderby**
```typescript
// WRONG
$orderby: "Event Start Date"  // Spaces not allowed

// RIGHT
$orderby: "Event_Start_Date"
```

---

### 4. Stored Procedure Issues

#### Problem: Stored proc returns empty or wrong data

**Debug Steps:**

1. **Test in SSMS first:**
```sql
EXEC [dbo].[api_Custom_YourProc_JSON]
    @Param1 = 123,
    @Param2 = 'Test';
```

2. **Check procedure is registered:**
   - MP Admin Console → Platform Tools → API Procedures
   - Verify exact name matches

3. **Check JSON parsing:**
```typescript
// Add detailed logging
console.log('Raw procedure result:', JSON.stringify(result, null, 2));

if (result && result.length > 0 && result[0] && result[0].length > 0) {
  const firstRow = result[0][0] as any;
  console.log('First row:', firstRow);
  console.log('Keys:', Object.keys(firstRow));

  const jsonKey = Object.keys(firstRow)[0];
  console.log('JSON key:', jsonKey);

  const jsonString = firstRow[jsonKey];
  console.log('JSON string:', jsonString);

  const parsed = JSON.parse(jsonString);
  console.log('Parsed data:', parsed);
}
```

**Common Issues:**
- Procedure not registered in MP
- Parameter names don't match (case-sensitive!)
- Missing `FOR JSON PATH` in SQL
- Wrong result format (not using JSON_F52E2B6118A111d1B10500805F49916B pattern)

---

### 5. Permission Errors

#### Problem: "403 Forbidden" or data not visible

**Check:**
1. API user has table permissions in MP
2. Page/table security roles configured correctly
3. Domain_ID filtering is correct

**Test User Permissions:**
```sql
-- In SSMS, check what the API user can see
EXEC sp_helptext 'Your_Table';

-- Check user permissions
SELECT *
FROM sys.database_permissions
WHERE grantee_principal_id = USER_ID('YourAPIUser');
```

---

### 6. Data Not Saving / Audit Log Issues

#### Problem: Creates/updates succeed but wrong user in Created_By

**Check userId is being passed:**
```typescript
// WRONG - userId not passed
await tableService.createTableRecords("Table", [data]);

// RIGHT - userId passed for audit logging
await tableService.createTableRecords("Table", [data], userId);
```

**Verify in MP:**
1. Check `Domain_User` table
2. Look for recent entries
3. Verify `User_ID` matches the session contactId

**Debug:**
```typescript
// In your API route
console.log('Session contactId:', session.contactId);
console.log('Parsed userId:', parseInt(session.contactId));

// In your service
console.log('Creating record with userId:', this.userId);
```

---

### 7. TypeScript Type Errors

#### Problem: "Property doesn't exist on type"

**For Session:**
```typescript
// If you see: Property 'contactId' does not exist on type 'Session'
// Check that types.ts is loaded:

// apps/platform/src/types/next-auth.d.ts should exist with:
declare module "next-auth" {
  interface Session extends DefaultSession {
    contactId: string;
    // ... other custom properties
  }
}
```

**For MP Data:**
```typescript
// Create proper types instead of using 'any'
import { Event } from "@church/database";

const events = await tableService.getTableRecords<Event>("Events", {
  $select: "Event_ID,Event_Title"
});
```

---

### 8. Date/Time Issues

#### Problem: Dates in wrong format or timezone

**MP Returns:**
- Dates as strings in ISO format: `"2024-01-01T00:00:00"`

**Handle Properly:**
```typescript
// Parse MP date strings
import { parseISO } from 'date-fns';

const event = { Event_Start_Date: "2024-01-01T00:00:00" };
const date = parseISO(event.Event_Start_Date);

// Format for MP API
import { format } from 'date-fns';
const dateString = format(new Date(), "yyyy-MM-dd");
```

---

### 9. CORS Errors (in development)

#### Problem: CORS errors when calling API

**This shouldn't happen** in Next.js App Router (same origin), but if it does:

**Check:**
1. Are you using the correct base URL? (should be relative `/api/...`)
2. Is middleware blocking the route?
3. Are you in the correct router context? (app/ vs pages/)

---

### 10. Build/TypeScript Errors

#### Problem: Module not found errors

**Check workspace linking:**
```bash
# From monorepo root
npm install

# Verify packages are linked
ls -la node_modules/@church/
```

**Check imports:**
```typescript
// WRONG (in packages)
import { Something } from "@/lib/utils";

// RIGHT (in packages - use relative paths)
import { Something } from "../lib/utils";

// RIGHT (in apps - can use aliases)
import { Something } from "@/lib/utils";
```

---

## Debugging Checklist

When something isn't working:

- [ ] Check browser console for errors
- [ ] Check server logs (terminal where `npm run dev` is running)
- [ ] Verify environment variables are loaded
- [ ] Test the MP API endpoint directly (Postman/curl)
- [ ] Check MP Admin Console for procedure registration
- [ ] Verify table/page permissions in MP
- [ ] Check SQL Server for procedure execution
- [ ] Look at audit logs in Domain_User table
- [ ] Verify data types match between MP and TypeScript
- [ ] Check NextAuth session contains expected data
- [ ] Clear Next.js cache: `rm -rf .next`

## Getting Help

If still stuck:
1. Check MP Community forums
2. Review MP API documentation
3. Test with MP's API Console tool
4. Verify with curl/Postman outside of app
5. Simplify to minimal reproduction case
