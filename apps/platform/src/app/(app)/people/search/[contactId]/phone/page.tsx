'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, Phone, MessageSquare, Copy, Check } from 'lucide-react';

type Contact = {
  Contact_ID: number;
  First_Name: string | null;
  Last_Name: string;
  Nickname: string | null;
  Display_Name: string;
  Email_Address: string | null;
  Mobile_Phone: string | null;
  Company_Phone: string | null;
  __Age: number | null;
  Contact_Status_ID: number | null;
  Image_GUID?: string | null;
  Company?: boolean | null;
  Company_Name?: string | null;
};

const BRAND_GREEN_GRADIENT = 'var(--brand-gradient)';

export default function PhonePage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.contactId as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTextForm, setShowTextForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = 'Phone - The Hub';
  }, []);

  useEffect(() => {
    const loadContact = async () => {
      try {
        const response = await fetch(`/api/people-search/${contactId}`);
        if (!response.ok) throw new Error('Failed to load contact');
        const data = await response.json();
        setContact(data);
      } catch (error) {
        console.error('Error loading contact:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContact();
  }, [contactId]);

  const formatPhone = (phone: string | null) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleCopy = async () => {
    if (!contact?.Mobile_Phone) return;
    try {
      await navigator.clipboard.writeText(contact.Mobile_Phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getDisplayName = (contact: Contact) => {
    if (contact.Company && contact.Company_Name) {
      return contact.Company_Name;
    }
    const firstName = contact.Nickname || contact.First_Name || '';
    return `${firstName} ${contact.Last_Name}`.trim();
  };

  const getSmsUrl = () => {
    if (!contact?.Mobile_Phone) return '#';
    if (message) {
      return `sms:${contact.Mobile_Phone}&body=${encodeURIComponent(message)}`;
    }
    return `sms:${contact.Mobile_Phone}`;
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contact || !contact.Mobile_Phone) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No phone number available</p>
        <button onClick={() => router.back()} className="text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header with phone number */}
      <div
        className="relative overflow-hidden px-4 pt-4 pb-8 md:px-8 md:pt-6 md:pb-10"
        style={{ background: BRAND_GREEN_GRADIENT }}
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="group mb-6 flex items-center gap-2 text-white/70 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Phone icon watermark */}
        <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
          <Phone className="h-32 w-32 text-white opacity-10 md:h-48 md:w-48" />
        </div>

        {/* Phone info */}
        <div className="relative z-10">
          <p className="mb-1 text-sm text-white/70">{getDisplayName(contact)}</p>
          <p className="mb-2 text-xs font-bold tracking-wider text-white/70 uppercase">Phone</p>
          <button onClick={handleCopy} className="group flex items-center gap-2 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {copied ? 'Copied!' : formatPhone(contact.Mobile_Phone)}
            </h1>
            {copied ? (
              <Check className="h-5 w-5 text-white" />
            ) : (
              <Copy className="h-5 w-5 text-white/50 transition-colors group-hover:text-white/80" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-lg p-6">
        {!showTextForm ? (
          /* Call / Text options */
          <div className="flex gap-3">
            <a
              href={`tel:${contact.Mobile_Phone}`}
              className="bg-muted text-foreground hover:bg-muted/80 flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>

            <button
              onClick={() => setShowTextForm(true)}
              className="bg-muted text-foreground hover:bg-muted/80 flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Text
            </button>
          </div>
        ) : (
          /* Text form */
          <div className="space-y-4">
            <button
              onClick={() => setShowTextForm(false)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to options
            </button>

            <div>
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={4}
                className="bg-muted text-foreground placeholder:text-muted-foreground focus:ring-primary w-full resize-none border-0 px-4 py-3 focus:ring-2 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  console.log('In-app SMS via platform - to be implemented');
                  alert('In-app texting via church number coming soon!');
                }}
                className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition-colors"
                style={{ background: BRAND_GREEN_GRADIENT }}
              >
                <MessageSquare className="h-4 w-4" />
                Text from Church Number
              </button>

              <a
                href={getSmsUrl()}
                className="border-border text-foreground hover:bg-muted flex w-full items-center justify-center gap-2 border bg-transparent px-4 py-3 text-sm font-medium transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Text from Personal Number
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
