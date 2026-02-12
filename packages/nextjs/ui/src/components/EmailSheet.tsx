'use client';

import { useState } from 'react';
import { Mail, Send, Copy, Check } from 'lucide-react';
import { BottomSheet } from '../bottom-sheet';

const BRAND_GREEN_GRADIENT = 'linear-gradient(135deg, #aad43c 0%, #8bc34a 100%)';

export interface EmailSheetContact {
  name: string;
  email: string;
}

export interface EmailSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when the sheet should close */
  onClose: () => void;
  /** Contact data */
  contact: EmailSheetContact | null;
  /** Custom gradient for header (optional, defaults to brand green) */
  headerGradient?: string;
}

/**
 * Reusable email sheet component that can be opened from anywhere.
 * Shows email with copy and compose options.
 */
export function EmailSheet({
  open,
  onClose,
  contact,
  headerGradient = BRAND_GREEN_GRADIENT,
}: EmailSheetProps) {
  const [copied, setCopied] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [formData, setFormData] = useState({
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });

  const handleCopy = async () => {
    if (!contact?.email) return;
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSend = () => {
    if (!contact?.email) return;

    const params = new URLSearchParams();
    if (formData.cc) params.set('cc', formData.cc);
    if (formData.bcc) params.set('bcc', formData.bcc);
    if (formData.subject) params.set('subject', formData.subject);
    if (formData.body) params.set('body', formData.body);

    const mailtoUrl = `mailto:${contact.email}${params.toString() ? '?' + params.toString() : ''}`;
    window.location.href = mailtoUrl;
  };

  const handleClose = () => {
    // Reset state on close
    setCopied(false);
    setShowCcBcc(false);
    setFormData({ cc: '', bcc: '', subject: '', body: '' });
    onClose();
  };

  const inputClass =
    'w-full bg-muted border-0 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none rounded-lg';

  if (!contact) return null;

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      className="bg-background"
      header={
        <div
          className="relative overflow-hidden px-4 pt-2 pb-6"
          style={{ background: headerGradient }}
        >
          {/* Mail icon watermark */}
          <div className="pointer-events-none absolute right-2 bottom-2">
            <Mail className="h-24 w-24 text-white opacity-10" />
          </div>

          {/* Email info */}
          <div className="relative z-10">
            <p className="mb-1 text-sm text-white/70">{contact.name}</p>
            <p className="mb-2 text-xs font-bold tracking-wider text-white/70 uppercase">Email</p>
            <button onClick={handleCopy} className="group flex items-center gap-2 text-left">
              <h1 className="text-xl font-bold tracking-tight text-white">
                {copied ? 'Copied!' : contact.email}
              </h1>
              {copied ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <Copy className="h-5 w-5 text-white/50 transition-colors group-hover:text-white/80" />
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 p-4">
        {/* To field - read only */}
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
            To
          </label>
          <div className="bg-muted text-foreground flex items-center gap-2 rounded-lg px-4 py-3">
            <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{contact.email}</span>
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
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors"
          style={{ background: headerGradient }}
        >
          <Send className="h-4 w-4" />
          Send Email
        </button>
      </div>
    </BottomSheet>
  );
}
