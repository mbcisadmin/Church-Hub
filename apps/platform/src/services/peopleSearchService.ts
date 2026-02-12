import { MinistryPlatformClient, TableService } from '@church/ministry-platform';

// Contact type for search results
export type Contact = {
  Contact_ID: number;
  First_Name: string | null;
  Last_Name: string;
  Nickname: string | null;
  Display_Name: string;
  Email_Address: string | null;
  Mobile_Phone: string | null;
  Company_Phone: string | null;
  Date_of_Birth: string | null;
  Gender_ID: number | null;
  Marital_Status_ID: number | null;
  Household_ID: number | null;
  Household_Position_ID: number | null;
  Participant_Record: number | null;
  Company: boolean | null;
  Company_Name: string | null;
  __Age: number | null;
  Contact_Status_ID: number | null;
  Image_GUID?: string | null;
  Congregation_ID?: number | null;
  Congregation_Name?: string | null;
};

// Household member (same as Contact but with additional position info)
export interface HouseholdMember extends Contact {
  Household_Position?: string;
  Gender?: string;
}

// Household type
export type Household = {
  Household_ID: number;
  Household_Name: string;
  Home_Phone: string | null;
  Congregation_Name?: string | null;
  Address?: {
    Address_ID: number;
    Address_Line_1?: string | null;
    Address_Line_2?: string | null;
    City?: string | null;
    State?: string | null;
    Postal_Code?: string | null;
  } | null;
};

// Response type for household with members
export interface HouseholdWithMembersResponse {
  Household: Household;
  Members: HouseholdMember[];
}

/**
 * Search for contacts by name, email, or phone
 */
export async function searchContacts(query: string, skip: number = 0): Promise<Contact[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const mpClient = new MinistryPlatformClient();
  const tableService = new TableService(mpClient);
  const searchTerm = query.trim();

  // Build filter for name, email, or phone search
  let filter = `(Display_Name LIKE '%${searchTerm}%' OR First_Name LIKE '%${searchTerm}%' OR Last_Name LIKE '%${searchTerm}%' OR Nickname LIKE '%${searchTerm}%' OR Company_Name LIKE '%${searchTerm}%' OR Email_Address LIKE '%${searchTerm}%' OR Mobile_Phone LIKE '%${searchTerm}%' OR Company_Phone LIKE '%${searchTerm}%'`;

  // If search has a space, handle "First Last" format
  if (searchTerm.includes(' ')) {
    const parts = searchTerm.split(' ').filter((p) => p.length > 0);
    if (parts.length === 2) {
      const [part1, part2] = parts;
      filter += ` OR (First_Name LIKE '%${part1}%' AND Last_Name LIKE '%${part2}%') OR (First_Name LIKE '%${part2}%' AND Last_Name LIKE '%${part1}%') OR (Nickname LIKE '%${part1}%' AND Last_Name LIKE '%${part2}%') OR (Nickname LIKE '%${part2}%' AND Last_Name LIKE '%${part1}%')`;
    }
  }

  filter += ')';

  return tableService.getTableRecords<Contact>('Contacts', {
    $filter: filter,
    $select:
      'Contacts.Contact_ID,First_Name,Last_Name,Nickname,Display_Name,Email_Address,Mobile_Phone,Company_Phone,Date_of_Birth,Gender_ID,Marital_Status_ID,Contacts.Household_ID,Household_Position_ID,Participant_Record,Company,Company_Name,__Age,Contact_Status_ID,dp_fileUniqueId AS Image_GUID,Household_ID_Table.Congregation_ID AS Congregation_ID,Household_ID_Table_Congregation_ID_Table.Congregation_Name AS Congregation_Name',
    $orderby: 'Company,Contact_Status_ID,Last_Name,Nickname,First_Name',
    $top: 50,
    $skip: skip,
  });
}

/**
 * Get a single contact by ID
 */
export async function getContactById(contactId: number): Promise<Contact | null> {
  const mpClient = new MinistryPlatformClient();
  const tableService = new TableService(mpClient);

  const results = await tableService.getTableRecords<Contact>('Contacts', {
    $filter: `Contact_ID = ${contactId}`,
    $select:
      'Contact_ID,First_Name,Last_Name,Nickname,Display_Name,Email_Address,Mobile_Phone,Company_Phone,Date_of_Birth,Gender_ID,Marital_Status_ID,Household_ID,Household_Position_ID,Participant_Record,Company,Company_Name,__Age,Contact_Status_ID,dp_fileUniqueId AS Image_GUID',
  });

  return results[0] || null;
}

/**
 * Get household info and all members by Household_ID
 */
export async function getHouseholdWithMembers(
  householdId: number,
  selectedContactId?: number
): Promise<HouseholdWithMembersResponse | null> {
  const mpClient = new MinistryPlatformClient();
  const tableService = new TableService(mpClient);

  type HouseholdRecord = {
    Household_ID: number;
    Household_Name: string;
    Home_Phone: string | null;
    Address_ID: number | null;
    Congregation_ID: number | null;
    Congregation_Name?: string | null;
  };

  type AddressRecord = {
    Address_ID: number;
    Address_Line_1: string | null;
    Address_Line_2: string | null;
    City: string | null;
    'State/Region': string | null;
    Postal_Code: string | null;
  };

  type MemberRecord = {
    Contact_ID: number;
    First_Name: string | null;
    Last_Name: string;
    Nickname: string | null;
    Display_Name: string;
    Email_Address: string | null;
    Mobile_Phone: string | null;
    Company_Phone: string | null;
    Date_of_Birth: string | null;
    Gender_ID: number | null;
    Household_Position_ID: number | null;
    __Age: number | null;
    Contact_Status_ID: number | null;
    Image_GUID: string | null;
    Household_Position?: string | null;
    Gender?: string | null;
  };

  // Get household info
  const households = await tableService.getTableRecords<HouseholdRecord>('Households', {
    $filter: `Household_ID = ${householdId}`,
    $select:
      'Household_ID,Household_Name,Home_Phone,Address_ID,Households.Congregation_ID,Congregation_ID_Table.Congregation_Name AS Congregation_Name',
  });

  if (households.length === 0) {
    return null;
  }

  const householdRecord = households[0];

  // Get address if available
  let address: Household['Address'] = null;
  if (householdRecord.Address_ID) {
    const addresses = await tableService.getTableRecords<AddressRecord>('Addresses', {
      $filter: `Address_ID = ${householdRecord.Address_ID}`,
      $select: 'Address_ID,Address_Line_1,Address_Line_2,City,[State/Region],Postal_Code',
    });
    if (addresses.length > 0) {
      const addr = addresses[0];
      address = {
        Address_ID: addr.Address_ID,
        Address_Line_1: addr.Address_Line_1,
        Address_Line_2: addr.Address_Line_2,
        City: addr.City,
        State: addr['State/Region'],
        Postal_Code: addr.Postal_Code,
      };
    }
  }

  // Get all contacts in this household
  const members = await tableService.getTableRecords<MemberRecord>('Contacts', {
    $filter: `Household_ID = ${householdId}`,
    $select:
      'Contact_ID,First_Name,Last_Name,Nickname,Display_Name,Email_Address,Mobile_Phone,Company_Phone,Date_of_Birth,Contacts.Gender_ID,Contacts.Household_Position_ID,__Age,Contact_Status_ID,dp_fileUniqueId AS Image_GUID,Household_Position_ID_Table.Household_Position AS Household_Position,Gender_ID_Table.Gender AS Gender',
    $orderby: 'Contacts.Household_Position_ID,Last_Name,First_Name',
  });

  // Transform to HouseholdMember format
  const householdMembers: HouseholdMember[] = members.map((m) => ({
    Contact_ID: m.Contact_ID,
    First_Name: m.First_Name,
    Last_Name: m.Last_Name,
    Nickname: m.Nickname,
    Display_Name: m.Display_Name,
    Email_Address: m.Email_Address,
    Mobile_Phone: m.Mobile_Phone,
    Company_Phone: m.Company_Phone,
    Date_of_Birth: m.Date_of_Birth,
    Gender_ID: m.Gender_ID,
    Marital_Status_ID: null,
    Household_ID: householdId,
    Household_Position_ID: m.Household_Position_ID,
    Participant_Record: null,
    Company: null,
    Company_Name: null,
    __Age: m.__Age,
    Contact_Status_ID: m.Contact_Status_ID,
    Congregation_ID: householdRecord.Congregation_ID,
    Household_Position: m.Household_Position || undefined,
    Gender: m.Gender || undefined,
    // Pass the raw GUID so client can construct URL with proper env var
    Image_GUID: m.Image_GUID || undefined,
  }));

  return {
    Household: {
      Household_ID: householdRecord.Household_ID,
      Household_Name: householdRecord.Household_Name,
      Home_Phone: householdRecord.Home_Phone,
      Congregation_Name: householdRecord.Congregation_Name || null,
      Address: address,
    },
    Members: householdMembers,
  };
}
