import { NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { searchContacts } from '@church/ministry-platform';

/**
 * GET /api/admin/contacts/search
 *
 * Search for contacts by name or email (admin only).
 * Used for the impersonation modal.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    // Check if user is an administrator
    if (!session?.email || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const contacts = await searchContacts(query, parseInt(session.userId, 10));

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error searching contacts:', error);
    return NextResponse.json({ error: 'Failed to search contacts' }, { status: 500 });
  }
}
