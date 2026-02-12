import { Suspense } from 'react';
import AppHeader from '@/components/AppHeader';
import NavigationRail from '@/components/NavigationRail';
import ChurchLogo from '@/components/ChurchLogo';
import Footer from '@church/nextjs-ui/components/Footer';
import { MainScrollContainer } from '@/components/MainScrollContainer';
import { TestingParamsProvider } from '@/components/TestingParamsProvider';
import { ContactActionProvider } from '@/components/ContactActionProvider';
import { PageActionsProvider, MobileActionBar } from '@church/nextjs-ui/page-actions';
import { churchConfig, footerLinks } from '@/config/church';

/**
 * Layout for authenticated app routes
 *
 * This layout wraps all routes in the (app) group.
 * Users must be authenticated to access these routes (enforced by middleware).
 */
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footer = (
    <Footer
      organizationName={churchConfig.name}
      tagline={churchConfig.tagline}
      logo={<ChurchLogo className="h-6 w-6 text-white/50" />}
      links={footerLinks()}
      builtBy={churchConfig.builtBy}
    />
  );

  return (
    <Suspense>
      <TestingParamsProvider>
        <ContactActionProvider>
          <PageActionsProvider>
            <div className="app-grid">
              {/* Header — spans full width via grid-template-areas */}
              <div className="z-50 [grid-area:header]">
                <AppHeader />
              </div>

              {/* Navigation rail — occupies 'nav' grid area on md+ */}
              <NavigationRail />

              {/* Main content — scrollable within its grid cell */}
              <div className="main-wrapper relative flex flex-col overflow-hidden [grid-area:main]">
                <MainScrollContainer footer={<div className="md:hidden">{footer}</div>}>
                  <main className="bg-background relative min-w-0 flex-1 px-4 py-12 md:px-6 md:py-16 lg:px-8">
                    {children}
                  </main>
                </MainScrollContainer>
              </div>

              {/* Footer — desktop only, own grid row */}
              <div className="hidden shrink-0 [grid-area:footer] md:block">{footer}</div>
            </div>

            {/* Mobile action bar — reads from PageActionsContext */}
            <MobileActionBar />
          </PageActionsProvider>
        </ContactActionProvider>
      </TestingParamsProvider>
    </Suspense>
  );
}
