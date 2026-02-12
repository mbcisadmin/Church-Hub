import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken: string;
    idToken?: string;
    // User profile info (from stored procedure)
    firstName: string;
    lastName: string;
    nickname?: string;
    email: string;
    mobilePhone?: string;
    image?: string; // Full URL to profile image
    // IDs
    sub: string; // User_GUID from OAuth
    userId: string; // User_ID for MP audit logging ($userId)
    contactId: string; // Contact_ID for MP relationships
    householdId?: string; // Household_ID for profile data
    // Permissions
    isAdmin: boolean; // True if user has the admin security role
    roles?: string[]; // User Groups from MP (not security roles)
    // Admin impersonation
    simulation?: {
      type: 'impersonate' | 'roles';
      contactId?: string;
      originalUserId?: string;
      originalRoles?: string[];
      originalIsAdmin?: boolean;
    };
  }
}
