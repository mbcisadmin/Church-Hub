# The Hub Navigation System

## Overview

A responsive navigation system for The Hub platform with distinct mobile and
desktop experiences, designed with PWA support in mind.

## Architecture

### Components

| Component               | Platform | Description                                          |
| ----------------------- | -------- | ---------------------------------------------------- |
| `NavigationSidebar.tsx` | Mobile   | Slide-out overlay sidebar from left                  |
| `NavigationRail.tsx`    | Desktop  | Collapsible rail sidebar (expanded/collapsed states) |
| `AppHeader.tsx`         | Both     | Top header with hamburger, logo, search, profile     |

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ AppHeader                                               │
├───────────┬─────────────────────────────────────────────┤
│           │                                             │
│ Navigation│              Main Content                   │
│   Rail    │                                             │
│ (desktop) │                                             │
│           │                                             │
└───────────┴─────────────────────────────────────────────┘
```

---

## Navigation Structure

### Primary Sections (Fixed Order)

These sections are always visible in a fixed order:

| Order | Section | Icon         | Base Path | Action Label | Description                    |
| ----- | ------- | ------------ | --------- | ------------ | ------------------------------ |
| 1     | Events  | CalendarDays | `/events` | New          | Church events and calendar     |
| 2     | Serve   | Handshake    | `/serve`  | —            | Volunteer opportunities        |
| 3     | Giving  | HandCoins    | `/giving` | Give Now     | Personal giving (custom label) |
| 4     | Groups  | UsersRound   | `/groups` | New          | Small groups management        |

> **PWA Note:** In PWA bottom tabs, Home uses the church logo and is centered:
> `Events | Serve | [Logo] | Giving | Groups` + More tab for dynamic sections
> **Home Page:** Accessible via header logo click, not a nav section

### Dynamic Sections (Alphabetized)

These sections appear below a separator line, sorted alphabetically. On desktop,
if a dynamic section is active, it bumps to the top of the dynamic list.

| Section       | Icon      | Base Path        | Action Label | Source                                       |
| ------------- | --------- | ---------------- | ------------ | -------------------------------------------- |
| Announcements | Megaphone | `/announcements` | New          | Static                                       |
| Apps          | Rocket    | `/apps`          | Request      | API (`/api/permissions/apps?type=app`)       |
| Budgets       | PiggyBank | `/budgets`       | Request      | Static                                       |
| Dashboards    | BarChart3 | `/dashboards`    | Request      | API (`/api/permissions/apps?type=dashboard`) |
| Discipleship  | Heart     | `/discipleship`  | New Journey  | Static                                       |
| Prayer        | HandHeart | `/prayer`        | New          | Static                                       |

### Communication Apps (Bottom Nav)

These standalone apps appear above Settings in the bottom nav section:

| App   | Icon  | Route    | Description            |
| ----- | ----- | -------- | ---------------------- |
| Email | Mail  | `/email` | Send email to contacts |
| Phone | Phone | `/phone` | Call or text contacts  |

> **Deep Linking:** These apps support direct linking to contacts via
> `/people/search/[contactId]/email` and `/people/search/[contactId]/phone`

### Special Elements

| Element  | Position                | Description       |
| -------- | ----------------------- | ----------------- |
| Search   | Top (above sections)    | Opens SearchSheet |
| Email    | Bottom (above Settings) | Communication app |
| Phone    | Bottom (above Settings) | Communication app |
| Settings | Bottom                  | Opens settings    |
| Sign Out | Bottom (red)            | Signs out user    |

---

## Section Details

Items are shown as compact text links. Action buttons are styled separately at
the bottom of the section with a + icon. Labels are fully customizable (e.g.,
"New", "Give Now", etc.).

### Primary: Events

- Calendar
- Event Finder
- Registration
- Cancellations
- **[+ New]**

### Primary: Serve

- Opportunities
- Schedule

### Primary: Giving

- History
- Recurring
- **[+ Give Now]** ← custom label example

### Primary: Groups

- My Groups
- Find a Group
- All Groups
- **[+ New]**

### Dynamic: Announcements

- All Announcements
- Widget
- View
- **[+ New]**

### Dynamic: Budgets

- All Budgets

### Dynamic: Discipleship

- Growth Track
- Baptism
- Membership
- Classes

### Dynamic: Prayer

- Prayer Wall
- **[+ New]**

---

## Responsive Behavior

### Mobile (< md breakpoint)

**Header Layout:**

```
[☰]          [LOGO]          [🔍] [👤]
 ↑              ↑                  ↑
hamburger   DEAD CENTER      search + avatar
```

**Sidebar:**

- Opens as full overlay from left
- Dark backdrop (click to close)
- Primary sections first (Events, Serve, Giving, Groups)
- Separator line
- Dynamic sections alphabetized
- ScrollIndicator shows when content overflows

### Desktop (≥ md breakpoint)

**Expanded State (280px):**

```
┌─────────────────────────┐
│ [<] [LOGO] THE HUB      │
│     CHURCH NAME         │
├─────────────────────────┤
│ 🔍 Search...            │
├─────────────────────────┤
│ ▼ EVENTS                │
│   CALENDAR              │
│   EVENT FINDER          │
│   REGISTRATION          │
│   + Add Event           │  ← green, styled differently
│ ▼ SERVE                 │
│   OPPORTUNITIES         │
│   SCHEDULE              │
│ ▼ GIVING                │
│   GIVE NOW              │
│   HISTORY               │
│ ▼ GROUPS                │
│   MY GROUPS             │
│   FIND A GROUP          │
│   + Add Group           │  ← green, styled differently
├─────────────────────────┤
│ ▶ Announcements         │
│ ▶ Apps                  │
│ ▶ Budgets               │
│ ▶ Dashboards            │
│ ▶ Discipleship          │
│ ▶ Prayer                │
├─────────────────────────┤
│ ⚙ Settings              │
│ 🚪 Sign Out (red)       │
└─────────────────────────┘
```

**Collapsed State (56px):**

```
┌──────┐
│ [>]  │  ← Expand button
├──────┤
│  🔍  │  ← Search
├──────┤
│  📅  │  ← Events
│  🤝  │  ← Serve
│  💰  │  ← Giving
│  👥  │  ← Groups
├──────┤
│  📢  │  ← Announcements
│  🚀  │  ← Apps
│  💵  │  ← Budgets
│  📊  │  ← Dashboards
│  ❤️  │  ← Discipleship
│  🙏  │  ← Prayer
├──────┤
│  ⚙️  │  ← Settings
│  🚪  │  ← Sign Out
└──────┘
```

**Desktop Dynamic Section Sorting:**

- If user is viewing a dynamic section (e.g., `/dashboards/circles`), that
  section bumps to the top of the dynamic list
- Otherwise, dynamic sections are alphabetized

---

## PWA Considerations

When running as PWA, a bottom tab bar replaces the sidebar:

**Bottom Tabs (5 max):**

```
┌─────┬─────┬─────┬─────┬─────┐
│ 📅  │ 🤝  │ 🏠  │ 👥  │ ☰   │
│Event│Serve│HOME │Group│More │
└─────┴─────┴─────┴─────┴─────┘
          ↑
    Featured/Centered
```

- Home is featured in the center position (church logo)
- "More" tab opens a sheet with dynamic sections

---

## State Management

### Section Expansion State

Only the section containing the current route is expanded by default:

```typescript
const getActiveSectionId = (path: string): string | null => {
  // Check Home paths specifically
  if (
    path === '/' ||
    ['/favorites', '/giving', '/my-groups', '/serving', '/household'].some(
      (p) => path.startsWith(p)
    )
  ) {
    return 'home';
  }
  if (path.startsWith('/dashboards')) return 'dashboards';
  if (path.startsWith('/apps')) return 'apps';
  // Check all defined sections
  const activeSection = ALL_SECTIONS.find(
    (s) => s.basePath !== '/' && path.startsWith(s.basePath)
  );
  return activeSection?.id || null;
};

const [expandedSections, setExpandedSections] = useState<string[]>(() => {
  const activeSection = getActiveSectionId(pathname);
  return activeSection ? [activeSection] : [];
});
```

### Auto-Expand on Navigation

When user navigates to a route, the corresponding section auto-expands.

### Desktop Dynamic Section Bumping

On desktop, the active dynamic section moves to the top of the dynamic list:

```typescript
dynamicList.sort((a, b) => {
  // Active section goes first
  if (a.id === activeDynamicId) return -1;
  if (b.id === activeDynamicId) return 1;
  // Then alphabetical
  return a.label.localeCompare(b.label);
});
```

---

## Data Fetching

### Dynamic Apps/Dashboards

Fetched on component mount (NavigationRail) or sidebar open (NavigationSidebar):

```typescript
const [dashboardRes, appRes] = await Promise.all([
  fetch('/api/permissions/apps?type=dashboard'),
  fetch('/api/permissions/apps?type=app'),
]);
```

---

## Interaction Patterns

### Hover States

- Nav items: Icon and text turn brand green on hover
- Gray circular background appears behind icon

### Active States

- Section header turns brand green when any child route is active
- Active nav item has subtle background

### Animations

- Framer Motion for sidebar slide-in/out
- Collapsible sections animate height smoothly
- ScrollIndicator chevron bounces subtly

---

## Accessibility

- Escape key closes sidebar
- Click outside (backdrop) closes sidebar
- Proper `aria-label` on buttons
- Focus management on open/close

---

## Files

| File                                                    | Purpose                  |
| ------------------------------------------------------- | ------------------------ |
| `src/components/NavigationSidebar.tsx`                  | Mobile overlay sidebar   |
| `src/components/NavigationRail.tsx`                     | Desktop collapsible rail |
| `src/components/AppHeader.tsx`                          | Responsive header        |
| `packages/nextjs/ui/src/components/ScrollIndicator.tsx` | Reusable scroll hint     |

---

## Philosophy: The Hub as a True Hub

The Hub doesn't need to rebuild every tool—it needs to **organize access** to
all the tools staff already use.

### External Links as First-Class Citizens

Nav items can point to:

- **Internal pages** - Custom solutions built in The Hub (`/events/add`)
- **External links** - Existing tools like MP, Planning Center, Pushpay
  (`https://mp.church.com/events/add`)

This enables:

1. **Day 1 value** - Launch with links to existing tools. Staff gets one place
   to find everything.
2. **Progressive replacement** - Build custom solutions when there's clear
   value, swap the link.
3. **Zero-friction onboarding** - No "we need to build X first" blockers.
4. **Per-church flexibility** - Church A uses Pushpay, Church B uses Tithe.ly?
   Different links, same nav.

### Example Progression

```
Phase 1: Link to MP's event creation page
         → Staff uses The Hub to navigate, MP to create

Phase 2: Build simple event form in The Hub
         → Swap link to internal /events/add
         → Staff does everything in The Hub

Phase 3: Add advanced features (templates, approval workflows)
         → The Hub becomes the preferred tool
```

---

## Future: Neon-Driven Navigation

Store nav configuration in Neon for flexibility and multi-tenant support.

### Proposed Schema

```sql
-- Sections (Events, Serve, Giving, Groups, etc.)
nav_sections (
  id              UUID PRIMARY KEY,
  church_id       UUID REFERENCES churches(id),
  key             TEXT NOT NULL,        -- 'events', 'serve', 'giving'
  label           TEXT NOT NULL,        -- 'Events'
  icon            TEXT NOT NULL,        -- 'CalendarDays'
  is_primary      BOOLEAN DEFAULT false,-- Primary tabs vs dynamic
  sort_order      INT NOT NULL,
  is_enabled      BOOLEAN DEFAULT true,
  -- Optional action button at bottom of section (separate from items list)
  -- Label is fully customizable: 'New', 'Give Now', 'Submit', etc.
  add_action_label TEXT,                -- Custom label (null = no button). Examples: 'New', 'Give Now'
  add_action_url  TEXT,                 -- '/events/add' OR 'https://pushpay.com/...'
  add_action_external BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ
)

-- Items within sections (navigation links, NOT add/create actions)
nav_items (
  id              UUID PRIMARY KEY,
  section_id      UUID REFERENCES nav_sections(id),
  church_id       UUID REFERENCES churches(id),
  label           TEXT NOT NULL,        -- 'Calendar', 'Event Finder'
  destination     TEXT NOT NULL,        -- '/events' OR 'https://mp.church.com/...'
  is_external     BOOLEAN DEFAULT false,
  opens_new_tab   BOOLEAN DEFAULT false,
  sort_order      INT NOT NULL,
  is_enabled      BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ
)
```

**Note:** Add/Create actions are configured on the section itself
(`add_action_*` fields), not as nav_items. This keeps the items list clean and
allows the UI to style the add button differently.

### Benefits

- **No code deploys for nav changes** - Admin UI to manage links
- **Per-church configuration** - Each church has their own nav structure
- **Easy onboarding** - Seed with default links to MP, swap as needed
- **Analytics ready** - Track clicks to understand what tools matter
- **A/B testing** - Test internal vs external to prove value before building

### Migration Path

1. Current: Hardcoded sections in React components
2. Next: Fetch from API, fallback to hardcoded defaults
3. Later: Admin UI to manage nav items
4. Future: Analytics, usage tracking, recommendations

---

## Future Enhancements

1. **Persist expansion state** - Remember which sections user prefers open
2. **Permission-based sections** - Hide sections user can't access
3. **Favorites/pinning** - Let users pin frequently used items
4. **Recent items** - Show recently visited pages
5. **Search in sidebar** - Filter nav items as user types
6. **Keyboard navigation** - Arrow keys to navigate sections

---

## Inter-App Connectivity & Deep Linking

A core philosophy of The Hub is that apps should be interconnected. When you see
a person's name anywhere in the platform, you should be able to navigate to
their contact details and take actions.

### Deep Link Architecture

**Contact Routes (People Search):**

```
/people/search                    # Search page
/people/search/[contactId]        # Contact detail page
/people/search/[contactId]/phone  # Phone page (call/text)
/people/search/[contactId]/email  # Email compose page
```

### Connectivity Patterns

**1. Person Row Component (Proposed)**

Create a reusable component for displaying person rows that links to
people-search:

```tsx
// Any list of people can use this
<PersonRow
  contact={member}
  onClick={() => router.push(`/people/search/${member.Contact_ID}`)}
/>

// Examples of usage:
// - Group member lists → click to view contact
// - Event attendee lists → click to view contact
// - Serving team rosters → click to view contact
// - Household members → click to view contact
```

**2. Communication Actions**

From any contact, users can:

- **Email**: Navigate to `/people/search/[contactId]/email`
- **Phone**: Navigate to `/people/search/[contactId]/phone`
  - Call directly
  - Text from personal number (native SMS)
  - Text from church number (in-app, future)

**3. Cross-App Deep Links**

Other apps can link directly to communication pages:

```tsx
// From a group member list
<button onClick={() => router.push(`/people/search/${memberId}/email`)}>
  Email Member
</button>

// From a serving schedule
<a href={`/people/search/${volunteerId}/phone`}>
  Contact Volunteer
</a>
```

### Architectural Approaches

**Approach A: Standalone Pages (Current)**

- Each action (email, phone) is a full page
- Deep-linkable, bookmarkable
- Works with browser back/forward
- Better for sharing links

```
/people/search/123/email  →  Full page email compose
/people/search/123/phone  →  Full page phone options
```

**Approach B: Modal/Sheet from Any Page (Alternative)**

- Communication modals that can open from anywhere
- Context preserved (user stays on current page)
- Less navigation, more fluid

```tsx
// Open email sheet from any page
<EmailSheet
  contactId={123}
  open={showEmail}
  onClose={() => setShowEmail(false)}
/>
```

**Approach C: Hybrid (Recommended)**

- Standalone pages for direct navigation and deep links
- Sheet/modal version for quick actions within context
- Route-based pages that can also be rendered as sheets

```tsx
// Standalone page at /people/search/123/email
// OR embedded as sheet in any page
<EmailPageContent email={contact.Email_Address} />
```

### Future: Communication as First-Class Apps

Email and Phone could evolve into full communication apps with history and
context:

**Email App (`/email`):**

- Sent emails history
- Email templates
- Bulk email to groups
- Scheduled emails

**Phone App (`/phone`):**

- Call/text history
- Church number texting (Twilio integration)
- Text templates
- Group texting

### Implementation Considerations

**1. Contact ID Consistency**

- Use MinistryPlatform `Contact_ID` as the universal identifier
- All apps should use the same ID to enable cross-linking

**2. URL Parameters for Context**

- Can pass context via URL params:
  `/people/search/123/email?from=groups&groupId=456`
- Enables "Back to Group" type navigation

**3. Permission Checks**

- Email/phone pages should verify user has permission to view contact
- Consider rate limiting for communication actions

**4. Analytics Tracking**

- Track which apps are navigating to people-search
- Understand communication patterns (who emails/texts most)

### Example: Group Member List with Deep Links

```tsx
function GroupMemberRow({ member }: { member: GroupMember }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 p-3">
      {/* Click name to view full contact */}
      <button
        onClick={() => router.push(`/people/search/${member.Contact_ID}`)}
        className="flex-1 text-left"
      >
        <span className="font-medium">{member.Display_Name}</span>
      </button>

      {/* Quick actions */}
      {member.Email_Address && (
        <button
          onClick={() =>
            router.push(`/people/search/${member.Contact_ID}/email`)
          }
          className="hover:bg-muted rounded-full p-2"
        >
          <Mail className="h-4 w-4" />
        </button>
      )}
      {member.Mobile_Phone && (
        <button
          onClick={() =>
            router.push(`/people/search/${member.Contact_ID}/phone`)
          }
          className="hover:bg-muted rounded-full p-2"
        >
          <Phone className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

This pattern allows any list of people in The Hub to be "communication-enabled"
with consistent UX.
