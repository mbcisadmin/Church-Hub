'use client';

import type { ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';

interface ChartCardProps {
  children: ReactNode;
  title: string;
  onExpand: () => void;
}

export default function ChartCard({ children, title, onExpand }: ChartCardProps) {
  return (
    <div
      className="border-border bg-card relative cursor-pointer rounded-lg border p-3 transition-transform active:scale-[0.98]"
      onClick={onExpand}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {title}
        </span>
        <Maximize2 className="text-muted-foreground/50 h-4 w-4" />
      </div>
      <div className="pointer-events-none h-48">{children}</div>
    </div>
  );
}
