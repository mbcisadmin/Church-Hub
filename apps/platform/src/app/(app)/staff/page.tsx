'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Users,
  GraduationCap,
  FileText,
  Search,
  Plus,
  Rocket,
  Phone,
  Mail,
} from 'lucide-react';
import { DetailPanelPortal } from '../_components/DetailPanelPortal';
import type { PersonDetail } from '../_components/PersonDetailPanel';
import { SectionHeader } from '@/components/ui/section-header';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { usePreserveParams } from '@/lib/usePreserveParams';

const STAFF_DIRECTORY: PersonDetail[] = [
  {
    id: '1',
    name: 'Pastor James Wilson',
    title: 'Senior Pastor',
    department: 'Executive',
    phone: '(555) 123-4501',
    email: 'james@example.com',
    imageUrl: null,
    location: 'Main Campus, Office 201',
    bio: 'Pastor James has led the congregation for over a decade, passionate about reaching people and helping them take their next step toward Christ.',
  },
  {
    id: '2',
    name: 'Pastor David Chen',
    title: 'Executive Pastor',
    department: 'Executive',
    phone: '(555) 123-4502',
    email: 'david@example.com',
    imageUrl: null,
    location: 'Main Campus, Office 203',
    bio: 'Pastor David oversees the day-to-day operations of the church, including staff development, strategic planning, and organizational health.',
  },
  {
    id: '3',
    name: 'Pastor Maria Santos',
    title: 'Discipleship Pastor',
    department: 'Discipleship',
    phone: '(555) 123-4503',
    email: 'maria@example.com',
    imageUrl: null,
    location: 'Main Campus, Office 110',
    bio: 'Pastor Maria leads the discipleship and missional community initiatives. She is driven by helping people move from consumers to contributors, equipping them to live out their faith in everyday life.',
  },
  {
    id: '4',
    name: 'Pastor Kevin Brooks',
    title: 'Worship Pastor',
    department: 'Worship',
    phone: '(555) 123-4504',
    email: 'kevin@example.com',
    imageUrl: null,
    location: 'Main Campus, Auditorium Wing',
    bio: 'Pastor Kevin leads the worship and creative arts teams across all campuses. With a background in music production and live performance, he creates engaging weekend experiences that connect people to God.',
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    title: 'Communications Director',
    department: 'Communications',
    phone: '(555) 123-4505',
    email: 'lisa@example.com',
    imageUrl: null,
    location: 'Main Campus, Office 105',
    bio: 'Lisa leads all communications and marketing efforts for the church. She is focused on clear, compelling messaging that helps people take their next step.',
  },
];

const STAFF_APPS = [
  {
    id: 'directory',
    name: 'Directory',
    description: 'Search staff and contact info',
    icon: Users,
    route: '/staff',
  },
  {
    id: 'hr',
    name: 'HR Portal',
    description: 'Time off, benefits, and policies',
    icon: FileText,
    route: '/staff/hr',
  },
  {
    id: 'resources',
    name: 'Resources',
    description: 'Templates, guides, and brand assets',
    icon: FileText,
    route: '/staff/resources',
  },
  {
    id: 'training',
    name: 'Training',
    description: 'Required training and certifications',
    icon: GraduationCap,
    route: '/staff/training',
  },
];

export default function StaffPage() {
  const router = useRouter();
  const { buildUrl } = usePreserveParams();
  const [selectedPerson, setSelectedPerson] = useState<PersonDetail | null>(null);

  const pageActions = useMemo(
    () => [
      {
        key: 'search',
        icon: Search,
        label: 'Search staff',
        variant: 'secondary' as const,
        onAction: () => router.push(buildUrl('/staff')),
      },
      {
        key: 'add',
        icon: Plus,
        label: 'Add staff',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/staff/add')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Staff | The Hub';
  }, []);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="flex flex-col gap-6"
        onClick={() => selectedPerson && setSelectedPerson(null)}
      >
        <header>
          <SectionHeader
            title="Staff"
            subtitle="Team directory and resources"
            icon={Briefcase}
            variant="watermark"
            className="mb-0"
            actions={<DesktopActionBar />}
          />
        </header>

        {/* Staff Directory */}
        <section className="flex min-w-0 flex-col">
          <SectionTitle
            icon={Users}
            title="Staff Directory"
            subtitle={`${STAFF_DIRECTORY.length} team members`}
            action="View all"
            onAction={() => router.push(buildUrl('/staff'))}
          />
          <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            {STAFF_DIRECTORY.map((person) => (
              <button
                key={person.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPerson(person);
                }}
                className={`flex w-full items-center gap-4 border-b p-4 text-left transition-colors last:border-b-0 ${
                  selectedPerson?.id === person.id
                    ? 'bg-primary/10 ring-primary/30 ring-2 ring-inset'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <span className="text-muted-foreground text-sm font-semibold">
                    {person.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-foreground text-sm font-medium">{person.name}</span>
                  <p className="text-muted-foreground text-xs">
                    {person.title} · {person.department}
                  </p>
                </div>
                <div className="hidden items-center gap-3 md:flex">
                  <a
                    href={`mailto:${person.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  <a
                    href={`tel:${person.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Apps */}
        <section className="flex min-w-0 flex-col">
          <SectionTitle icon={Rocket} title="Apps" subtitle="Staff tools and resources" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {STAFF_APPS.map((app) => (
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

      <DetailPanelPortal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        profileUrl={selectedPerson ? buildUrl(`/staff/${selectedPerson.id}`) : undefined}
      />
    </>
  );
}
