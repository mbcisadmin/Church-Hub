import { eq, and, or, inArray } from 'drizzle-orm';
import { db } from '../client';
import {
  applications,
  appPermissions,
  type Application,
  type AppPermission,
} from '../schemas/applications';

/**
 * Permission check result
 */
export interface PermissionResult {
  hasAccess: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  reason: 'admin' | 'role' | 'email' | 'denied';
}

/**
 * Check if a user has access to an application
 *
 * @param appKey - The application key (e.g., 'counter', 'circles')
 * @param userRoles - Array of User Group names the user belongs to
 * @param userEmail - The user's email address
 * @param isAdmin - Whether the user is an admin (has the admin security role)
 * @returns PermissionResult with access details
 */
export async function checkAppPermission(
  appKey: string,
  userRoles: string[],
  userEmail: string | null,
  isAdmin: boolean
): Promise<PermissionResult> {
  // Admins have full access to everything
  if (isAdmin) {
    return {
      hasAccess: true,
      canView: true,
      canEdit: true,
      canDelete: true,
      reason: 'admin',
    };
  }

  // Get the application
  const app = await db
    .select()
    .from(applications)
    .where(and(eq(applications.key, appKey), eq(applications.isActive, true)))
    .limit(1);

  if (app.length === 0) {
    return {
      hasAccess: false,
      canView: false,
      canEdit: false,
      canDelete: false,
      reason: 'denied',
    };
  }

  const application = app[0];

  // If app doesn't require auth, grant view access
  if (!application.requiresAuth) {
    return {
      hasAccess: true,
      canView: true,
      canEdit: false,
      canDelete: false,
      reason: 'denied', // Not really denied, but no specific grant
    };
  }

  // Check permissions for this application
  const conditions = [eq(appPermissions.applicationId, application.id)];

  // Build OR conditions for email or role match
  const matchConditions = [];

  if (userEmail) {
    matchConditions.push(eq(appPermissions.userEmail, userEmail));
  }

  if (userRoles.length > 0) {
    matchConditions.push(inArray(appPermissions.roleName, userRoles));
  }

  if (matchConditions.length === 0) {
    // No email or roles to match against
    return {
      hasAccess: false,
      canView: false,
      canEdit: false,
      canDelete: false,
      reason: 'denied',
    };
  }

  const permissions = await db
    .select()
    .from(appPermissions)
    .where(and(eq(appPermissions.applicationId, application.id), or(...matchConditions)));

  if (permissions.length === 0) {
    return {
      hasAccess: false,
      canView: false,
      canEdit: false,
      canDelete: false,
      reason: 'denied',
    };
  }

  // Aggregate permissions (if multiple matches, use highest permission)
  const result: PermissionResult = {
    hasAccess: false,
    canView: false,
    canEdit: false,
    canDelete: false,
    reason: 'denied',
  };

  for (const perm of permissions) {
    if (perm.canView) result.canView = true;
    if (perm.canEdit) result.canEdit = true;
    if (perm.canDelete) result.canDelete = true;

    // Determine reason (prefer role over email)
    if (perm.roleName && userRoles.includes(perm.roleName)) {
      result.reason = 'role';
    } else if (perm.userEmail && result.reason !== 'role') {
      result.reason = 'email';
    }
  }

  result.hasAccess = result.canView || result.canEdit || result.canDelete;

  return result;
}

/**
 * Get all applications a user has access to
 *
 * @param userRoles - Array of User Group names the user belongs to
 * @param userEmail - The user's email address
 * @param isAdmin - Whether the user is an admin
 * @param type - Optional filter by application type ('app' | 'dashboard')
 * @returns Array of applications with permission details
 */
export async function getAccessibleApplications(
  userRoles: string[],
  userEmail: string | null,
  isAdmin: boolean,
  type?: 'app' | 'dashboard'
): Promise<(Application & { permission: PermissionResult })[]> {
  // Get all active applications
  const query = db
    .select()
    .from(applications)
    .where(eq(applications.isActive, true))
    .orderBy(applications.sortOrder);

  let apps = await query;

  // Filter by type if specified
  if (type) {
    apps = apps.filter((app) => app.type === type);
  }

  // Check permissions for each app
  const results = await Promise.all(
    apps.map(async (app) => {
      const permission = await checkAppPermission(app.key, userRoles, userEmail, isAdmin);
      return { ...app, permission };
    })
  );

  // Return only apps the user has access to
  return results.filter((app) => app.permission.hasAccess);
}

/**
 * Get all applications (for admin management)
 *
 * @param includeInactive - Whether to include inactive applications
 * @returns Array of all applications
 */
export async function getAllApplications(includeInactive = false): Promise<Application[]> {
  if (includeInactive) {
    return db.select().from(applications).orderBy(applications.sortOrder);
  }

  return db
    .select()
    .from(applications)
    .where(eq(applications.isActive, true))
    .orderBy(applications.sortOrder);
}

/**
 * Get permissions for an application (for admin management)
 *
 * @param appKey - The application key
 * @returns Array of permissions for the application
 */
export async function getAppPermissions(appKey: string): Promise<AppPermission[]> {
  const app = await db.select().from(applications).where(eq(applications.key, appKey)).limit(1);

  if (app.length === 0) {
    return [];
  }

  return db.select().from(appPermissions).where(eq(appPermissions.applicationId, app[0].id));
}
