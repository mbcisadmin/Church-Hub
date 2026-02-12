-- =============================================
-- Register api_Custom_GetUserProfile_JSON in MinistryPlatform API
-- Description: Get complete user profile including household and address for authentication
-- =============================================

-- Step 1: Register the procedure (if not already registered)
IF NOT EXISTS (SELECT 1 FROM dp_API_Procedures WHERE Procedure_Name = 'api_Custom_GetUserProfile_JSON')
BEGIN
    INSERT INTO dp_API_Procedures (Procedure_Name, Description)
    VALUES ('api_Custom_GetUserProfile_JSON', 'Get complete user profile including household and address for authentication');
    PRINT 'API Procedure registered successfully';
END
ELSE
BEGIN
    PRINT 'API Procedure already exists - updating description';
    UPDATE dp_API_Procedures
    SET Description = 'Get complete user profile including household and address for authentication'
    WHERE Procedure_Name = 'api_Custom_GetUserProfile_JSON';
END
GO

-- Step 2: Grant permissions to roles
DECLARE @API_Procedure_ID INT;
SELECT @API_Procedure_ID = API_Procedure_ID
FROM dp_API_Procedures
WHERE Procedure_Name = 'api_Custom_GetUserProfile_JSON';

-- Grant to Administrators (Role ID 2)
IF NOT EXISTS (
    SELECT 1 FROM dp_Role_API_Procedures
    WHERE Role_ID = 2 AND API_Procedure_ID = @API_Procedure_ID
)
BEGIN
    INSERT INTO dp_Role_API_Procedures (Role_ID, API_Procedure_ID, Domain_ID)
    VALUES (2, @API_Procedure_ID, 1);
    PRINT 'Permission granted to Administrators (Role ID 2)';
END
ELSE
BEGIN
    PRINT 'Permission already exists for Administrators (Role ID 2)';
END

-- Grant to Users (Role ID 17) - needed for all authenticated users
IF NOT EXISTS (
    SELECT 1 FROM dp_Role_API_Procedures
    WHERE Role_ID = 17 AND API_Procedure_ID = @API_Procedure_ID
)
BEGIN
    INSERT INTO dp_Role_API_Procedures (Role_ID, API_Procedure_ID, Domain_ID)
    VALUES (17, @API_Procedure_ID, 1);
    PRINT 'Permission granted to Users (Role ID 17)';
END
ELSE
BEGIN
    PRINT 'Permission already exists for Users (Role ID 17)';
END
GO

-- Step 3: Verification query
SELECT
    ap.API_Procedure_ID,
    ap.Procedure_Name,
    ap.Description,
    r.Role_ID,
    r.Role_Name
FROM dp_API_Procedures ap
LEFT JOIN dp_Role_API_Procedures rap ON ap.API_Procedure_ID = rap.API_Procedure_ID
LEFT JOIN dp_Roles r ON rap.Role_ID = r.Role_ID
WHERE ap.Procedure_Name = 'api_Custom_GetUserProfile_JSON';
GO
