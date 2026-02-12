import { MinistryPlatformClient } from '../core/client';
import { TableService } from './tableService';

interface Contact {
  Contact_ID: number;
  Display_Name: string;
  Email_Address: string | null;
  First_Name: string | null;
  Last_Name: string | null;
  Nickname: string | null;
  User_Account: number | null;
  dp_fileUniqueId: string | null;
}

// Create shared client and service instances
const mpClient = new MinistryPlatformClient();
const tableService = new TableService(mpClient);

/**
 * Search for contacts by name or email.
 * Only returns contacts with a User_Account (i.e., they can log in).
 *
 * @param query - Search term (min 2 characters)
 * @param userId - User ID for audit logging
 * @param limit - Max results (default 20)
 */
export async function searchContacts(
  query: string,
  userId: number,
  limit: number = 20
): Promise<Contact[]> {
  // Escape single quotes in query for SQL safety
  const safeQuery = query.replace(/'/g, "''");

  const contacts = await tableService.getTableRecords<Contact>('Contacts', {
    $select:
      'Contact_ID, Display_Name, Email_Address, First_Name, Last_Name, Nickname, User_Account, dp_fileUniqueId',
    $filter: `(Display_Name LIKE '%${safeQuery}%' OR Email_Address LIKE '%${safeQuery}%') AND User_Account IS NOT NULL`,
    $orderby: 'Display_Name',
    $top: limit,
  });

  return contacts;
}

/**
 * Get a single contact by ID.
 *
 * @param contactId - Contact ID to fetch
 * @param userId - User ID for audit logging
 */
export async function getContactById(contactId: number, userId: number): Promise<Contact | null> {
  const contacts = await tableService.getTableRecords<Contact>('Contacts', {
    $select:
      'Contact_ID, Display_Name, Email_Address, First_Name, Last_Name, Nickname, User_Account, dp_fileUniqueId',
    $filter: `Contact_ID = ${contactId}`,
    $top: 1,
  });

  return contacts.length > 0 ? contacts[0] : null;
}
