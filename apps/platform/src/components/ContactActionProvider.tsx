'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  PhoneSheet,
  type PhoneSheetContact,
  type PhoneSheetProps,
} from '@church/nextjs-ui/components/PhoneSheet';
import {
  EmailSheet,
  type EmailSheetContact,
  type EmailSheetProps,
} from '@church/nextjs-ui/components/EmailSheet';

interface ContactActionContextValue {
  /** Open the phone sheet with contact data */
  openPhoneSheet: (contact: PhoneSheetContact) => void;
  /** Open the email sheet with contact data */
  openEmailSheet: (contact: EmailSheetContact) => void;
  /** Close all action sheets */
  closeAll: () => void;
}

const ContactActionContext = createContext<ContactActionContextValue | null>(null);

/**
 * Hook to access contact action functions from anywhere in the app.
 * Must be used within a ContactActionProvider.
 *
 * @example
 * const { openPhoneSheet, openEmailSheet } = useContactActions();
 *
 * // Open phone sheet with contact data
 * openPhoneSheet({
 *   name: "John Doe",
 *   phone: "555-1234"
 * });
 *
 * // Open email sheet with contact data
 * openEmailSheet({
 *   name: "John Doe",
 *   email: "john@example.com"
 * });
 */
export function useContactActions(): ContactActionContextValue {
  const context = useContext(ContactActionContext);
  if (!context) {
    throw new Error('useContactActions must be used within a ContactActionProvider');
  }
  return context;
}

interface ContactActionProviderProps {
  children: ReactNode;
  /** Custom gradient for sheet headers (optional) */
  headerGradient?: string;
}

/**
 * Provider that enables opening phone/email sheets from anywhere in the app.
 * Wrap your app layout with this provider to enable global contact actions.
 *
 * @example
 * // In your layout.tsx
 * <ContactActionProvider>
 *   {children}
 * </ContactActionProvider>
 */
export function ContactActionProvider({ children, headerGradient }: ContactActionProviderProps) {
  const [phoneContact, setPhoneContact] = useState<PhoneSheetContact | null>(null);
  const [emailContact, setEmailContact] = useState<EmailSheetContact | null>(null);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const openPhoneSheet = useCallback((contact: PhoneSheetContact) => {
    setPhoneContact(contact);
    setPhoneOpen(true);
  }, []);

  const openEmailSheet = useCallback((contact: EmailSheetContact) => {
    setEmailContact(contact);
    setEmailOpen(true);
  }, []);

  const closeAll = useCallback(() => {
    setPhoneOpen(false);
    setEmailOpen(false);
  }, []);

  const handleClosePhone = useCallback(() => {
    setPhoneOpen(false);
    // Clear contact data after animation completes
    setTimeout(() => setPhoneContact(null), 300);
  }, []);

  const handleCloseEmail = useCallback(() => {
    setEmailOpen(false);
    // Clear contact data after animation completes
    setTimeout(() => setEmailContact(null), 300);
  }, []);

  return (
    <ContactActionContext.Provider
      value={{
        openPhoneSheet,
        openEmailSheet,
        closeAll,
      }}
    >
      {children}

      {/* Phone Sheet */}
      <PhoneSheet
        open={phoneOpen}
        onClose={handleClosePhone}
        contact={phoneContact}
        headerGradient={headerGradient}
      />

      {/* Email Sheet */}
      <EmailSheet
        open={emailOpen}
        onClose={handleCloseEmail}
        contact={emailContact}
        headerGradient={headerGradient}
      />
    </ContactActionContext.Provider>
  );
}
