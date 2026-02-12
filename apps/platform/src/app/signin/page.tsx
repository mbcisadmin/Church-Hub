'use client';

import { useEffect, Suspense } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import ChurchLogo from '@/components/ChurchLogo';
import Footer from '@church/nextjs-ui/components/Footer';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import { SectionHeader } from '@/components/ui/section-header';
import { churchConfig, footerLinks } from '@/config/church';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  useEffect(() => {
    // If already signed in, redirect to callback URL
    // Otherwise, go straight to MinistryPlatform OAuth
    getSession().then((session) => {
      if (session?.firstName) {
        window.location.href = callbackUrl;
      } else {
        signIn('ministryplatform', { callbackUrl });
      }
    });
  }, [callbackUrl]);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="bg-background flex flex-1 flex-col items-center justify-center pb-12 md:pb-16">
        <div className="px-6 text-center">
          <section className="relative flex flex-col items-center">
            <SectionHeader
              title="Logging In"
              subtitle="Hang tight while we get you signed in"
              icon={LogIn}
              variant="watermark"
              as="h1"
              className="mb-8"
            />
            <LogoSpinner logo={<ChurchLogo className="text-foreground" />} />
            <p className="text-muted-foreground mt-8 text-sm">
              Redirecting to Ministry Platform...
            </p>
          </section>
        </div>
      </main>
      <Footer
        organizationName={churchConfig.name}
        tagline={churchConfig.tagline}
        logo={<ChurchLogo className="h-6 w-6 text-white/50" />}
        links={footerLinks()}
        builtBy={churchConfig.builtBy}
      />
    </div>
  );
}

function SignInFallback() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="bg-secondary h-16" /> {/* Header placeholder */}
      <main className="bg-background flex flex-1 flex-col items-center justify-center">
        <LogoSpinner logo={<ChurchLogo className="text-foreground" />} />
      </main>
      <div className="bg-secondary h-20" /> {/* Footer placeholder */}
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInContent />
    </Suspense>
  );
}
