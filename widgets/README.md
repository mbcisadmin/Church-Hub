# Widgets

This directory contains embeddable widgets for use on WordPress sites and other platforms.

## What Goes Here

Standalone, embeddable widgets that can be added to any website:

- **Event registration forms** - Embed on WordPress event pages
- **Small group finders** - Searchable group directory
- **Donation buttons** - Quick giving widgets
- **Prayer request forms** - Submit prayer requests
- **Sermon player** - Audio/video sermon embed

## Structure

```
widgets/
├── event-registration/    # Event RSVP widget
├── group-finder/          # Groups directory widget
├── donate-button/         # Donation widget
└── prayer-request/        # Prayer form widget
```

## How Widgets Work

Widgets are:
1. **Standalone Next.js apps** with minimal UI
2. **Deployed separately** to Vercel
3. **Embedded** via `<iframe>` or script tag
4. **Styled** to match church website

## Widget vs Microsite vs App

| Feature | Apps | Microsites | Widgets |
|---------|------|-----------|---------|
| **URL** | apps.yourchurch.org | groups.yourchurch.org | widgets.yourchurch.org/event-registration |
| **Usage** | Internal tools | Full websites | Embeddable components |
| **Deployment** | Single project | One per site | One per widget |
| **Integration** | Standalone | Standalone | Embedded in WordPress |

## Creating a New Widget

Use the template in `templates/widget/`:

```bash
# Copy template
cp -r templates/widget widgets/event-registration

# Install dependencies
cd widgets/event-registration
npm install

# Configure
cp .env.example .env

# Develop
npm run dev
```

Or use a Claude skill (when available):
```bash
/new-widget
```

## Embedding Widgets

### Option 1: iFrame (Recommended)

```html
<iframe
  src="https://widgets.yourchurch.org/event-registration?eventId=123"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

### Option 2: Script Tag

```html
<div id="gk-widget-event-registration" data-event-id="123"></div>
<script src="https://widgets.yourchurch.org/event-registration/embed.js"></script>
```

## Shared Packages

Widgets can use:
- `@church/ministry-platform` - MP API client
- `@church/database` - Zod schemas
- `@church/nextjs-ui` - UI components (styled for embedding)
- `@church/tailwind-config` - Theme tokens

## Styling for Embedding

Widgets should:
- ✅ Use minimal, scoped styles
- ✅ Respond to parent container width
- ✅ Support light/dark mode from parent
- ✅ Avoid conflicting with parent page CSS

## Deployment

Each widget deploys to Vercel as a **separate project** or **route**:

**Option A: Separate Projects** (simple)
- `event-registration.yourchurch.org`
- `group-finder.yourchurch.org`

**Option B: Single Widget Server** (organized)
- `widgets.yourchurch.org/event-registration`
- `widgets.yourchurch.org/group-finder`

## Examples to Build

- **Event Registration** - RSVP forms for WordPress event pages
- **Group Finder** - Browse groups, embed in "Connect" page
- **Quick Give** - Donation buttons for any page
- **Prayer Requests** - Submit prayer needs
- **Sermon Player** - Embed latest sermon
- **Contact Form** - General contact/info request forms

## WordPress Integration

Widgets integrate with WordPress via:
1. **Custom shortcode** (if using WordPress plugin)
2. **HTML block** with iframe embed
3. **Custom HTML widget** in sidebar

Example shortcode:
```php
[gospel_kit_widget type="event-registration" event_id="123"]
```

---

**Status:** Template structure defined, awaiting first implementation
**Next Steps:** Build first widget when church needs WordPress integration
