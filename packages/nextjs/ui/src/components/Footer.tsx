'use client';

import { ReactNode } from 'react';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterProps {
  /** Organization name for copyright */
  organizationName: string;
  /** Optional tagline/mission statement */
  tagline?: string;
  /** Links to display in footer */
  links?: FooterLink[];
  /** Optional custom logo component */
  logo?: ReactNode;
  /** Optional copyright year override (defaults to current year) */
  year?: number;
  /** Optional "Built by" credit name */
  builtBy?: string;
  /** Optional link for the "Built by" credit */
  builtByHref?: string;
  /** Optional z-index class override (default: z-10) */
  zIndex?: string;
}

/**
 * Reusable footer component for church/organization sites.
 * Matches the Header styling with dark mode support.
 */
export default function Footer({
  organizationName,
  tagline,
  links = [],
  logo,
  year,
  builtBy,
  builtByHref,
  zIndex = 'z-10',
}: FooterProps) {
  const currentYear = year ?? new Date().getFullYear();

  return (
    <footer className={`bg-secondary text-secondary-foreground relative ${zIndex}`}>
      {/* Responsive padding: shorter on laptop (md-xl), normal on large screens (2xl+) */}
      <div className="px-4 py-2 md:px-6 lg:px-8 2xl:py-3">
        {/* Mobile layout - content with watermark logo */}
        <div className="relative md:hidden">
          {/* Watermark logo - positioned bottom right */}
          {logo && (
            <div className="pointer-events-none absolute -right-2 -bottom-2 opacity-10 [&>*]:!h-14 [&>*]:!w-14 2xl:[&>*]:!h-16 2xl:[&>*]:!w-16">
              {logo}
            </div>
          )}

          {/* Content */}
          <div className="relative flex flex-col gap-2">
            {tagline && <p className="text-xs text-white/50 italic">{tagline}</p>}
            <span className="text-xs text-white/50">
              © {currentYear} {organizationName}
            </span>
            {links.length > 0 && (
              <div className="flex items-center gap-3 text-xs">
                {links.map((link, index) => (
                  <span key={link.href} className="flex items-center gap-3">
                    <a
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="hover:text-primary text-white/50 transition-colors"
                    >
                      {link.label}
                    </a>
                    {index < links.length - 1 && <span className="text-white/30">•</span>}
                  </span>
                ))}
              </div>
            )}
            {builtBy && (
              <span className="text-xs text-white/30">
                Built by{' '}
                {builtByHref ? (
                  <a
                    href={builtByHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-white/50"
                  >
                    {builtBy}
                  </a>
                ) : (
                  builtBy
                )}
              </span>
            )}
          </div>
        </div>

        {/* Desktop layout - all content right-aligned (logo hidden since header has it) */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-end md:gap-2 2xl:gap-4">
          {/* Tagline - hide on smaller laptops, show on xl+ */}
          {tagline && (
            <span className="hidden text-xs text-white/50 italic xl:inline">{tagline}</span>
          )}
          {tagline && <span className="hidden text-white/30 xl:inline">•</span>}
          <span className="text-[10px] text-white/50 2xl:text-xs">
            © {currentYear} {organizationName}
          </span>
          {links.length > 0 && <span className="text-white/30">•</span>}
          {links.map((link, index) => (
            <span
              key={link.href}
              className="flex items-center gap-2 text-[10px] 2xl:gap-4 2xl:text-xs"
            >
              <a
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="hover:text-primary text-white/50 transition-colors"
              >
                {link.label}
              </a>
              {(index < links.length - 1 || builtBy) && (
                <span className="hidden text-white/30 lg:inline">•</span>
              )}
            </span>
          ))}
          {/* Hide built by on smaller screens */}
          {builtBy && (
            <span className="hidden text-xs text-white/30 lg:inline">
              Built by{' '}
              {builtByHref ? (
                <a
                  href={builtByHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white/50"
                >
                  {builtBy}
                </a>
              ) : (
                builtBy
              )}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
