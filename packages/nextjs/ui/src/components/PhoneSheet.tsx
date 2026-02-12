'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Copy, Check, ChevronLeft } from 'lucide-react';
import { BottomSheet } from '../bottom-sheet';

const BRAND_GREEN_GRADIENT = 'linear-gradient(135deg, #aad43c 0%, #8bc34a 100%)';

export interface PhoneSheetContact {
  name: string;
  phone: string;
}

export interface PhoneSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when the sheet should close */
  onClose: () => void;
  /** Contact data */
  contact: PhoneSheetContact | null;
  /** Custom gradient for header (optional, defaults to brand green) */
  headerGradient?: string;
}

/**
 * Reusable phone sheet component that can be opened from anywhere.
 * Shows phone number with copy, call, and text options.
 */
export function PhoneSheet({
  open,
  onClose,
  contact,
  headerGradient = BRAND_GREEN_GRADIENT,
}: PhoneSheetProps) {
  const [copied, setCopied] = useState(false);
  const [showTextForm, setShowTextForm] = useState(false);
  const [message, setMessage] = useState('');

  const formatPhone = (phone: string | null) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleCopy = async () => {
    if (!contact?.phone) return;
    try {
      await navigator.clipboard.writeText(contact.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getSmsUrl = () => {
    if (!contact?.phone) return '#';
    if (message) {
      return `sms:${contact.phone}&body=${encodeURIComponent(message)}`;
    }
    return `sms:${contact.phone}`;
  };

  const handleClose = () => {
    // Reset state on close
    setShowTextForm(false);
    setMessage('');
    setCopied(false);
    onClose();
  };

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
          {/* Phone icon watermark */}
          <div className="pointer-events-none absolute right-2 bottom-2">
            <Phone className="h-24 w-24 text-white opacity-10" />
          </div>

          {/* Phone info */}
          <div className="relative z-10">
            <p className="mb-1 text-sm text-white/70">{contact.name}</p>
            <p className="mb-2 text-xs font-bold tracking-wider text-white/70 uppercase">Phone</p>
            <button onClick={handleCopy} className="group flex items-center gap-2 text-left">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {copied ? 'Copied!' : formatPhone(contact.phone)}
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
      <div className="p-4">
        {!showTextForm ? (
          /* Call / Text options */
          <div className="flex gap-3">
            <a
              href={`tel:${contact.phone}`}
              className="bg-muted text-foreground hover:bg-muted/80 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>

            <button
              onClick={() => setShowTextForm(true)}
              className="bg-muted text-foreground hover:bg-muted/80 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
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
                className="bg-muted text-foreground placeholder:text-muted-foreground focus:ring-primary w-full resize-none rounded-lg border-0 px-4 py-3 focus:ring-2 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  console.log('In-app SMS via platform - to be implemented');
                  alert('In-app texting via church number coming soon!');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors"
                style={{ background: headerGradient }}
              >
                <MessageSquare className="h-4 w-4" />
                Text from Church Number
              </button>

              <a
                href={getSmsUrl()}
                className="border-border text-foreground hover:bg-muted flex w-full items-center justify-center gap-2 rounded-lg border bg-transparent px-4 py-3 text-sm font-medium transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Text from Personal Number
              </a>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
