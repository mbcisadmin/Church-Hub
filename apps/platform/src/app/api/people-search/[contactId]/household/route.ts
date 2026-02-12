import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { getContactById, getHouseholdWithMembers } from '@/services/peopleSearchService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId } = await params;

    // Get contact to find household ID
    const contact = await getContactById(parseInt(contactId));

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (!contact.Household_ID) {
      return NextResponse.json({
        Household: null,
        Members: [],
      });
    }

    // Get household with all members using stored procedure
    const result = await getHouseholdWithMembers(contact.Household_ID, parseInt(contactId));

    if (!result) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching household:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch household',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
