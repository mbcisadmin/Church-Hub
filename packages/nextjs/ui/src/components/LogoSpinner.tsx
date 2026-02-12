'use client';

import { type ReactNode } from 'react';

export interface LogoSpinnerProps {
  /** The logo component to display in the center */
  logo: ReactNode;
  /** Size of the spinner ring (default: 128px / h-32 w-32) */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className for the container */
  className?: string;
}

const sizeClasses = {
  sm: { ring: 'h-20 w-20', logo: '[&>*]:h-10 [&>*]:w-10' },
  md: { ring: 'h-32 w-32', logo: '[&>*]:h-16 [&>*]:w-16' },
  lg: { ring: 'h-44 w-44', logo: '[&>*]:h-24 [&>*]:w-24' },
};

/**
 * A loading spinner that displays a logo in the center with a spinning ring around it.
 * Perfect for branded loading states on sign-in pages, dashboards, etc.
 */
export default function LogoSpinner({ logo, size = 'md', className = '' }: LogoSpinnerProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Spinning ring */}
      <div
        className={`absolute ${sizes.ring} border-t-primary animate-spin rounded-full border-4 border-transparent`}
      />
      {/* Logo */}
      <div className={sizes.logo}>{logo}</div>
    </div>
  );
}
