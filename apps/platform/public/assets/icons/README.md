# Icon Assets

## Source

The canonical logo is `icon.svg` — the geometric mark on a transparent
background.

## Generated Icons

All PNG/ICO files are generated from the SVG using the shared script:

```bash
node ../scripts/generate-pwa-icons.mjs \
  --svg apps/platform/src/app/icon.svg \
  --out apps/platform/public/assets/icons \
  --bg "#252525"
```

### Files

| File                    | Size     | Purpose                         |
| ----------------------- | -------- | ------------------------------- |
| `icon-192.png`          | 192x192  | Standard PWA icon               |
| `icon-512.png`          | 512x512  | Standard PWA icon (hi-res)      |
| `icon-maskable-192.png` | 192x192  | Maskable PWA icon (safe zone)   |
| `icon-maskable-512.png` | 512x512  | Maskable PWA icon (safe zone)   |
| `apple-touch-icon.png`  | 180x180  | iOS home screen icon            |
| `favicon-196.png`       | 196x196  | Desktop browser favicon         |
| `favicon.ico`           | 16/32/48 | Legacy favicon (multi-size ICO) |

## Regenerating

If the logo SVG changes, re-run the script above to regenerate all icons.
