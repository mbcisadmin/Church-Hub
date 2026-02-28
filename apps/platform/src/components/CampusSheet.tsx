'use client';

import { MapPin, Check } from 'lucide-react';
import { ResponsiveSheet, SheetPage } from '@church/nextjs-ui/components/ResponsiveSheet';
import { useCampus, type Congregation } from '@/contexts/CampusContext';

interface CampusSheetProps {
  open: boolean;
  onClose: () => void;
}

function CampusHeader() {
  return (
    <div className="bg-primary relative overflow-hidden px-4 pt-4 pb-6 md:px-6 md:pt-6 md:pb-8">
      {/* Mobile drag handle */}
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>

      {/* MapPin watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <MapPin className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      {/* Title */}
      <div className="relative z-10">
        <h2 className="text-xl font-bold tracking-wide text-white md:text-2xl">Campus</h2>
        <p className="mt-1 text-sm text-white/70">Select your campus to filter across all apps</p>
      </div>
    </div>
  );
}

function CampusOption({
  congregation,
  isSelected,
  onSelect,
}: {
  congregation: Congregation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group relative flex w-full cursor-pointer flex-col items-center gap-2 border px-3 py-4 text-center shadow-sm transition-all duration-200 ${
        isSelected
          ? 'border-primary/30 bg-primary/5 shadow-primary/10 shadow-md'
          : 'border-border/60 hover:scale-105 hover:shadow-md active:scale-95'
      }`}
    >
      {isSelected && <Check className="text-primary absolute top-2 right-2 h-4 w-4" />}

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
          isSelected
            ? 'border-primary/30 bg-primary/20'
            : 'border-border bg-muted group-hover:border-primary/30 group-hover:bg-primary/10'
        }`}
      >
        <MapPin
          className={`h-6 w-6 transition-colors ${
            isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
          }`}
        />
      </div>

      <p
        className={`text-sm leading-tight font-medium ${
          isSelected ? 'text-primary' : 'text-foreground'
        }`}
      >
        {congregation.Congregation_Name}
      </p>
    </button>
  );
}

export default function CampusSheet({ open, onClose }: CampusSheetProps) {
  const { selectedCampus, setSelectedCampus, congregations } = useCampus();

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      panelClassName="bg-card overflow-hidden"
      maxWidth="max-w-4xl"
      noPanelPadding
      header={<CampusHeader />}
    >
      <SheetPage name="main">
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-2 gap-1 md:grid-cols-3 md:gap-2 lg:grid-cols-4">
            {congregations.map((congregation) => (
              <CampusOption
                key={congregation.Congregation_ID}
                congregation={congregation}
                isSelected={selectedCampus?.Congregation_ID === congregation.Congregation_ID}
                onSelect={() => {
                  setSelectedCampus(congregation);
                  onClose();
                }}
              />
            ))}
          </div>
        </div>
      </SheetPage>
    </ResponsiveSheet>
  );
}
