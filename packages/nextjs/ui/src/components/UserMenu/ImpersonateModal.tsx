'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

interface Contact {
  Contact_ID: number;
  Display_Name: string;
  Email_Address: string;
  Image_GUID?: string | null;
}

interface ImpersonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

      // Reload the page to apply the impersonation
      window.location.reload();
    } catch (err) {
      console.error('Error starting impersonation:', err);
      setError('Failed to start impersonation. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Impersonate User</DialogTitle>
          <DialogDescription>
            Search for a user to see the app from their perspective
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name or email..."
                className="border-border focus:ring-primary w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="border-border max-h-[400px] overflow-y-auto rounded-md border">
              {results.map((contact) => (
                <button
                  key={contact.Contact_ID}
                  onClick={() => handleImpersonate(contact)}
                  className="hover:bg-primary/10 border-border flex w-full items-center gap-3 border-b p-3 text-left transition-colors last:border-b-0"
                >
                  {contact.Image_GUID ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL}/${contact.Image_GUID}?$thumbnail=true`}
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
                    <p className="text-muted-foreground truncate text-sm">
                      {contact.Email_Address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && results.length === 0 && searchQuery && (
            <p className="text-muted-foreground py-8 text-center">
              No users found matching "{searchQuery}"
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
