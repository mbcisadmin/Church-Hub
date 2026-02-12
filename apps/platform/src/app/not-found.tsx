'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Frown, ArrowLeft } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import AppHeader from '@/components/AppHeader';
import NavigationRail from '@/components/NavigationRail';
import ChurchLogo from '@/components/ChurchLogo';
import Footer from '@church/nextjs-ui/components/Footer';
import { churchConfig, footerLinks } from '@/config/church';

export default function NotFound() {
  const footer = (
    <Footer
      organizationName={churchConfig.name}
      tagline={churchConfig.tagline}
      logo={<ChurchLogo className="h-6 w-6 text-white/50" />}
      links={footerLinks()}
    />
  );

  return (
    <Suspense>
      <div className="app-grid">
        {/* Header — spans full width via grid-template-areas */}
        <div className="sticky top-0 z-50 [grid-area:header]">
          <AppHeader />
        </div>

        {/* Navigation rail — occupies 'nav' grid area on md+ */}
        <NavigationRail />

        {/* Main content — scrollable within its grid cell */}
        <div className="relative flex flex-col overflow-hidden [grid-area:main]">
          <div className="flex-1 overflow-y-auto">
            <main className="bg-background flex min-h-full flex-col items-center justify-center pb-12 md:px-6 md:pb-16 lg:px-8">
              <div className="px-6 text-center">
                <section className="relative flex flex-col items-center">
                  <SectionHeader
                    title="Oops"
                    subtitle="Looks like you've wandered off the path"
                    icon={Frown}
                    variant="watermark"
                    as="h1"
                    className="mb-4"
                  />
                  <p className="text-muted-foreground max-w-md text-sm tracking-wide md:text-base">
                    The page you're looking for doesn't exist, may have been moved, or is
                    temporarily unavailable.
                  </p>

                  <Link
                    href="/"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Link>
                </section>
              </div>
            </main>
            <div className="md:hidden">{footer}</div>
          </div>
        </div>

        {/* Footer — desktop only, own grid row */}
        <div className="hidden shrink-0 [grid-area:footer] md:block">{footer}</div>
      </div>
    </Suspense>
  );
}
