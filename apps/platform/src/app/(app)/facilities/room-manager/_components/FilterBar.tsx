'use client';

import { useState } from 'react';
import { Building2, Users, User } from 'lucide-react';
import type { EventGroup, EventParticipant } from '@/types/roomManager';

export type FilterMode = 'room' | 'group' | 'people';

interface FilterBarProps {
  mode: FilterMode;
  onModeChange: (mode: FilterMode) => void;
  groups: EventGroup[];
  participants: EventParticipant[];
  selectedGroupId: number | null;
  onGroupSelect: (groupId: number | null) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
}

export default function FilterBar({
  mode,
  onModeChange,
  groups,
  selectedGroupId,
  onGroupSelect,
  searchText,
  onSearchChange,
}: FilterBarProps) {
  const modes: { key: FilterMode; label: string; icon: typeof Building2 }[] = [
    { key: 'room', label: 'Rooms', icon: Building2 },
    { key: 'group', label: 'Groups', icon: Users },
    { key: 'people', label: 'People', icon: User },
  ];

  return (
    <div className="space-y-3">
      {/* Segmented Control */}
      <div className="bg-muted flex rounded-lg p-1">
        {modes.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Group filter dropdown */}
      {mode === 'group' && (
        <select
          value={selectedGroupId ?? ''}
          onChange={(e) => onGroupSelect(e.target.value ? parseInt(e.target.value) : null)}
          className="border-input bg-background text-foreground h-9 w-full border px-3 text-sm focus:ring-2 focus:outline-none"
        >
          <option value="">All groups</option>
          {groups.map((g) => (
            <option key={g.Group_ID} value={g.Group_ID}>
              {g.Group_Name}
            </option>
          ))}
        </select>
      )}

      {/* People search */}
      {mode === 'people' && (
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search people..."
          className="border-input bg-background text-foreground placeholder:text-muted-foreground h-9 w-full border px-3 text-sm focus:ring-2 focus:outline-none"
        />
      )}
    </div>
  );
}
