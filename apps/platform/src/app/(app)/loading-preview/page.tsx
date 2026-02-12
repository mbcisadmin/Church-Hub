'use client';

import { motion } from 'framer-motion';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import { TitleHighlight } from '@church/nextjs-ui/components/TitleHighlight';
import ChurchLogo from '@/components/ChurchLogo';

/**
 * Temporary page to preview the loading state design.
 * Navigate to /loading-preview to see it.
 * Delete this file when done.
 */
export default function LoadingPreviewPage() {
  return (
    <div className="-mx-4 -mt-12 md:-mx-6 md:-mt-16 lg:-mx-8">
      {/* Animated header - restore original positioning */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 pt-12 md:px-6 md:pt-16 lg:px-8"
      >
        <h1 className="text-foreground text-2xl font-bold tracking-tighter uppercase sm:text-3xl md:text-7xl lg:text-8xl">
          <TitleHighlight animation="ellipses" duration={0.8}>
            Loading
          </TitleHighlight>
        </h1>
        <p className="text-muted-foreground mt-1 pl-6 text-sm font-normal tracking-widest uppercase md:text-base">
          Getting things ready for you
        </p>
      </motion.header>

      {/* Logo spinner - centered in the main white area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <LogoSpinner logo={<ChurchLogo className="text-foreground" />} />
      </motion.div>
    </div>
  );
}
