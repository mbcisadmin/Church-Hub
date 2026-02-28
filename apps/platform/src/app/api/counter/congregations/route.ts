import { NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { getCongregations, getHouseholdCongregation } from '@/services/counterService';

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const householdId = session.householdId ? parseInt(session.householdId, 10) : null;

    const [congregations, householdCongregation] = await Promise.all([
      getCongregations(),
      householdId ? getHouseholdCongregation(householdId) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      congregations,
      userDefaultCongregation: householdCongregation,
    });
  } catch (error) {
    console.error('Error fetching congregations:', error);
    return NextResponse.json({ error: 'Failed to fetch congregations' }, { status: 500 });
  }
}
