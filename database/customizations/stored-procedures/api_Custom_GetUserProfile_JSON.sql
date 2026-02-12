-- File: database/customizations/stored-procedures/api_Custom_GetUserProfile_JSON.sql
-- Purpose: Get complete user profile including household address and family members
--
-- This consolidated procedure returns:
-- 1. User profile info (Contact_ID, names, email, phone, image, HouseholdID)
-- 2. Admin status (checks if user has a specific Security Role)
-- 3. Roles (from MP User Groups - exposed as "Roles" in JSON)
-- 4. Household address
-- 5. Household members with positions and ages
--
-- Parameters:
--   @UserGUID      - The user's GUID from OAuth token (sub claim)
--   @AdminRoleID   - The Security Role ID to check for admin status (from ADMIN_SECURITY_ROLE_ID env var)
--   @DomainID      - Optional Domain ID for multi-tenant setups (defaults to 1)

CREATE OR ALTER PROCEDURE [dbo].[api_Custom_GetUserProfile_JSON]
    @UserGUID UNIQUEIDENTIFIER,
    @AdminRoleID INT = NULL,  -- Optional: if NULL, IsAdmin will always be false
    @DomainID INT = 1
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserID INT;
    DECLARE @ContactID INT;
    DECLARE @HouseholdID INT;
    DECLARE @IsAdmin BIT = 0;
    DECLARE @FirstName NVARCHAR(50);
    DECLARE @Nickname NVARCHAR(50);
    DECLARE @LastName NVARCHAR(50);
    DECLARE @Email NVARCHAR(255);
    DECLARE @MobilePhone NVARCHAR(25);
    DECLARE @ImageGuid NVARCHAR(100);

    -- Address fields
    DECLARE @AddressLine1 NVARCHAR(255);
    DECLARE @AddressLine2 NVARCHAR(255);
    DECLARE @City NVARCHAR(100);
    DECLARE @State NVARCHAR(50);
    DECLARE @Zip NVARCHAR(20);

    -- Get user and contact info
    SELECT
        @UserID = u.User_ID,
        @ContactID = u.Contact_ID
    FROM dp_Users u
    WHERE u.User_GUID = @UserGUID;

    -- If no user found, return empty result
    IF @UserID IS NULL
    BEGIN
        SELECT '{"User":null,"IsAdmin":false,"Roles":[],"Address":null,"HouseholdMembers":[]}' AS Result;
        RETURN;
    END

    -- Get contact details including household
    SELECT
        @FirstName = c.First_Name,
        @Nickname = c.Nickname,
        @LastName = c.Last_Name,
        @Email = c.Email_Address,
        @MobilePhone = c.Mobile_Phone,
        @HouseholdID = c.Household_ID
    FROM Contacts c
    WHERE c.Contact_ID = @ContactID;

    -- Get profile image (Default_Image from dp_Files for this contact)
    SELECT TOP 1
        @ImageGuid = CAST(f.Unique_Name AS NVARCHAR(100))
    FROM dp_Files f
    WHERE f.Table_Name = 'Contacts'
      AND f.Record_ID = @ContactID
      AND f.Default_Image = 1
    ORDER BY f.File_ID DESC;

    -- Get household address
    IF @HouseholdID IS NOT NULL
    BEGIN
        SELECT
            @AddressLine1 = a.Address_Line_1,
            @AddressLine2 = a.Address_Line_2,
            @City = a.City,
            @State = a.[State/Region],
            @Zip = a.Postal_Code
        FROM Households h
        INNER JOIN Addresses a ON h.Address_ID = a.Address_ID
        WHERE h.Household_ID = @HouseholdID;
    END

    -- Check if user has the specified admin security role
    IF @AdminRoleID IS NOT NULL
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM dp_User_Roles ur
            WHERE ur.User_ID = @UserID
              AND ur.Role_ID = @AdminRoleID
        )
        BEGIN
            SET @IsAdmin = 1;
        END
    END

    -- Get all User Groups for this user (exposed as "Roles" in output)
    DECLARE @RolesJson NVARCHAR(MAX) = '';

    SELECT @RolesJson = @RolesJson +
        CASE WHEN @RolesJson = '' THEN '' ELSE ',' END +
        '"' + REPLACE(REPLACE(ug.User_Group_Name, '\', '\\'), '"', '\"') + '"'
    FROM dp_User_User_Groups uug
    INNER JOIN dp_User_Groups ug ON uug.User_Group_ID = ug.User_Group_ID
    WHERE uug.User_ID = @UserID
    ORDER BY ug.User_Group_Name;

    -- Get household members (excluding the current user)
    DECLARE @HouseholdMembersJson NVARCHAR(MAX) = '';

    IF @HouseholdID IS NOT NULL
    BEGIN
        SELECT @HouseholdMembersJson = @HouseholdMembersJson +
            CASE WHEN @HouseholdMembersJson = '' THEN '' ELSE ',' END +
            '{' +
                '"ContactID":' + CAST(c.Contact_ID AS NVARCHAR(20)) + ',' +
                '"FirstName":' + CASE WHEN c.First_Name IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(c.First_Name, '\', '\\'), '"', '\"') + '"' END + ',' +
                '"LastName":' + CASE WHEN c.Last_Name IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(c.Last_Name, '\', '\\'), '"', '\"') + '"' END + ',' +
                '"Position":' + CASE WHEN hp.Household_Position IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(hp.Household_Position, '\', '\\'), '"', '\"') + '"' END + ',' +
                '"Email":' + CASE WHEN c.Email_Address IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(c.Email_Address, '\', '\\'), '"', '\"') + '"' END + ',' +
                '"MobilePhone":' + CASE WHEN c.Mobile_Phone IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(c.Mobile_Phone, '\', '\\'), '"', '\"') + '"' END + ',' +
                '"Age":' + CASE WHEN c.Date_of_Birth IS NULL THEN 'null' ELSE CAST(DATEDIFF(YEAR, c.Date_of_Birth, GETDATE()) AS NVARCHAR(10)) END + ',' +
                '"ImageGuid":' + CASE WHEN f.Unique_Name IS NULL THEN 'null' ELSE '"' + CAST(f.Unique_Name AS NVARCHAR(100)) + '"' END +
            '}'
        FROM Contacts c
        LEFT JOIN Household_Positions hp ON c.Household_Position_ID = hp.Household_Position_ID
        LEFT JOIN dp_Files f ON f.Table_Name = 'Contacts' AND f.Record_ID = c.Contact_ID AND f.Default_Image = 1
        WHERE c.Household_ID = @HouseholdID
          AND c.Contact_ID != @ContactID
        ORDER BY c.Household_Position_ID, c.Last_Name, c.First_Name;
    END

    -- Build and return the combined JSON result
    SELECT '{' +
        '"User":{' +
            '"ContactID":' + CAST(@ContactID AS NVARCHAR(20)) + ',' +
            '"UserID":' + CAST(@UserID AS NVARCHAR(20)) + ',' +
            '"UserGUID":"' + CAST(@UserGUID AS NVARCHAR(40)) + '",' +
            '"FirstName":' + CASE WHEN @FirstName IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(@FirstName, '\', '\\'), '"', '\"') + '"' END + ',' +
            '"Nickname":' + CASE WHEN @Nickname IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(@Nickname, '\', '\\'), '"', '\"') + '"' END + ',' +
            '"LastName":' + CASE WHEN @LastName IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(@LastName, '\', '\\'), '"', '\"') + '"' END + ',' +
            '"Email":' + CASE WHEN @Email IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(@Email, '\', '\\'), '"', '\"') + '"' END + ',' +
            '"MobilePhone":' + CASE WHEN @MobilePhone IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(@MobilePhone, '\', '\\'), '"', '\"') + '"' END + ',' +
            '"ImageGuid":' + CASE WHEN @ImageGuid IS NULL THEN 'null' ELSE '"' + @ImageGuid + '"' END + ',' +
            '"HouseholdID":' + CASE WHEN @HouseholdID IS NULL THEN 'null' ELSE CAST(@HouseholdID AS NVARCHAR(20)) END +
        '},' +
        '"IsAdmin":' + CASE WHEN @IsAdmin = 1 THEN 'true' ELSE 'false' END + ',' +
        '"Roles":[' + @RolesJson + '],' +
        '"Address":' + CASE
            WHEN @AddressLine1 IS NULL AND @City IS NULL THEN 'null'
            ELSE '{' +
                '"Line1":' + CASE WHEN @AddressLine1 IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(@AddressLine1, '\', '\\'), '"', '\"') + '"' END + ',' +
                '"Line2":' + CASE WHEN @AddressLine2 IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(@AddressLine2, '\', '\\'), '"', '\"') + '"' END + ',' +
                '"City":' + CASE WHEN @City IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(@City, '\', '\\'), '"', '\"') + '"' END + ',' +
                '"State":' + CASE WHEN @State IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(@State, '\', '\\'), '"', '\"') + '"' END + ',' +
                '"Zip":' + CASE WHEN @Zip IS NULL THEN 'null' ELSE '"' + REPLACE(REPLACE(@Zip, '\', '\\'), '"', '\"') + '"' END +
            '}'
        END + ',' +
        '"HouseholdMembers":[' + @HouseholdMembersJson + ']' +
    '}' AS Result;
END
GO

-- =============================================================================
-- TESTING
-- =============================================================================
-- 1. Get a User_GUID to test with:
--    SELECT TOP 5 User_ID, User_GUID, User_Name, Contact_ID FROM dp_Users WHERE User_GUID IS NOT NULL
--
-- 2. Get the Admin Security Role ID (e.g., "TheHub"):
--    SELECT Role_ID, Role_Name FROM dp_Roles WHERE Role_Name LIKE '%Hub%'
--
-- 3. Test the procedure:
--    EXEC [dbo].[api_Custom_GetUserProfile_JSON]
--        @UserGUID = 'YOUR-USER-GUID-HERE',
--        @AdminRoleID = 123;  -- Replace with actual Role_ID
--
-- Expected output format:
-- {
--   "User": {
--     "ContactID": 12345,
--     "UserID": 678,
--     "UserGUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
--     "FirstName": "John",
--     "Nickname": "Johnny",
--     "LastName": "Doe",
--     "Email": "john@example.com",
--     "MobilePhone": "555-123-4567",
--     "ImageGuid": "abc123-def456-...",
--     "HouseholdID": 456
--   },
--   "IsAdmin": true,
--   "Roles": ["Role Name 1", "Role Name 2"],
--   "Address": {
--     "Line1": "123 Main Street",
--     "Line2": null,
--     "City": "Springfield",
--     "State": "IL",
--     "Zip": "62701"
--   },
--   "HouseholdMembers": [
--     {
--       "ContactID": 12346,
--       "FirstName": "Jane",
--       "LastName": "Doe",
--       "Position": "Spouse",
--       "Email": "jane@example.com",
--       "MobilePhone": "555-0102",
--       "Age": 42,
--       "ImageGuid": "def789-..."
--     }
--   ]
-- }
--
-- To build the full image URL in the app:
-- `${process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL}/${ImageGuid}`
