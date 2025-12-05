import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
    firstName: string;
    lastName: string;
    email: string;
    sub: string;
    contactId: string;
    roles?: string[];
    simulation?: {
      type: 'impersonate' | 'roles';
      contactId?: string;
      originalUserId?: string;
      originalRoles?: string[];
    };
  }
}
