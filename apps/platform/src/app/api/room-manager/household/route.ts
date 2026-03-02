import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { MinistryPlatformClient, TableService } from '@church/ministry-platform';
import { getHouseholdWithMembers } from '@/services/peopleSearchService';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const participantId = request.nextUrl.searchParams.get('participantId');
    if (!participantId) {
      return NextResponse.json(
        { error: 'Missing required parameter: participantId' },
        { status: 400 }
      );
    }

    // Look up the Contact's Household_ID via Participant_Record
    const mpClient = new MinistryPlatformClient();
    const tableService = new TableService(mpClient);

    const contacts = await tableService.getTableRecords<{
      Contact_ID: number;
      Household_ID: number | null;
    }>('Contacts', {
      $filter: `Participant_Record = ${parseInt(participantId)}`,
      $select: 'Contact_ID,Household_ID',
      $top: 1,
    });

    const contactId = contacts[0].Contact_ID;

    if (!contacts[0].Household_ID) {
      return NextResponse.json({ contactId, household: null });
    }

    const result = await getHouseholdWithMembers(contacts[0].Household_ID, contactId);
    if (result) {
      // Filter out deceased members (Date_of_Death set) and position ID 7
      result.Members = result.Members.filter(
        (m) => !m.Date_of_Death && m.Household_Position_ID !== 7
      );
    }
    return NextResponse.json({ contactId, household: result });
  } catch (error) {
    console.error('Error fetching household data:', error);
    return NextResponse.json({ error: 'Failed to fetch household data' }, { status: 500 });
  }
}
