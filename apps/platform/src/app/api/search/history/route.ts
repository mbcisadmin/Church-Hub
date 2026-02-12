import { NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { db, searchHistory } from '@church/database';
import { eq, desc } from 'drizzle-orm';
import { getAccessibleApplications } from '@church/database/neon';

const MAX_HISTORY_ITEMS = 10;

/**
 * GET /api/search/history
 * Returns the user's recent search history, filtered against current permissions.
 *
 * Apps and dashboards are filtered against current permissions.
 * Other result types (people, etc.) are returned as-is.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.contactId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contactId = parseInt(session.contactId, 10);

    if (isNaN(contactId)) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }

    // Get user's search history
    const history = await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.contactId, contactId))
      .orderBy(desc(searchHistory.clickedAt))
      .limit(MAX_HISTORY_ITEMS * 2); // Fetch extra in case some get filtered

    if (history.length === 0) {
      return NextResponse.json({ history: [] });
    }

    // Get user's accessible apps to filter history
    const hasNoRoleData = !session.isAdmin && (!session.roles || session.roles.length === 0);

    let accessibleRoutes: Set<string>;

    if (hasNoRoleData) {
      // Show all if no role data
      accessibleRoutes = new Set(history.map((h) => h.resultRoute));
    } else {
      const accessibleApps = await getAccessibleApplications(
        session.roles || [],
        session.email || null,
        session.isAdmin
      );
      accessibleRoutes = new Set(accessibleApps.map((app) => app.route));
    }

    // Filter history:
    // - Apps/dashboards: Only show if user still has access
    // - Other types (people, etc.): Always show
    const filteredHistory = history
      .filter((entry) => {
        if (entry.resultType === 'app' || entry.resultType === 'dashboard') {
          return accessibleRoutes.has(entry.resultRoute);
        }
        return true; // Non-app results are always shown
      })
      .slice(0, MAX_HISTORY_ITEMS);

    return NextResponse.json({
      history: filteredHistory.map((entry) => ({
        id: entry.id,
        type: entry.resultType,
        resultId: entry.resultId,
        title: entry.resultTitle,
        subtitle: entry.resultSubtitle,
        route: entry.resultRoute,
        icon: entry.resultIcon,
        imageUrl: entry.resultImageUrl,
        clickedAt: entry.clickedAt,
      })),
    });
  } catch (error) {
    console.error('Search history error:', error);
    return NextResponse.json({ error: 'Failed to fetch search history' }, { status: 500 });
  }
}
