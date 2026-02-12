'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign, Mail, Clock, Handshake } from 'lucide-react';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { OpportunityCard } from '@church/nextjs-ui/components/OpportunityCard';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { getEventById } from './_data/mockEventData';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { buildUrl } = usePreserveParams();
  const event = getEventById(params.id as string);

  useEffect(() => {
    if (event) {
      document.title = `${event.title} | Events | The Hub`;
    }
  }, [event]);

  if (!event) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <h1 className="text-foreground text-xl font-bold">Event Not Found</h1>
        <p className="text-muted-foreground text-sm">
          This event doesn&apos;t exist or has been removed.
        </p>
        <button
          onClick={() => router.push(buildUrl('/events'))}
          className="text-primary text-sm font-medium"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const capacityPercent =
    event.capacity && event.registered
      ? Math.round((event.registered / event.capacity) * 100)
      : null;

  return (
    <div className="-mx-4 -mt-12 flex flex-col md:-mx-6 md:-mt-16 lg:-mx-8">
      {/* Hero Image */}
      {event.imageUrl && (
        <div className="relative h-64 w-full md:h-80">
          <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Hero content */}
          <div className="absolute right-0 bottom-0 left-0 p-6">
            {event.badge && (
              <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-sm">
                {event.badge}
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-wide text-white uppercase md:text-3xl">
              {event.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {event.dateDisplay}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content area with padding restored */}
      <div className="flex flex-col gap-8 px-4 py-6 md:px-6 lg:px-8">
        {/* Registration / CTA Section */}
        {(event.capacity || event.cost) && (
          <section className="bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 text-sm font-bold tracking-wide uppercase transition-colors">
                Register Now
              </button>
              {event.cost && (
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <DollarSign className="h-3 w-3" />
                  {event.cost}
                </span>
              )}
            </div>

            {capacityPercent !== null && event.capacity && event.registered !== undefined && (
              <div className="flex flex-col gap-1.5 sm:items-end">
                <span className="text-foreground text-sm font-semibold">
                  {event.registered}/{event.capacity} spots
                </span>
                <div className="bg-muted h-2 w-48 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
                <span className="text-muted-foreground text-[11px]">
                  {event.capacity - event.registered} spots remaining
                </span>
              </div>
            )}
          </section>
        )}

        {/* Details Section */}
        <section className="flex flex-col">
          <SectionTitle icon={Calendar} title="Details" subtitle="Event information" />
          <div className="flex flex-col gap-3">
            <p className="text-foreground text-sm leading-relaxed">{event.description}</p>

            {event.address && (
              <div className="text-muted-foreground flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{event.address}</span>
              </div>
            )}

            {/* Contacts */}
            {event.contacts && event.contacts.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {event.contacts.map((contact) => (
                  <div key={contact.name} className="flex items-center gap-2 text-sm">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <span className="text-foreground font-medium">{contact.name}</span>
                    <span className="text-muted-foreground">· {contact.role}</span>
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-primary text-xs hover:underline"
                      >
                        {contact.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Schedule Section */}
        {event.schedule && event.schedule.length > 0 && (
          <section className="flex flex-col">
            <SectionTitle icon={Clock} title="Schedule" subtitle="What to expect" />
            <div className="flex flex-col gap-6">
              {event.schedule.map((day) => (
                <div key={day.day} className="flex flex-col gap-2">
                  <h4 className="text-foreground text-sm font-bold tracking-wide uppercase">
                    {day.day}
                  </h4>
                  <div className="border-border ml-2 flex flex-col gap-0 border-l-2 pl-4">
                    {day.items.map((item, i) => (
                      <div key={i} className="relative flex items-baseline gap-3 py-1.5">
                        {/* Timeline dot */}
                        <div className="bg-border absolute top-1/2 -left-[21px] h-2 w-2 -translate-y-1/2 rounded-full" />
                        <span className="text-muted-foreground w-20 flex-shrink-0 text-xs">
                          {item.time}
                        </span>
                        <span className="text-foreground text-sm">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Serve at this Event Section */}
        {event.servingOpportunities && event.servingOpportunities.length > 0 && (
          <section className="flex min-w-0 flex-col">
            <SectionTitle
              icon={Handshake}
              title="Serve at this Event"
              subtitle="Help make this event happen"
            />
            <HorizontalScroll>
              {event.servingOpportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  title={opp.title}
                  subtitle={opp.team}
                  detail={`${opp.spotsNeeded} spots needed`}
                  secondaryDetail={opp.description}
                  urgency={opp.spotsNeeded >= 4 ? 'high' : opp.spotsNeeded >= 2 ? 'medium' : 'low'}
                  onClick={() => router.push(buildUrl(`/serve/opportunities/${opp.id}`))}
                />
              ))}
            </HorizontalScroll>
          </section>
        )}
      </div>
    </div>
  );
}
