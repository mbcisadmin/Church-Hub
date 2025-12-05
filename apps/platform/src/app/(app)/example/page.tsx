"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * Example micro-app demonstrating Gospel Kit patterns
 *
 * This shows:
 * - Client component with "use client"
 * - Session access with useSession
 * - Basic state management
 * - TypeScript types
 */
export default function ExamplePage() {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = "Example App - Ministry Apps";
  }, []);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Example App
          </h1>
          <p className="text-muted-foreground">
            A simple example showing Gospel Kit patterns
          </p>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
          {/* User Info */}
          <div>
            <h2 className="text-xl font-semibold mb-2">User Information</h2>
            <div className="text-muted-foreground space-y-1">
              <p><strong>Name:</strong> {session?.firstName} {session?.lastName}</p>
              <p><strong>Email:</strong> {session?.email}</p>
              <p><strong>Contact ID:</strong> {session?.contactId}</p>
            </div>
          </div>

          {/* Counter Example */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Counter Example</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCount(count - 1)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
              >
                -
              </button>
              <span className="text-2xl font-bold">{count}</span>
              <button
                onClick={() => setCount(count + 1)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
              >
                +
              </button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border-t border-border pt-6">
            <h2 className="text-xl font-semibold mb-2">Next Steps</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Add API routes in <code>src/app/api/</code></li>
              <li>Create service layers in <code>src/services/</code></li>
              <li>Add Zod schemas in <code>@church/database</code></li>
              <li>Use Claude skills for scaffolding: <code>/new-api-route</code>, <code>/new-entity</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
