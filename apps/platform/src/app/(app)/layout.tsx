/**
 * Layout for authenticated app routes
 *
 * This layout wraps all routes in the (app) group.
 * Users must be authenticated to access these routes (enforced by middleware).
 *
 * Add shared components like Header, Sidebar, etc. here as you build them.
 */
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Add your header component here */}
      <main className="flex-1">
        {children}
      </main>
      {/* Add your footer component here */}
    </div>
  );
}
