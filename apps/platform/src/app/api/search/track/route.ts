import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { db, searchHistory } from '@church/database';
import { eq, and, desc } from 'drizzle-orm';

const MAX_HISTORY_PER_USER = 20;

interface TrackRequest {
  resultType: string;
  resultId: string;
  resultTitle: string;
  resultSubtitle?: string;
  resultRoute: string;
  resultIcon?: string;
  resultImageUrl?: string;
}

/**
 * POST /api/search/track
 * Tracks a clicked search result for the current user.
 *
 * If the same result (by type + id) already exists in history,
 * it updates the clicked_at timestamp instead of creating a duplicate.
 */
export async function POST(request: NextRequest) {
  console.log('[Search Track] Request received');
  try {
    const session = await auth();
    console.log('[Search Track] Session details:', {
      hasSession: !!session,
      contactId: session?.contactId,
      userId: session?.userId,
      email: session?.email,
      isAdmin: session?.isAdmin,
    });

    if (!session?.contactId) {
      console.log('[Search Track] No contactId - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: TrackRequest = await request.json();
    console.log('[Search Track] Body:', body);

    const {
      resultType,
      resultId,
      resultTitle,
      resultSubtitle,
      resultRoute,
      resultIcon,
      resultImageUrl,
    } = body;

    if (!resultType || !resultId || !resultTitle || !resultRoute) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contactId = parseInt(session.contactId, 10);

    if (isNaN(contactId)) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }

    // Check if this result already exists in history
    const existing = await db
      .select()
      .from(searchHistory)
      .where(
        and(
          eq(searchHistory.contactId, contactId),
          eq(searchHistory.resultType, resultType),
          eq(searchHistory.resultId, resultId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update the existing entry's timestamp to move it to the top
      await db
        .update(searchHistory)
        .set({
          clickedAt: new Date(),
          resultTitle, // Update in case it changed
          resultSubtitle,
          resultRoute,
          resultIcon,
          resultImageUrl,
        })
        .where(eq(searchHistory.id, existing[0].id));
    } else {
      // Insert new entry
      await db.insert(searchHistory).values({
        contactId,
        resultType,
        resultId,
        resultTitle,
        resultSubtitle,
        resultRoute,
        resultIcon,
        resultImageUrl,
      });

      // Clean up old entries if over limit
      const allEntries = await db
        .select({ id: searchHistory.id })
        .from(searchHistory)
        .where(eq(searchHistory.contactId, contactId))
        .orderBy(desc(searchHistory.clickedAt));

      if (allEntries.length > MAX_HISTORY_PER_USER) {
        const idsToDelete = allEntries.slice(MAX_HISTORY_PER_USER).map((e) => e.id);
        for (const id of idsToDelete) {
          await db.delete(searchHistory).where(eq(searchHistory.id, id));
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Search track error:', error);
    return NextResponse.json({ error: 'Failed to track search' }, { status: 500 });
  }
}
