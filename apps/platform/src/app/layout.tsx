import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@church/nextjs-ui/components/ThemeProvider';
import { Toaster } from 'sonner';
import { PWAProvider } from '@/contexts/PWAContext';
import { churchConfig, pageTitle } from '@/config/church';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: pageTitle(),
  description: churchConfig.appDescription,
  icons: {
    icon: '/icon.svg',
    apple: '/assets/icons/apple-touch-icon.png',
    shortcut: '/assets/icons/favicon-196.png',
  },
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: churchConfig.appName,
  },
  manifest: '/api/manifest',
};

export const viewport: Viewport = {
  themeColor: '#252525',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-secondary antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <PWAProvider>
              {children}
              <Toaster position="bottom-right" />
            </PWAProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
