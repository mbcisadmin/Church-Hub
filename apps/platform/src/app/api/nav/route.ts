import { NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { getNavigationData, getAllApplications } from '@church/database/neon';
import { db, categories } from '@church/database';
import { eq } from 'drizzle-orm';

/**
 * GET /api/nav
 * Returns categories with their accessible applications for building the nav.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasNoRoleData = !session.isAdmin && (!session.roles || session.roles.length === 0);

    let navData;
    if (hasNoRoleData) {
      // Fallback: show all categories and apps
      const allCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(categories.sortOrder);

      const allApps = await getAllApplications();
      navData = allCategories.map((cat) => ({
        ...cat,
        apps: allApps
          .filter((app) => app.categoryId === cat.id)
          .map((app) => ({
            ...app,
            permission: {
              hasAccess: true,
              canView: true,
              canEdit: true,
              canDelete: true,
              reason: 'admin' as const,
            },
          })),
      }));
    } else {
      navData = await getNavigationData(
        session.roles || [],
        session.email || null,
        session.isAdmin
      );
    }

    return NextResponse.json({
      categories: navData.map((cat) => ({
        id: cat.id,
        name: cat.name,
        key: cat.key,
        icon: cat.icon,
        route: cat.route,
        addActionUrl: cat.addActionUrl,
        addActionLabel: cat.addActionLabel,
        apps: cat.apps.map((app) => ({
          id: app.id,
          name: app.name,
          key: app.key,
          route: app.route,
          icon: app.icon,
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching nav data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
