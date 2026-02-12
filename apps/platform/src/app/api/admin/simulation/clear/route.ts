import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@church/nextjs-auth';

/**
 * POST /api/admin/simulation/clear
 *
 * Clear the current simulation session.
 * Available to admins and anyone currently in simulation mode.
 */
export async function POST() {
  try {
    const session = await auth();

    // Check if user is an administrator OR is currently in simulation mode
    // When simulating, session.simulation will exist even though roles may be overridden
    const isAdmin = session?.isAdmin;
    const isSimulating = session?.simulation != null;

    if (!session?.email || (!isAdmin && !isSimulating)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Clear all simulation cookies
    const cookieStore = await cookies();
    cookieStore.delete('admin-simulation');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing simulation:', error);
    return NextResponse.json({ error: 'Failed to clear simulation' }, { status: 500 });
  }
}
