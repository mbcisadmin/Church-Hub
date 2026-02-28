'use client';

import { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Activity,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  Clock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { ActionCard } from '@church/nextjs-ui/components/ActionCard';
import { DateSwiper } from '@church/nextjs-ui/date-swiper';
import { SwipeableCounter } from '@church/nextjs-ui/swipeable-counter';
import {
  ResponsiveSheet,
  SheetPage,
  useResponsiveSheet,
} from '@church/nextjs-ui/components/ResponsiveSheet';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type Event = {
  Event_ID: number;
  Event_Title: string;
  Event_Start_Date: string;
  Event_End_Date: string;
};

type Metric = {
  Metric_ID: number;
  Metric_Title: string;
};

type EventMetric = {
  Event_Metric_ID: number;
  Event_ID: number;
  Metric_ID: number;
  Numerical_Value: number;
  Group_ID?: number | null;
  _loading?: boolean;
  _confirmed?: boolean;
  _deleting?: boolean;
};

const METRIC_HEADER_GRADIENT = 'var(--brand-gradient)';

// Clean up event title
function formatEventTitle(title: string): string {
  return title
    .split(' ')
    .map((word) => {
      if (
        ['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', '-'].includes(
          word.toLowerCase()
        )
      ) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/^./, (c) => c.toUpperCase());
}

// Sheet header component
function MetricSheetHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      className="relative overflow-hidden px-4 pt-3 pb-6 md:px-8 md:pt-6 md:pb-8"
      style={{ background: METRIC_HEADER_GRADIENT }}
    >
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <CalendarDays className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>
      <div className="relative z-10">
        <p className="mb-2 text-xs font-bold tracking-wider text-white/70 uppercase">
          Event Metrics
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-white uppercase md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-white/70 md:text-base">{subtitle}</p>
      </div>
    </div>
  );
}

// Add metric form component (used inside the sheet)
function AddMetricForm({
  metrics,
  selectedMetric,
  setSelectedMetric,
  count,
  setCount,
  onSubmit,
  isSubmitting,
  isEditing,
  noExistingMetrics,
}: {
  metrics: Metric[];
  selectedMetric: Metric | null;
  setSelectedMetric: (m: Metric | null) => void;
  count: number;
  setCount: (n: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
  noExistingMetrics: boolean;
}) {
  const canSubmit = selectedMetric && count > 0 && !isSubmitting;

  return (
    <div className="bg-card p-6">
      {noExistingMetrics && (
        <div className="border-border mb-6 flex items-start gap-3 border-b pb-6">
          <AlertCircle className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-foreground text-sm font-medium">No metrics recorded yet</p>
            <p className="text-muted-foreground text-sm">
              Add your first metric for this event below.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="text-muted-foreground mb-2 block text-sm">What are you counting?</label>
          <select
            value={selectedMetric?.Metric_ID.toString() || ''}
            onChange={(e) => {
              const metric = metrics.find((m) => m.Metric_ID.toString() === e.target.value);
              if (metric) {
                setSelectedMetric(metric);
                if (!isEditing) setCount(0);
              }
            }}
            className="border-input bg-background text-foreground focus:ring-primary h-12 w-full border px-3 text-sm focus:ring-2 focus:outline-none"
          >
            <option value="">Select a metric</option>
            {metrics.map((metric) => (
              <option key={metric.Metric_ID} value={metric.Metric_ID.toString()}>
                {metric.Metric_Title}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center">
          <h4 className="text-foreground mb-2 text-xl font-semibold">HOW MANY?</h4>
          <p className="text-muted-foreground mb-6 text-sm">
            {selectedMetric
              ? `Enter the count for ${selectedMetric.Metric_Title}`
              : 'Select a metric above'}
          </p>
          <div className="mb-6">
            <SwipeableCounter
              value={count}
              onChange={setCount}
              min={0}
              max={9999}
              step={1}
              onEnter={onSubmit}
              showArch
              archGradientColor="#e5e7eb"
              showChevrons={false}
            />
          </div>

          <motion.div whileTap={{ scale: 0.98 }} className="w-full">
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="bg-primary relative flex h-14 w-full items-center justify-center gap-2 text-lg font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isEditing ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  {isEditing ? 'Update' : 'Submit'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Metrics list component (main page of sheet)
function MetricsList({
  existingMetrics,
  getMetricName,
  onEdit,
  onDelete,
  onAdd,
}: {
  existingMetrics: EventMetric[];
  getMetricName: (id: number) => string;
  onEdit: (em: EventMetric) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}) {
  const { navigate } = useResponsiveSheet();

  return (
    <div className="bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-medium">
          {existingMetrics.length} metric(s) recorded
        </p>
        <Button
          onClick={() => {
            onAdd();
            navigate('add');
          }}
          size="sm"
          className="gap-2 rounded-none"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {existingMetrics.map((em) => (
          <div
            key={em.Event_Metric_ID}
            className={`flex items-center justify-between border p-3 ${
              em._confirmed
                ? 'border-primary'
                : em._deleting
                  ? 'border-destructive/50 opacity-50'
                  : 'border-border'
            }`}
          >
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">{getMetricName(em.Metric_ID)}</p>
              <div className="flex items-center gap-2">
                <p className="text-primary text-xl font-bold">{em.Numerical_Value}</p>
                {em._loading && <Loader2 className="text-primary h-4 w-4 animate-spin" />}
                {em._confirmed && <CheckCircle2 className="text-primary h-4 w-4" />}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  onEdit(em);
                  navigate('add');
                }}
                className="hover:text-primary h-8 w-8 rounded-none"
                disabled={em._loading || em._deleting}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(em.Event_Metric_ID)}
                className="hover:text-destructive h-8 w-8 rounded-none"
                disabled={em._loading || em._deleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CounterPage() {
  useEffect(() => {
    document.title = 'Counter | The Hub';
  }, []);

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [count, setCount] = useState(0);

  const [events, setEvents] = useState<Event[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [existingMetrics, setExistingMetrics] = useState<EventMetric[]>([]);

  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingExistingMetrics, setIsLoadingExistingMetrics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingMetricId, setEditingMetricId] = useState<number | null>(null);
  const [sheetDefaultPage, setSheetDefaultPage] = useState<'main' | 'add'>('main');

  const previousMetricsRef = useRef<string>('');
  const eventListRef = useRef<HTMLDivElement>(null);

  // Poll for updates every 5 seconds when viewing metrics
  useEffect(() => {
    if (!selectedEvent) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/counter/event-metrics/${selectedEvent.Event_ID}`);
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();

        const dataString = JSON.stringify(data);
        if (dataString !== previousMetricsRef.current) {
          previousMetricsRef.current = dataString;
          setExistingMetrics(data);
        }
      } catch (error) {
        console.error('Error polling metrics:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedEvent]);

  // Load metrics on mount
  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await fetch('/api/counter/metrics');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    }
    loadMetrics();
  }, []);

  // Load events when date changes
  useEffect(() => {
    if (!selectedDate) {
      setEvents([]);
      setSelectedEvent(null);
      return;
    }

    async function loadEvents() {
      setIsLoadingEvents(true);
      try {
        const response = await fetch(`/api/counter/events?date=${selectedDate}`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    }

    loadEvents();
  }, [selectedDate]);

  // Handle event click - fetch metrics and open sheet
  const handleEventClick = async (event: Event) => {
    // Don't allow clicking if metrics aren't loaded yet
    if (isLoadingMetrics || metrics.length === 0) return;

    // Don't allow clicking if already loading another event
    if (isLoadingExistingMetrics) return;

    setSelectedEvent(event);
    setIsLoadingExistingMetrics(true);

    try {
      const response = await fetch(`/api/counter/event-metrics/${event.Event_ID}`);
      if (!response.ok) throw new Error('Failed to fetch existing metrics');
      const data = await response.json();
      setExistingMetrics(data);
      previousMetricsRef.current = JSON.stringify(data);

      // Determine which page to show and open sheet
      if (data.length === 0) {
        // No existing metrics - go directly to add form
        setSheetDefaultPage('add');
        setEditingMetricId(null);
        const defaultMetric =
          metrics.find((m) => m.Metric_Title.toLowerCase().includes('headcount')) || metrics[0];
        setSelectedMetric(defaultMetric || null);
        setCount(0);
      } else {
        // Has existing metrics - show the list
        setSheetDefaultPage('main');
      }

      // Open sheet after we know which page to show
      setIsSheetOpen(true);
    } catch (error) {
      console.error('Error loading existing metrics:', error);
      setExistingMetrics([]);
      previousMetricsRef.current = '[]';
      setSheetDefaultPage('add');
      setIsSheetOpen(true);
    } finally {
      setIsLoadingExistingMetrics(false);
    }
  };

  const openAddForm = () => {
    setEditingMetricId(null);
    const defaultMetric =
      metrics.find((m) => m.Metric_Title.toLowerCase().includes('headcount')) || metrics[0];
    setSelectedMetric(defaultMetric || null);
    setCount(0);
  };

  const openEditForm = (em: EventMetric) => {
    setEditingMetricId(em.Event_Metric_ID);
    const metric = metrics.find((m) => m.Metric_ID === em.Metric_ID);
    setSelectedMetric(metric || null);
    setCount(em.Numerical_Value);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedEvent(null);
    setEditingMetricId(null);
    setSelectedMetric(null);
    setCount(0);
  };

  const handleSubmit = async () => {
    if (!selectedEvent || !selectedMetric || count === 0) return;

    const previousMetrics = [...existingMetrics];
    const metricName = selectedMetric.Metric_Title;

    setIsSubmitting(true);

    if (editingMetricId) {
      setExistingMetrics((prev) =>
        prev.map((m) =>
          m.Event_Metric_ID === editingMetricId
            ? { ...m, Numerical_Value: count, Metric_ID: selectedMetric.Metric_ID, _loading: true }
            : m
        )
      );

      try {
        const response = await fetch(`/api/counter/event-metrics/${selectedEvent.Event_ID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventMetricId: editingMetricId,
            data: { Metric_ID: selectedMetric.Metric_ID, Numerical_Value: count },
          }),
        });

        if (!response.ok) {
          setExistingMetrics(previousMetrics);
          throw new Error('Failed to update metric');
        }

        setExistingMetrics((prev) =>
          prev.map((m) =>
            m.Event_Metric_ID === editingMetricId ? { ...m, _loading: false, _confirmed: true } : m
          )
        );

        toast.success(`${metricName} updated!`);

        setTimeout(() => {
          setExistingMetrics((prev) =>
            prev.map((m) =>
              m.Event_Metric_ID === editingMetricId ? { ...m, _confirmed: false } : m
            )
          );
        }, 2000);

        // Reset form
        setEditingMetricId(null);
        setSelectedMetric(null);
        setCount(0);
      } catch (error) {
        console.error('Error updating metric:', error);
        setExistingMetrics(previousMetrics);
        toast.error('Failed to update metric');
      }
    } else {
      const tempId = Date.now();
      const newMetric: EventMetric = {
        Event_Metric_ID: tempId,
        Event_ID: selectedEvent.Event_ID,
        Metric_ID: selectedMetric.Metric_ID,
        Numerical_Value: count,
        _loading: true,
      };

      setExistingMetrics((prev) => [...prev, newMetric]);

      try {
        const response = await fetch('/api/counter/event-metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Event_ID: selectedEvent.Event_ID,
            Metric_ID: selectedMetric.Metric_ID,
            Numerical_Value: count,
          }),
        });

        if (!response.ok) {
          setExistingMetrics(previousMetrics);
          throw new Error('Failed to submit metric');
        }

        const createdMetric = await response.json();

        setExistingMetrics((prev) =>
          prev.map((m) =>
            m.Event_Metric_ID === tempId
              ? { ...createdMetric, _loading: false, _confirmed: true }
              : m
          )
        );

        toast.success(`${metricName} added!`);

        setTimeout(() => {
          setExistingMetrics((prev) =>
            prev.map((m) =>
              m.Event_Metric_ID === createdMetric.Event_Metric_ID ? { ...m, _confirmed: false } : m
            )
          );
        }, 2000);

        // Reset form
        setSelectedMetric(null);
        setCount(0);
      } catch (error) {
        console.error('Error submitting metric:', error);
        setExistingMetrics(previousMetrics);
        toast.error('Failed to add metric');
      }
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (eventMetricId: number) => {
    if (!confirm('Delete this metric?')) return;
    if (!selectedEvent) return;

    const previousMetrics = [...existingMetrics];

    try {
      setExistingMetrics((prev) =>
        prev.map((m) => (m.Event_Metric_ID === eventMetricId ? { ...m, _deleting: true } : m))
      );

      await new Promise((resolve) => setTimeout(resolve, 150));

      setExistingMetrics((prev) => prev.filter((m) => m.Event_Metric_ID !== eventMetricId));

      const response = await fetch(`/api/counter/event-metrics/${selectedEvent.Event_ID}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventMetricId }),
      });

      if (!response.ok) {
        setExistingMetrics(previousMetrics);
        throw new Error('Failed to delete metric');
      }

      toast.success('Metric deleted');
    } catch (error) {
      console.error('Error deleting metric:', error);
      setExistingMetrics(previousMetrics);
      toast.error('Failed to delete metric');
    }
  };

  const getMetricName = (metricId: number) => {
    return metrics.find((m) => m.Metric_ID === metricId)?.Metric_Title || 'Unknown';
  };

  return (
    <div>
      <div className="mx-auto max-w-[1600px]">
        <SectionHeader
          title="Counter"
          subtitle="Track event metrics in real-time"
          icon={Activity}
          variant="watermark"
          as="h1"
        />

        <div className="mx-auto max-w-4xl">
          <div className="space-y-10">
            {/* Date Selection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-muted-foreground mb-4 text-xs font-semibold tracking-wide uppercase">
                Date
              </h3>
              <DateSwiper
                value={selectedDate}
                onChange={(newDate) => {
                  setSelectedDate(newDate);
                  setSelectedEvent(null);
                  setIsSheetOpen(false);
                }}
                showArch
                archGradientColor="#e5e7eb"
                contentRef={eventListRef}
              />
            </motion.div>

            {/* Event Selection */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-muted-foreground mb-4 text-xs font-semibold tracking-wide uppercase">
                  Event
                </h3>
                {isLoadingEvents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="text-primary h-6 w-6 animate-spin" />
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    No events found for this date
                  </div>
                ) : (
                  <div ref={eventListRef} className="flex flex-col gap-2">
                    {events.map((event) => {
                      const isSelected = selectedEvent?.Event_ID === event.Event_ID;
                      const isLoading = isSelected && isLoadingExistingMetrics;
                      return (
                        <ActionCard
                          key={event.Event_ID}
                          onClick={() => handleEventClick(event)}
                          className={
                            isLoadingMetrics
                              ? 'cursor-not-allowed opacity-50'
                              : isSelected
                                ? 'border-primary'
                                : ''
                          }
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm ${isSelected ? 'text-primary font-medium' : 'text-foreground/80'}`}
                            >
                              {formatEventTitle(event.Event_Title)}
                            </p>
                            <div
                              className={`mt-1 inline-flex items-center gap-1 text-xs ${
                                isSelected ? 'text-primary/70' : 'text-muted-foreground'
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              {format(parseISO(event.Event_Start_Date), 'h:mm a')}
                              {isLoading && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
                            </div>
                          </div>
                          <ChevronRight
                            className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${
                              isSelected
                                ? 'text-primary'
                                : 'text-muted-foreground group-hover:text-foreground'
                            }`}
                          />
                        </ActionCard>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Metric Entry Sheet */}
      <ResponsiveSheet
        open={isSheetOpen}
        onClose={closeSheet}
        panelClassName="bg-card overflow-hidden"
        maxWidth="max-w-4xl"
        noPanelPadding
        defaultPage={sheetDefaultPage}
        header={
          <MetricSheetHeader
            title={
              selectedEvent?.Event_Title ? formatEventTitle(selectedEvent.Event_Title) : 'Metrics'
            }
            subtitle={
              selectedEvent
                ? format(parseISO(selectedEvent.Event_Start_Date), 'EEEE, MMMM d • h:mm a')
                : ''
            }
          />
        }
      >
        <SheetPage name="main" title="Metrics">
          {isLoadingExistingMetrics ? (
            <div className="bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="bg-muted h-4 w-32 animate-pulse" />
                <div className="bg-muted h-8 w-20 animate-pulse" />
              </div>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="border-border flex items-center justify-between border p-3"
                  >
                    <div className="flex-1">
                      <div className="bg-muted mb-2 h-4 w-24 animate-pulse" />
                      <div className="bg-muted h-6 w-12 animate-pulse" />
                    </div>
                    <div className="flex gap-1">
                      <div className="bg-muted h-8 w-8 animate-pulse" />
                      <div className="bg-muted h-8 w-8 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <MetricsList
              existingMetrics={existingMetrics}
              getMetricName={getMetricName}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onAdd={openAddForm}
            />
          )}
        </SheetPage>

        <SheetPage name="add" title={editingMetricId ? 'Edit Metric' : 'Add Metric'}>
          <AddMetricForm
            metrics={metrics}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            count={count}
            setCount={setCount}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEditing={!!editingMetricId}
            noExistingMetrics={existingMetrics.length === 0 && !editingMetricId}
          />
        </SheetPage>
      </ResponsiveSheet>
    </div>
  );
}
