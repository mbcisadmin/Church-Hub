# Widget Template

Template for creating embeddable widgets for WordPress and other platforms.

## What is a Widget?

Widgets are **small, focused applications** that embed in existing websites:

- Embed via: `<iframe>` or `<script>` tag
- Live at: `widgets.yourchurch.org/event-registration`
- Purpose: Add MP functionality to WordPress, Squarespace, etc.
- Lightweight and isolated

## When to Use This Template

Use this template when building:
- ✅ Event registration forms (embed on WordPress event pages)
- ✅ Group finder (embed in "Connect" page)
- ✅ Donation buttons (embed anywhere)
- ✅ Prayer request forms
- ✅ Sermon players

**Don't use for:**
- ❌ Full websites → Use `templates/microsite/`
- ❌ Internal tools → Use `templates/micro-app/`

## How to Use

### Option 1: Claude Skill (When Available)

```bash
/new-widget
```

### Option 2: Manual Creation

```bash
# Copy template to widgets directory
cp -r templates/widget widgets/event-registration

# Navigate and install
cd widgets/event-registration
npm install

# Configure
cp .env.example .env

# Develop
npm run dev
```

## Template Structure (To Be Built)

When this template is created, it will include:

```
templates/widget/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Widget UI
│   │   ├── embed/
│   │   │   └── route.ts       # Embed script generator
│   │   └── api/
│   │       └── route.ts       # Widget API
│   ├── components/
│   │   └── WidgetContainer.tsx # Scoped styling wrapper
│   └── lib/
│       └── postMessage.ts     # Parent-child communication
├── public/
│   └── embed.js               # Embed script
├── .env.example
├── package.json
├── next.config.ts             # Configured for embedding
└── README.md
```

## Widget Requirements

Widgets must:

- ✅ **Work in iframes** - No frame-busting, allow embedding
- ✅ **Scoped styles** - No CSS conflicts with parent page
- ✅ **Responsive** - Adapt to parent container width
- ✅ **Secure** - Validate postMessage origins
- ✅ **Fast** - Minimal JavaScript, optimized load time

## Embedding Methods

### Option 1: iFrame (Recommended)

Simple and isolated:

```html
<iframe
  src="https://widgets.yourchurch.org/event-registration?eventId=123"
  width="100%"
  height="600"
  frameborder="0"
  scrolling="auto"
></iframe>
```

### Option 2: Script Tag (Advanced)

More integrated with parent page:

```html
<div id="gk-widget" data-widget="event-registration" data-event-id="123"></div>
<script src="https://widgets.yourchurch.org/embed.js"></script>
```

## Communication with Parent

Widgets can communicate height changes and events to parent:

```typescript
// In widget
window.parent.postMessage({
  type: 'gk-widget-resize',
  height: 600
}, '*');

// Parent listens
window.addEventListener('message', (event) => {
  if (event.data.type === 'gk-widget-resize') {
    iframe.height = event.data.height;
  }
});
```

## Styling for Embedding

Use scoped, isolated styles:

```css
/* Prefix all classes */
.gk-widget-container { }
.gk-widget-button { }

/* Or use CSS modules */
import styles from './Widget.module.css';

/* Or use Tailwind with custom prefix */
/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'gk-',
  // ...
}
```

## WordPress Integration

### Shortcode Method

Create WordPress plugin with shortcode:

```php
// In WordPress plugin
function gospel_kit_widget_shortcode($atts) {
  $atts = shortcode_atts([
    'type' => 'event-registration',
    'event_id' => '',
  ], $atts);

  return sprintf(
    '<iframe src="https://widgets.yourchurch.org/%s?eventId=%s" width="100%%" height="600" frameborder="0"></iframe>',
    esc_attr($atts['type']),
    esc_attr($atts['event_id'])
  );
}
add_shortcode('gospel_kit_widget', 'gospel_kit_widget_shortcode');

// Usage in WordPress:
// [gospel_kit_widget type="event-registration" event_id="123"]
```

## Example Widgets

- **Event Registration** - RSVP forms for events
- **Group Finder** - Search and browse small groups
- **Quick Give** - Simple donation form
- **Prayer Request** - Submit prayer needs
- **Sermon Player** - Latest sermon audio/video
- **Contact Form** - General inquiry form

## Deployment

Widgets can deploy:

**Option A: One Project Per Widget**
- `event-registration.yourchurch.org`
- `group-finder.yourchurch.org`

**Option B: Single Widget Server** (recommended)
- `widgets.yourchurch.org/event-registration`
- `widgets.yourchurch.org/group-finder`

Configure in Vercel:
- Root directory: `widgets/event-registration` (or use monorepo filter)
- Build command: `cd ../.. && npm run build --filter=@church/event-registration-widget`

---

**Status:** Template not yet built
**Next Steps:** Build template when first WordPress integration is needed
**Pattern:** Minimal Next.js app with iframe-friendly configuration
