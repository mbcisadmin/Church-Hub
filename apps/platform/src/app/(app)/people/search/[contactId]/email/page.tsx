'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, Mail, Send, Copy, Check } from 'lucide-react';

type Contact = {
  Contact_ID: number;
  First_Name: string | null;
  Last_Name: string;
  Nickname: string | null;
  Display_Name: string;
  Email_Address: string | null;
  Mobile_Phone: string | null;
  __Age: number | null;
  Contact_Status_ID: number | null;
  Image_GUID?: string | null;
  Company?: boolean | null;
  Company_Name?: string | null;
};

const BRAND_GREEN_GRADIENT = 'var(--brand-gradient)';

export default function EmailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.contactId as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [formData, setFormData] = useState({
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });

  useEffect(() => {
    document.title = 'Email - The Hub';
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

  const handleCopy = async () => {
    if (!contact?.Email_Address) return;
    try {
      await navigator.clipboard.writeText(contact.Email_Address);
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

  const handleSend = () => {
    if (!contact?.Email_Address) return;

    const params = new URLSearchParams();
    if (formData.cc) params.set('cc', formData.cc);
    if (formData.bcc) params.set('bcc', formData.bcc);
    if (formData.subject) params.set('subject', formData.subject);
    if (formData.body) params.set('body', formData.body);

    const mailtoUrl = `mailto:${contact.Email_Address}${params.toString() ? '?' + params.toString() : ''}`;
    window.location.href = mailtoUrl;
  };

  const inputClass =
    'w-full bg-muted border-0 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none';

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contact || !contact.Email_Address) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No email address available</p>
        <button onClick={() => router.back()} className="text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header with email */}
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

        {/* Mail icon watermark */}
        <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
          <Mail className="h-32 w-32 text-white opacity-10 md:h-48 md:w-48" />
        </div>

        {/* Email info */}
        <div className="relative z-10">
          <p className="mb-1 text-sm text-white/70">{getDisplayName(contact)}</p>
          <p className="mb-2 text-xs font-bold tracking-wider text-white/70 uppercase">Email</p>
          <button onClick={handleCopy} className="group flex items-center gap-2 text-left">
            <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
              {copied ? 'Copied!' : contact.Email_Address}
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
      <div className="mx-auto max-w-lg space-y-4 p-6">
        {/* To field - read only */}
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
            To
          </label>
          <div className="bg-muted text-foreground flex items-center gap-2 px-4 py-3">
            <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{contact.Email_Address}</span>
          </div>
        </div>

        {/* CC/BCC toggle */}
        {!showCcBcc ? (
          <button
            onClick={() => setShowCcBcc(true)}
            className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
          >
            + Add CC/BCC
          </button>
        ) : (
          <div className="space-y-4">
            {/* CC field */}
            <div>
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
                CC
              </label>
              <input
                type="email"
                value={formData.cc}
                onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                placeholder="email@example.com"
                className={inputClass}
              />
            </div>

            {/* BCC field */}
            <div>
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
                BCC
              </label>
              <input
                type="email"
                value={formData.bcc}
                onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                placeholder="email@example.com"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Subject field */}
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
            Subject
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Enter subject..."
            className={inputClass}
          />
        </div>

        {/* Body field */}
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
            Message
          </label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Write your message..."
            rows={5}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition-colors"
          style={{ background: BRAND_GREEN_GRADIENT }}
        >
          <Send className="h-4 w-4" />
          Send Email
        </button>
      </div>
    </div>
  );
}
