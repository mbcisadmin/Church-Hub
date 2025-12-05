# New Stored Procedure

Create a MinistryPlatform stored procedure with documentation and integration code.

## What You'll Create

1. **SQL File** - The stored procedure definition
2. **Documentation** - Installation and usage guide
3. **Service Integration** - TypeScript code to call it
4. **Type Definitions** - Expected input/output types

## Implementation

### Step 1: Gather Requirements

Ask the user:
- What is the procedure name? (Use pattern: `api_Custom_[Name]_JSON`)
- What does it do?
- What parameters does it need?
- What data does it return?
- Is it for the Counter app, Events, or another feature?

### Step 2: Create the SQL File

Create `database/customizations/stored-procedures/[proc-name].sql`:

```sql
-- =============================================
-- Author:      [Your Name]
-- Create date: [Date]
-- Description: [What this procedure does]
-- Usage: Used by [App Name] to [purpose]
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[api_Custom_[Name]_JSON]
    @Param1 INT = NULL,
    @Param2 NVARCHAR(255) = NULL,
    @UserGUID UNIQUEIDENTIFIER = NULL  -- Standard parameter for user context
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate required parameters
    IF @Param1 IS NULL
    BEGIN
        RAISERROR('Parameter @Param1 is required', 16, 1);
        RETURN;
    END

    -- Main query
    SELECT
        t.[Table_ID],
        t.[Field1],
        t.[Field2],
        t.[Created_Date]
    FROM
        [dbo].[Your_Table] t
    WHERE
        (@Param1 IS NULL OR t.[Related_ID] = @Param1)
        AND (@Param2 IS NULL OR t.[Field2] LIKE '%' + @Param2 + '%')
        AND t.[Domain_ID] = 1
    ORDER BY
        t.[Created_Date] DESC
    FOR JSON PATH;  -- Return as JSON
END
GO

-- Grant execute permissions
GRANT EXECUTE ON [dbo].[api_Custom_[Name]_JSON] TO [APIUser];
GO
```

### Step 3: Create Documentation

Create `database/customizations/stored-procedures/[proc-name].md`:

```markdown
# api_Custom_[Name]_JSON

## Purpose

[What this stored procedure does and why it exists]

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| @Param1 | INT | Yes | [Description] |
| @Param2 | NVARCHAR(255) | No | [Description] |
| @UserGUID | UNIQUEIDENTIFIER | No | User context for filtering/permissions |

## Returns

JSON array of objects with the following structure:

\`\`\`json
[
  {
    "Table_ID": 123,
    "Field1": "Value",
    "Field2": "Value",
    "Created_Date": "2024-01-01T00:00:00"
  }
]
\`\`\`

## Usage Example

### From SQL Server Management Studio

\`\`\`sql
EXEC [dbo].[api_Custom_[Name]_JSON]
    @Param1 = 123,
    @Param2 = 'SearchTerm',
    @UserGUID = '12345678-1234-1234-1234-123456789012';
\`\`\`

### From TypeScript Service

\`\`\`typescript
const result = await procedureService.executeProcedure(
  'api_Custom_[Name]_JSON',
  {
    '@Param1': 123,
    '@Param2': 'SearchTerm',
    '@UserGUID': session.sub
  }
);
\`\`\`

## Installation

1. Open SQL Server Management Studio
2. Connect to your MinistryPlatform database
3. Run the SQL script from \`[proc-name].sql\`
4. Register in MP Admin Console:
   - Navigate to Platform Tools > API Procedures
   - Add new procedure: \`api_Custom_[Name]_JSON\`
   - Set permissions appropriately

## Dependencies

- Tables: [List of tables accessed]
- Other Procedures: [If it calls other procs]
- Required MP Version: [Minimum version if applicable]

## Notes

- [Any special considerations]
- [Performance notes]
- [Security considerations]
\`\`\`
```

### Step 4: Create TypeScript Types

Add types for the procedure in your service:

```typescript
/**
 * Input parameters for api_Custom_[Name]_JSON
 */
interface [Name]ProcParams {
  '@Param1': number;
  '@Param2'?: string;
  '@UserGUID'?: string;
}

/**
 * Output from api_Custom_[Name]_JSON
 */
interface [Name]Result {
  Table_ID: number;
  Field1: string;
  Field2: string;
  Created_Date: string;
}
```

### Step 5: Add Service Method

Add to your service class:

```typescript
/**
 * Get data using custom stored procedure
 */
async get[Name]Data(param1: number, param2?: string): Promise<[Name]Result[]> {
  try {
    const result = await this.procedureService.executeProcedure(
      'api_Custom_[Name]_JSON',
      {
        '@Param1': param1,
        '@Param2': param2,
      }
    );

    // Parse the JSON result
    // MP returns: [[{ JSON_xxx: '[{...}]' }]]
    if (result && result.length > 0 && result[0] && result[0].length > 0) {
      const firstRow = result[0][0] as any;
      const jsonKey = Object.keys(firstRow)[0];
      const jsonString = firstRow[jsonKey];
      return JSON.parse(jsonString) as [Name]Result[];
    }

    return [];
  } catch (error) {
    console.error('Error calling api_Custom_[Name]_JSON:', error);
    throw error;
  }
}
```

### Step 6: Alternative - Using executeProcedureWithBody

For procedures that need request body data:

```typescript
async get[Name]Data(params: [Name]ProcParams): Promise<[Name]Result[]> {
  const result = await this.procedureService.executeProcedureWithBody(
    'api_Custom_[Name]_JSON',
    params
  ) as unknown as any[][];

  if (result && result.length > 0 && Array.isArray(result[0]) && result[0].length > 0) {
    const resultObject = result[0][0] as any;
    const jsonKey = Object.keys(resultObject)[0];
    const jsonString = resultObject[jsonKey];
    const data = JSON.parse(jsonString);
    return data as [Name]Result[];
  }

  return [];
}
```

## Common Stored Procedure Patterns

### 1. Simple SELECT with JSON

```sql
CREATE PROCEDURE [dbo].[api_Custom_GetItems_JSON]
AS
BEGIN
    SELECT Item_ID, Item_Name, Created_Date
    FROM Items
    FOR JSON PATH;
END
```

### 2. With Parameters and Filtering

```sql
CREATE PROCEDURE [dbo].[api_Custom_GetFilteredItems_JSON]
    @StartDate DATE,
    @EndDate DATE = NULL
AS
BEGIN
    SELECT Item_ID, Item_Name, Created_Date
    FROM Items
    WHERE Created_Date >= @StartDate
      AND (@EndDate IS NULL OR Created_Date <= @EndDate)
    FOR JSON PATH;
END
```

### 3. With User Context

```sql
CREATE PROCEDURE [dbo].[api_Custom_GetUserItems_JSON]
    @UserGUID UNIQUEIDENTIFIER
AS
BEGIN
    DECLARE @ContactID INT;

    -- Get Contact_ID from User_GUID
    SELECT @ContactID = Contact_ID
    FROM dp_Users
    WHERE User_GUID = @UserGUID;

    -- Return items for this contact
    SELECT Item_ID, Item_Name, Created_Date
    FROM Items
    WHERE Contact_ID = @ContactID
    FOR JSON PATH;
END
```

### 4. With Joins and Complex Data

```sql
CREATE PROCEDURE [dbo].[api_Custom_GetEventsWithDetails_JSON]
    @Date DATE
AS
BEGIN
    SELECT
        e.Event_ID,
        e.Event_Title,
        e.Event_Start_Date,
        c.Congregation_Name,
        et.Event_Type
    FROM Events e
    INNER JOIN Congregations c ON e.Congregation_ID = c.Congregation_ID
    INNER JOIN Event_Types et ON e.Event_Type_ID = et.Event_Type_ID
    WHERE CAST(e.Event_Start_Date AS DATE) = @Date
    FOR JSON PATH;
END
```

## Best Practices

1. **Naming Convention**: Always use `api_Custom_[Name]_JSON` pattern
2. **Return JSON**: Use `FOR JSON PATH` for easy parsing
3. **Parameter Defaults**: Make parameters optional when sensible
4. **Error Handling**: Use RAISERROR for validation errors
5. **User Context**: Include `@UserGUID` for user-specific queries
6. **Security**: Grant execute only to API user
7. **Domain Filtering**: Always filter by `Domain_ID = 1` (unless multi-tenant)
8. **Performance**: Add appropriate indexes on filtered columns
9. **Documentation**: Keep the .md file updated with changes
10. **Registration**: Don't forget to register in MP Admin Console

## Testing

After creation:
1. Test in SSMS with sample parameters
2. Verify JSON output structure
3. Test with NULL parameters
4. Test error cases (missing required params)
5. Register in MP Admin Console
6. Test from TypeScript service
7. Verify performance with production data volume
