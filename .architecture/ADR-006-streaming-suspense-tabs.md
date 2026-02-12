# ADR-006: Streaming Suspense for Multi-Tab Dashboards

**Status**: Accepted **Date**: 2026-02-05

## Context

Dashboard pages often fetch data from multiple stored procedures or API
endpoints. When all data is awaited before rendering (e.g.,
`await Promise.all([fetchA(), fetchB(), fetchC()])`), the page is blocked until
the slowest endpoint responds. For the Circles dashboard, this meant the user
saw a full-page loading skeleton for several seconds even though the default
tab's data (Over Time) was ready much sooner than the other tabs' data (Current,
Milestones).

The default tab should load immediately. Tabs the user hasn't clicked yet can
load in the background and become available when their data arrives.

## Decision

**Use React Suspense streaming to progressively load tab data.** Only the
default tab's data blocks the initial render. Other tabs stream in via async
server components wrapped in `<Suspense>` boundaries, with skeleton fallbacks
shown until data arrives. Tabs are disabled until their data is ready.

### Architecture

```
page.tsx (server)
  ├─ await fetchDefaultTabData()          ← blocks initial render
  ├─ <Suspense fallback={<Skeleton/>}>
  │    └─ TabAStream                      ← async server component, streams in
  ├─ <Suspense fallback={<Skeleton/>}>
  │    └─ TabBStream                      ← async server component, streams in
  └─ Dashboard (client)
       ├─ Default tab rendered inline (data ready)
       ├─ Tab A slot: hidden until active, always in DOM for streaming
       └─ Tab B slot: hidden until active, always in DOM for streaming
```

### Key components

1. **`_data/fetchers.ts`** — Server-only module exporting data fetching
   functions. Shared between `page.tsx` (for the default tab) and stream
   components (for deferred tabs).

2. **`TabReadyProvider`** (client context) — Tracks which tabs have finished
   loading via a `Set<string>`. Provides `isReady(tab)` and `markReady(tab)`.

3. **`TabReadyMarker`** (client component) — Renders nothing. Calls
   `markReady(tab)` on mount. Placed inside each stream component so it fires
   when the async data resolves.

4. **Stream components** (async server components, NO `'use client'`) — Await
   the deferred data, then render `<TabReadyMarker />` + the actual tab
   component.

5. **Skeleton components** — Suspense fallbacks matching the real tab layout
   with `animate-pulse` placeholders.

### Critical constraints

- **Suspense boundaries must stay mounted.** If a Suspense boundary is
  conditionally rendered (`{activeTab === 'foo' && <Suspense>...`), React
  unmounts it and streaming stops. Use `display: none` to hide inactive tabs
  while keeping boundaries in the DOM.

- **Chart.js resize.** Charts rendered inside `display: none` containers have
  0×0 dimensions. Dispatch `window.dispatchEvent(new Event('resize'))` via
  `requestAnimationFrame` when switching tabs so Chart.js recalculates.

- **Tab disable UX.** Disabled tabs show `opacity-50 cursor-not-allowed`. The
  tab switch handler checks `isReady(tab)` and returns early if not ready. Over
  Time (default) is never disabled.

### Implementation pattern for new dashboards

```tsx
// page.tsx
export default async function DashboardPage() {
  const defaultData = await fetchDefaultData();

  return (
    <TabReadyProvider>
      <Dashboard
        defaultData={defaultData}
        tabASlot={
          <Suspense fallback={<TabASkeleton />}>
            <TabAStream />
          </Suspense>
        }
        tabBSlot={
          <Suspense fallback={<TabBSkeleton />}>
            <TabBStream />
          </Suspense>
        }
      />
    </TabReadyProvider>
  );
}

// streams/TabAStream.tsx (NO 'use client')
export default async function TabAStream() {
  const data = await fetchTabAData();
  return (
    <>
      <TabReadyMarker tab="tabA" />
      <TabAContent data={data} />
    </>
  );
}

// Dashboard.tsx ('use client')
// - Accept slot props as ReactNode
// - Use useTabReady() for isReady checks
// - Render slots in always-mounted divs with display toggle
// - Dispatch resize event on tab switch
```

## Consequences

### Positive Consequences

- **Dramatically faster perceived load** — the default tab renders as soon as
  its data is ready, not after all tabs' data arrives
- **Progressive enhancement** — other tabs appear as they become available, with
  clear disabled/loading states
- **No layout shift** — skeleton fallbacks match real tab layouts
- **Reusable pattern** — `TabReadyProvider` and `TabReadyMarker` can be shared
  across all multi-tab dashboards
- **Server-rendered content** — streamed data is still server-rendered HTML, not
  client-side fetched

### Negative Consequences

- **All tab content is in the DOM** — even hidden tabs are rendered (once
  streamed). This uses more memory than conditional rendering.
  - **Mitigation**: For most dashboards this is negligible. If a tab has very
    heavy DOM (thousands of rows), consider lazy-loading within the tab itself.
- **Chart.js resize workaround** — charts in hidden tabs need a synthetic resize
  event to render correctly on first reveal.
  - **Mitigation**: A single `requestAnimationFrame` + `dispatchEvent` call in
    the tab switch handler handles this reliably.
- **Theme-keyed remounting doesn't apply to streamed tabs** — the Over Time tab
  uses `key={resolvedTheme}` to remount on theme change, but streamed tabs
  remain mounted. Chart.js theme sync must be handled separately.
  - **Mitigation**: Chart.js `defaults.color` is set in a `useEffect` that runs
    on theme change, which covers most cases.

### Neutral Consequences

- The `loading.tsx` file (full-page skeleton) still handles the initial page
  navigation loading state. Streaming Suspense handles within-page progressive
  loading of deferred tabs. Both patterns coexist.
- Server components that stream data make their own `fetch` calls. If the same
  data is needed across tabs, consider extracting shared fetches to `page.tsx`
  and passing via props instead.
