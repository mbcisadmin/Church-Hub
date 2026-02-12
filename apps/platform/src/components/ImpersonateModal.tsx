'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, UserSearch, X } from 'lucide-react';
import { BottomSheet } from '@church/nextjs-ui/bottom-sheet';
import { churchConfig } from '@/config/church';

interface Contact {
  Contact_ID: number;
  Display_Name: string;
  Email_Address: string;
  dp_fileUniqueId?: string | null;
}

interface ImpersonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Header component for both modal and bottom sheet
function ModalHeader({
  onClose,
  showCloseButton = true,
}: {
  onClose: () => void;
  showCloseButton?: boolean;
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 px-4 pt-3 pb-4 md:px-6 md:pt-6 md:pb-6">
      {/* Drag handle for mobile */}
      {!showCloseButton && (
        <div className="mb-3 flex justify-center md:hidden">
          <div className="h-1.5 w-14 rounded-full bg-white/40" />
        </div>
      )}
      {showCloseButton && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15"
        >
          <X className="h-4 w-4 text-white/80" />
        </button>
      )}
      <div className="pointer-events-none absolute right-2 bottom-0 md:-right-4 md:bottom-2">
        <UserSearch className="h-24 w-24 text-white opacity-10 md:h-32 md:w-32" />
      </div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
          Impersonate User
        </h2>
        <p className="mt-1 text-sm text-white/80">
          Search for a user to see the app from their perspective
        </p>
      </div>
    </div>
  );
}

// Body content component
function ModalBody({
  searchQuery,
  setSearchQuery,
  results,
  loading,
  error,
  onSearch,
  onImpersonate,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  results: Contact[];
  loading: boolean;
  error: string | null;
  onSearch: () => void;
  onImpersonate: (contact: Contact) => void;
}) {
  const mpBaseUrl = churchConfig.mpBaseUrl;

  return (
    <div className="bg-card p-4 md:p-6">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search by name or email..."
            className="border-border focus:ring-primary h-11 w-full rounded-md border bg-transparent py-2 pr-4 pl-10 text-sm outline-none focus:ring-2"
          />
        </div>
        <button
          onClick={onSearch}
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-11 items-center gap-2 rounded-md px-4 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive mt-4 rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="border-border mt-4 max-h-[50vh] overflow-y-auto rounded-md border md:max-h-[400px]">
          {results.map((contact) => (
            <button
              key={contact.Contact_ID}
              onClick={() => onImpersonate(contact)}
              className="border-border hover:bg-primary/10 flex w-full items-center gap-3 border-b p-3 text-left transition-colors last:border-b-0"
            >
              {contact.dp_fileUniqueId ? (
                <img
                  src={`${mpBaseUrl}/files/${contact.dp_fileUniqueId}?$thumbnail=true`}
                  alt={contact.Display_Name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="bg-secondary flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="text-sm font-semibold">
                    {contact.Display_Name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-foreground font-medium">{contact.Display_Name}</p>
                <p className="text-muted-foreground truncate text-sm">{contact.Email_Address}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && results.length === 0 && searchQuery.length >= 2 && (
        <p className="text-muted-foreground py-8 text-center">
          No users found matching &quot;{searchQuery}&quot;
        </p>
      )}

      {/* Initial state */}
      {!loading && results.length === 0 && searchQuery.length < 2 && (
        <p className="text-muted-foreground py-8 text-center">
          Enter at least 2 characters to search
        </p>
      )}
    </div>
  );
}

export default function ImpersonateModal({ open, onOpenChange }: ImpersonateModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-search as user types (with debounce)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/admin/contacts/search?q=${encodeURIComponent(searchQuery)}`
        );
        if (!response.ok) {
          throw new Error('Failed to search contacts');
        }
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error('Error searching contacts:', err);
        setError('Failed to search contacts. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setResults([]);
      setError(null);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/contacts/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error('Failed to search contacts');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error searching contacts:', err);
      setError('Failed to search contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (contact: Contact) => {
    try {
      const response = await fetch('/api/admin/simulation/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contact.Contact_ID }),
      });

      if (!response.ok) {
        throw new Error('Failed to start impersonation');
      }

      window.location.reload();
    } catch (err) {
      console.error('Error starting impersonation:', err);
      setError('Failed to start impersonation. Please try again.');
    }
  };

  const onClose = () => onOpenChange(false);

  // Close on Escape (desktop only, BottomSheet handles its own)
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Prevent body scroll when open on desktop
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (open && isDesktop) {
      document.body.style.overflow = 'hidden';
    } else if (isDesktop) {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* Mobile: BottomSheet */}
      <div className="md:hidden">
        <BottomSheet
          open={open}
          onClose={onClose}
          className="bg-card overflow-hidden"
          hideHandle
          maxHeight="90vh"
          header={<ModalHeader onClose={onClose} showCloseButton={false} />}
        >
          <ModalBody
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            results={results}
            loading={loading}
            error={error}
            onSearch={handleSearch}
            onImpersonate={handleImpersonate}
          />
        </BottomSheet>
      </div>

      {/* Desktop: Traditional modal */}
      {open && (
        <div className="fixed inset-0 z-50 hidden items-center justify-center md:flex">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/80" onClick={onClose} />

          {/* Content */}
          <div className="bg-card relative z-10 mx-4 w-full max-w-xl overflow-hidden rounded-lg shadow-lg">
            <ModalHeader onClose={onClose} showCloseButton />
            <ModalBody
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              results={results}
              loading={loading}
              error={error}
              onSearch={handleSearch}
              onImpersonate={handleImpersonate}
            />
          </div>
        </div>
      )}
    </>
  );
}
