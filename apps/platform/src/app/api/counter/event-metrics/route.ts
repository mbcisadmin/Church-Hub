import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { createEventMetric } from '@/services/counterService';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { Event_ID, Metric_ID, Numerical_Value } = body;

    if (!Event_ID || !Metric_ID || Numerical_Value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = parseInt(session.userId, 10);
    const eventMetric = await createEventMetric({ Event_ID, Metric_ID, Numerical_Value }, userId);

    return NextResponse.json(eventMetric, { status: 201 });
  } catch (error) {
    console.error('Error creating event metric:', error);
    return NextResponse.json({ error: 'Failed to create event metric' }, { status: 500 });
  }
}
