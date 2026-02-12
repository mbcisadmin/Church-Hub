import { redirect } from 'next/navigation';
import { auth } from '@church/nextjs-auth';
import {
  checkAppPermission,
  getAccessibleApplications,
  type PermissionResult,
} from '@church/database/neon';

/**
 * Check if the current user has access to an app.
 * Use in server components to protect pages.
 *
 * @example
 * ```tsx
 * export default async function CounterPage() {
 *   await requireAppAccess('counter');
 *   // User has access, render the page
 *   return <div>Counter App</div>;
 * }
 * ```
 */
export async function requireAppAccess(appKey: string): Promise<PermissionResult> {
  const session = await auth();

  if (!session) {
    redirect('/signin');
  }

  const permission = await checkAppPermission(
    appKey,
    session.roles || [],
    session.email || null,
    session.isAdmin
  );

  if (!permission.hasAccess) {
    redirect('/403');
  }

  return permission;
}

/**
 * Get the current user's accessible apps.
 * Use in server components to build navigation.
 *
 * @example
 * ```tsx
 * export default async function Navigation() {
 *   const apps = await getUserApps('app');
 *   return <nav>{apps.map(app => ...)}</nav>;
 * }
 * ```
 */
export async function getUserApps(type?: 'app' | 'dashboard') {
  try {
    const session = await auth();

    if (!session) {
      return [];
    }

    // TEMP WORKAROUND: If no roles and not admin, the stored procedure likely failed
    // Show all apps for authenticated users until stored procedure is installed
    const hasNoRoleData = !session.isAdmin && (!session.roles || session.roles.length === 0);

    if (hasNoRoleData) {
      console.log(
        'No role data available - showing all apps (stored procedure may not be installed)'
      );
      const { getAllApplications } = await import('@church/database/neon');
      const allApps = await getAllApplications();
      const filtered = type ? allApps.filter((app) => app.type === type) : allApps;
      return filtered.map((app) => ({
        ...app,
        permission: {
          hasAccess: true,
          canView: true,
          canEdit: true,
          canDelete: true,
          reason: 'admin' as const,
        },
      }));
    }

    return getAccessibleApplications(
      session.roles || [],
      session.email || null,
      session.isAdmin,
      type
    );
  } catch (error) {
    console.error('Error getting user apps:', error);
    return [];
  }
}

/**
 * Check if user has a specific permission level for an app.
 * Returns null if no access.
 *
 * @example
 * ```tsx
 * const permission = await checkAccess('counter');
 * if (permission?.canEdit) {
 *   // Show edit button
 * }
 * ```
 */
export async function checkAccess(appKey: string): Promise<PermissionResult | null> {
  const session = await auth();

  if (!session) {
    return null;
  }

  const permission = await checkAppPermission(
    appKey,
    session.roles || [],
    session.email || null,
    session.isAdmin
  );

  return permission.hasAccess ? permission : null;
}
