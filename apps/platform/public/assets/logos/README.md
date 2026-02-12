# Logo Assets

## Design Approach

The header uses a **hybrid approach** for optimal flexibility:

- **Icon**: Church icon (from `public/icon.svg` or
  `/assets/icons/icon-192x192.png`)
- **Text**: Church name as actual HTML text (styled with CSS, driven by
  `church.ts`)

This provides:

- Better accessibility and SEO
- Easy theming and responsive design
- Lighter page weight
- Full CSS control over text styling

## Optional Files

If you want to use a traditional horizontal logo image instead, place:

**church-logo.png** - Full horizontal church logo

- Recommended size: 200px height, transparent background
- Update `/src/components/Header.tsx` to use this image instead of icon + text

## Current Implementation

The header is currently set up to use icon + text. To see it in action, place
your circular icon at `/public/assets/icons/icon-192x192.png`
