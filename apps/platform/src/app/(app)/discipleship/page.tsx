'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  BookOpen,
  GraduationCap,
  Droplets,
  Users,
  Trophy,
  Rocket,
  Plus,
  Search,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';

// Growth Track milestones
const GROWTH_TRACK = [
  { id: '1', label: 'Salvation', completed: true },
  { id: '2', label: 'Baptism', completed: true },
  { id: '3', label: 'Membership', completed: true },
  { id: '4', label: 'Discover Your Gifts', completed: false },
  { id: '5', label: 'Join a Group', completed: false },
  { id: '6', label: 'Serve on a Team', completed: false },
];

const UPCOMING_CLASSES = [
  {
    id: '1',
    title: 'Starting Point',
    description: 'New here? Start your journey.',
    date: 'Sun, Feb 16',
    time: '11:00 AM',
    location: 'Room 201',
    spots: 12,
  },
  {
    id: '2',
    title: 'Baptism Class',
    description: 'Learn about the meaning of baptism',
    date: 'Sun, Feb 23',
    time: '12:30 PM',
    location: 'Chapel',
    spots: 8,
  },
  {
    id: '3',
    title: 'Financial Peace',
    description: 'Dave Ramsey curriculum',
    date: 'Wed, Mar 5',
    time: '6:30 PM',
    location: 'Room 105',
    spots: 20,
  },
];

const DISCIPLESHIP_APPS = [
  {
    id: 'my-journey',
    name: 'My Journey',
    description: 'Track your spiritual growth milestones',
    icon: Trophy,
    route: '/discipleship/my-journey',
  },
  {
    id: 'classes',
    name: 'Classes',
    description: 'Browse and register for classes',
    icon: GraduationCap,
    route: '/discipleship/classes',
  },
  {
    id: 'baptism',
    name: 'Baptism',
    description: 'Sign up to be baptized',
    icon: Droplets,
    route: '/discipleship/baptism',
  },
  {
    id: 'growth-track',
    name: 'Growth Track',
    description: 'Your path to spiritual maturity',
    icon: BookOpen,
    route: '/discipleship/growth-track',
  },
  {
    id: 'membership',
    name: 'Membership',
    description: 'Become a church member',
    icon: Users,
    route: '/discipleship/membership',
  },
];

export default function DiscipleshipPage() {
  const router = useRouter();
  const { accessLevel } = useTestingContext();
  const { buildUrl } = usePreserveParams();

  const pageActions = useMemo(
    () => [
      {
        key: 'classes',
        icon: Search,
        label: 'Browse classes',
        variant: 'secondary' as const,
        onAction: () => router.push(buildUrl('/discipleship/classes')),
      },
      {
        key: 'new',
        icon: Plus,
        label: 'Start new journey',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/discipleship/new')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Discipleship | The Hub';
  }, []);

  const completedSteps = GROWTH_TRACK.filter((s) => s.completed).length;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionHeader
          title="Discipleship"
          subtitle="Grow in your faith journey"
          icon={Heart}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* Growth Track Progress */}
      <section className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-sm font-semibold">Growth Track</h3>
              <p className="text-muted-foreground text-xs">
                {completedSteps} of {GROWTH_TRACK.length} milestones completed
              </p>
            </div>
            <span className="text-primary text-sm font-bold">
              {Math.round((completedSteps / GROWTH_TRACK.length) * 100)}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${(completedSteps / GROWTH_TRACK.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="divide-y">
          {GROWTH_TRACK.map((step) => (
            <div key={step.id} className="flex items-center gap-3 px-4 py-3">
              {step.completed ? (
                <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
              ) : (
                <Circle className="text-muted-foreground h-5 w-5 shrink-0" />
              )}
              <span
                className={`text-sm ${step.completed ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Classes */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle
          icon={GraduationCap}
          title="Upcoming Classes"
          subtitle="Register for an upcoming class"
          action="View all"
          onAction={() => router.push(buildUrl('/discipleship/classes'))}
        />
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
          {UPCOMING_CLASSES.map((cls) => (
            <button
              key={cls.id}
              onClick={() => router.push(buildUrl(`/discipleship/classes/${cls.id}`))}
              className="hover:bg-muted/50 flex w-full items-center justify-between border-b p-4 text-left transition-colors last:border-b-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground text-sm font-medium">{cls.title}</span>
                <span className="text-muted-foreground text-xs">{cls.description}</span>
                <span className="text-muted-foreground text-xs">
                  {cls.date} · {cls.time} · {cls.location}
                </span>
              </div>
              <span className="text-primary shrink-0 text-xs font-medium">{cls.spots} spots</span>
            </button>
          ))}
        </div>
      </section>

      {/* Apps */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Discipleship tools" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {DISCIPLESHIP_APPS.map((app) => (
            <AppCard
              key={app.id}
              name={app.name}
              description={app.description}
              icon={app.icon}
              onClick={() => router.push(buildUrl(app.route))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
