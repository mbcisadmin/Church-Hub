import { NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { getAccessibleApplications, getAllApplications } from '@church/database/neon';

/**
 * GET /api/permissions/apps
 *
 * Returns all applications the current user has access to.
 * Query params:
 *   - type: 'app' | 'dashboard' (optional filter)
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'app' | 'dashboard' | null;

    // TEMP WORKAROUND: If no roles and not admin, the stored procedure likely failed
    // Show all apps for authenticated users until stored procedure is installed
    const hasNoRoleData = !session.isAdmin && (!session.roles || session.roles.length === 0);

    let apps;
    if (hasNoRoleData) {
      console.log(
        'No role data available - showing all apps (stored procedure may not be installed)'
      );
      const allApps = await getAllApplications();
      const filtered = type ? allApps.filter((app) => app.type === type) : allApps;
      apps = filtered.map((app) => ({
        ...app,
        permission: {
          hasAccess: true,
          canView: true,
          canEdit: true,
          canDelete: true,
          reason: 'admin' as const,
        },
      }));
    } else {
      apps = await getAccessibleApplications(
        session.roles || [],
        session.email || null,
        session.isAdmin,
        type || undefined
      );
    }

    return NextResponse.json({
      apps: apps.map((app) => ({
        id: app.id,
        name: app.name,
        key: app.key,
        type: app.type,
        description: app.description,
        route: app.route,
        icon: app.icon,
        illustration: app.illustration,
        permission: {
          canView: app.permission.canView,
          canEdit: app.permission.canEdit,
          canDelete: app.permission.canDelete,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching accessible apps:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
