export interface EventDetail {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dateDisplay: string;
  location: string;
  address?: string;
  capacity?: number;
  registered?: number;
  cost?: string;
  badge?: string;
  isFeatured: boolean;
  schedule?: { day: string; items: { time: string; title: string }[] }[];
  servingOpportunities?: {
    id: string;
    title: string;
    description: string;
    spotsNeeded: number;
    team: string;
  }[];
  contacts?: { name: string; role: string; email?: string }[];
}

export const MOCK_EVENTS: Record<string, EventDetail> = {
  '456': {
    id: '456',
    title: 'Winter Retreat 2026',
    description:
      'Get away from the busyness of life and spend a weekend focused on growing closer to God and building deeper relationships. This retreat is open to all adults and features worship, teaching, small group discussions, and plenty of time for outdoor activities and rest.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop',
    dateDisplay: 'Feb 21-23, 2026',
    location: 'Camp Barakel',
    address: '7888 Eckerman Rd, Fairview, MI 48621',
    capacity: 120,
    registered: 87,
    cost: '$149 per person',
    badge: 'Retreat',
    isFeatured: true,
    schedule: [
      {
        day: 'Friday',
        items: [
          { time: '6:00 PM', title: 'Check-In & Dinner' },
          { time: '7:30 PM', title: 'Opening Session' },
          { time: '9:00 PM', title: "Bonfire & S'mores" },
        ],
      },
      {
        day: 'Saturday',
        items: [
          { time: '8:00 AM', title: 'Breakfast' },
          { time: '9:30 AM', title: 'Morning Session' },
          { time: '11:00 AM', title: 'Small Groups' },
          { time: '12:00 PM', title: 'Lunch' },
          { time: '1:30 PM', title: 'Free Time & Activities' },
          { time: '5:30 PM', title: 'Dinner' },
          { time: '7:00 PM', title: 'Evening Session' },
        ],
      },
      {
        day: 'Sunday',
        items: [
          { time: '8:00 AM', title: 'Breakfast' },
          { time: '9:30 AM', title: 'Closing Session & Worship' },
          { time: '11:00 AM', title: 'Check-Out' },
        ],
      },
    ],
    servingOpportunities: [
      {
        id: 'so1',
        title: 'Registration Team',
        description: 'Help check in attendees on Friday evening',
        spotsNeeded: 3,
        team: 'Event Team',
      },
      {
        id: 'so2',
        title: 'Worship Team',
        description: 'Lead worship during sessions',
        spotsNeeded: 2,
        team: 'Worship',
      },
      {
        id: 'so3',
        title: 'Small Group Leader',
        description: 'Facilitate small group discussions on Saturday',
        spotsNeeded: 4,
        team: 'Groups',
      },
      {
        id: 'so4',
        title: 'Activities Coordinator',
        description: 'Organize and lead Saturday afternoon activities',
        spotsNeeded: 2,
        team: 'Event Team',
      },
    ],
    contacts: [
      { name: 'Sarah Johnson', role: 'Event Coordinator', email: 'sarah@example.com' },
      { name: 'Mike Peters', role: 'Worship Director', email: 'mike@example.com' },
    ],
  },
  '789': {
    id: '789',
    title: 'Staff Meeting',
    description:
      'Weekly all-staff meeting to discuss upcoming events, ministry updates, and team coordination.',
    imageUrl: '',
    dateDisplay: 'Thu, Feb 13, 2026',
    location: 'Conference Room A',
    isFeatured: false,
    schedule: [
      {
        day: 'Thursday',
        items: [
          { time: '9:00 AM', title: 'Welcome & Updates' },
          { time: '9:30 AM', title: 'Ministry Reports' },
          { time: '10:15 AM', title: 'Discussion & Prayer' },
        ],
      },
    ],
  },
};

export function getEventById(id: string): EventDetail | undefined {
  return MOCK_EVENTS[id];
}
