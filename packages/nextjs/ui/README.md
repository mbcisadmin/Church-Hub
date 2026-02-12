# @church/nextjs-ui

Shared Next.js UI components built on Shadcn/UI and Radix primitives.

## Features

- ✅ 23 Shadcn/UI components (Button, Input, Dialog, etc.)
- ✅ Theme provider with dark mode support
- ✅ Session provider for NextAuth
- ✅ PWA components (manifest, install prompt)
- ✅ Admin tools (user impersonation, simulation)
- ✅ Reusable utilities (SearchableSelect, etc.)
- ✅ TypeScript + Tailwind CSS

## Installation

```bash
npm install @church/nextjs-ui
```

## Shadcn/UI Components

All standard Shadcn components included:

### Form Components

- `Button` - Buttons with variants
- `Input` - Text inputs
- `Label` - Form labels
- `Textarea` - Multi-line text
- `Select` - Dropdown select
- `Checkbox` - Checkboxes
- `RadioGroup` - Radio buttons
- `Switch` - Toggle switches
- `NumberSpinner` - Custom number input with +/- buttons
- `Calendar` - Date picker
- `Form` - React Hook Form wrapper

### Layout/Display

- `Card` - Card container
- `Alert` - Alert messages
- `Avatar` - User avatars
- `Skeleton` - Loading skeletons
- `Breadcrumb` - Breadcrumb navigation

### Overlays

- `Dialog` - Modal dialogs
- `AlertDialog` - Confirmation dialogs
- `Drawer` - Slide-out panels
- `Popover` - Popovers
- `DropdownMenu` - Dropdown menus
- `Tooltip` - Tooltips

### Data Display

- `Chart` - Recharts wrapper

## Core Infrastructure

### ThemeProvider

Dark mode support:

```typescript
import { ThemeProvider } from '@church/nextjs-ui';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### SessionProvider

NextAuth session wrapper:

```typescript
import { SessionProvider } from '@church/nextjs-ui';

export default function Layout({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### Header & Sidebar

App layout components:

```typescript
import { Header, Sidebar } from '@church/nextjs-ui';

export default function AppLayout({ children }) {
  return (
    <div>
      <Header />
      <div className="flex">
        <Sidebar />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

### AuthWrapper

Protected route wrapper:

```typescript
import { AuthWrapper } from '@church/nextjs-ui';

export default function ProtectedPage() {
  return (
    <AuthWrapper>
      <YourContent />
    </AuthWrapper>
  );
}
```

## Admin Tools

### User Impersonation

Admin can impersonate other users:

```typescript
import { UserMenu, ImpersonateModal } from '@church/nextjs-ui';

// User menu includes impersonation
<UserMenu session={session} />

// Shows banner when impersonating
import { SimulationBanner } from '@church/nextjs-ui';
<SimulationBanner session={session} />
```

### App Simulation Modal

Test different roles/permissions:

```typescript
import { AppSimulationModal } from '@church/nextjs-ui';

<AppSimulationModal />
```

## PWA Components

### Dynamic Manifest

Generate PWA manifest per app:

```typescript
// app/manifest.ts
import { DynamicManifest } from '@church/nextjs-ui';

export default function manifest() {
  return DynamicManifest({
    name: 'Counter App',
    short_name: 'Counter',
    start_url: '/counter',
    // ... other manifest options
  });
}
```

### PWA Install Prompt

Prompt users to install:

```typescript
import { PWAInstallPrompt } from '@church/nextjs-ui';

export default function Layout({ children }) {
  return (
    <>
      <PWAInstallPrompt />
      {children}
    </>
  );
}
```

## Utility Components

### SearchableSelect

Dropdown with search/filter:

```typescript
import { SearchableSelect } from '@church/nextjs-ui';

<SearchableSelect
  value={value}
  onChange={setValue}
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ]}
  placeholder="Select option"
  clearable
/>

// Or with grouped options
<SearchableSelect
  value={value}
  onChange={setValue}
  groupedOptions={[
    {
      label: 'Group 1',
      options: [
        { value: '1', label: 'Option 1' },
      ]
    }
  ]}
/>
```

## Styling

All components use Tailwind CSS with CSS variables for theming.

### Tailwind Config

```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './node_modules/@church/nextjs-ui/src/**/*.{ts,tsx}',
  ],
  // ... other config
};
```

### CSS Variables

Define in `globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 142 70% 45%; /* Your church's brand color */
    /* ... other variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables */
  }
}
```

## Utilities

### cn() Function

Merge Tailwind classes:

```typescript
import { cn } from '@church/nextjs-ui';

<div className={cn('base-class', isActive && 'active-class')} />
```

## Component Patterns

### Forms with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Input, Button } from '@church/nextjs-ui';

const schema = z.object({
  name: z.string().min(1, 'Required'),
});

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Dialogs

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Button } from '@church/nextjs-ui';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

## Customization

### Church Branding

Update colors in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#YOUR_COLOR',
    }
  }
}
```

### Component Overrides

Components can be customized via className prop or by copying and modifying
source files.

## Dependencies

- React 19+
- Next.js 15+
- Tailwind CSS 4+
- Radix UI primitives
- Lucide icons
- next-themes (dark mode)
- react-hook-form + zod (forms)

## License

MIT License - Gospel Kit Template
