'use client';

import { ExternalLink, Mail, MapPin, Phone, X } from 'lucide-react';

export interface PersonDetail {
  id: string;
  name: string;
  title: string;
  department: string;
  phone: string;
  email: string;
  imageUrl: string | null;
  bio: string;
  location: string;
}

interface PersonDetailPanelProps {
  person: PersonDetail;
  onClose: () => void;
  /** Optional link to the person's full profile page */
  profileUrl?: string;
}

export function PersonDetailPanel({ person, onClose, profileUrl }: PersonDetailPanelProps) {
  return (
    <div className="bg-card flex min-h-full flex-col">
      {/* Header — avatar is absolutely positioned on the bottom edge */}
      <div className="from-primary to-primary/70 relative mb-14 bg-gradient-to-br px-6 pt-8 pb-6">
        <button
          onClick={onClose}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-colors hover:bg-black/20"
          aria-label="Close panel"
        >
          <X className="text-primary-foreground h-4 w-4" />
        </button>
        <img
          src={person.imageUrl || `https://i.pravatar.cc/200?u=${person.email}`}
          alt={person.name}
          className="border-card absolute top-full left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 object-cover shadow-md"
        />
      </div>

      {/* Name & title */}
      <div className="px-6 text-center">
        <h2 className="text-foreground text-lg font-semibold">{person.name}</h2>
        <p className="text-muted-foreground text-sm">{person.title}</p>
        <p className="text-muted-foreground text-xs">{person.department}</p>
      </div>

      {/* Divider */}
      <div className="mx-6 my-4 border-t" />

      {/* Info sections */}
      <div className="flex flex-col gap-3 px-6">
        <div className="flex items-center gap-3">
          <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
          <span className="text-foreground text-sm">{person.location}</span>
        </div>
        <a
          href={`mailto:${person.email}`}
          className="hover:text-primary flex items-center gap-3 transition-colors"
        >
          <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
          <span className="text-foreground text-sm">{person.email}</span>
        </a>
        <a
          href={`tel:${person.phone}`}
          className="hover:text-primary flex items-center gap-3 transition-colors"
        >
          <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
          <span className="text-foreground text-sm">{person.phone}</span>
        </a>
      </div>

      {/* Divider */}
      <div className="mx-6 my-4 border-t" />

      {/* Bio */}
      <div className="px-6 pb-6">
        <h3 className="text-foreground mb-2 text-sm font-medium">About</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{person.bio}</p>
      </div>

      {/* View Profile link */}
      {profileUrl && (
        <div className="mt-auto border-t px-6 py-4">
          <a
            href={profileUrl}
            className="text-primary flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          >
            View Profile
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
