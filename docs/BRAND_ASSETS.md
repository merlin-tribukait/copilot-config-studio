# Brand assets

Copilot Config Studio's mark is a luminous, geometric "M" rune: its joined
strokes suggest a configured path, while the orbit and golden star add a quiet
Merlin-inspired spark. The artwork is an original project identity and is not
affiliated with or endorsed by GitHub.

## Source artwork

| Asset | Intended use |
|---|---|
| `static/brand/app-icon.svg` | Square midnight-violet app mark with a luminous M rune and golden star; source for native application icons. |
| `static/brand/wordmark.svg` | Wordmark for light surfaces. |
| `static/brand/wordmark-light.svg` | Wordmark for dark surfaces. |
| `static/brand/mark-mono.svg` | Single-color SVG mark. Inline it to inherit `currentColor`; external `<img>` usage uses the SVG's default color. |
| `static/favicon.svg` | Compact browser favicon. |

The app navigation combines the square mark with live text so the product name
stays crisp and adapts to the interface. Keep the wordmark SVGs available for
screenshots, project pages, and future about/help surfaces.

## Native application icons

`src-tauri/icons/` contains generated PNG, ICO, ICNS, Windows tile, Android,
and iOS sizes derived from `app-icon.svg`. The desktop bundle references the
32×32, 128×128, 128×128@2x PNGs and the ICO/ICNS files in
`src-tauri/tauri.conf.json`.

Regenerate the platform icon set from the source artwork with:

```sh
npx tauri icon static/brand/app-icon.svg --output src-tauri/icons
```

Treat the SVG files in `static/brand/` as the editable source of truth; do not
edit generated raster and platform container files by hand. The favicon is
linked separately from `src/app.html`.

## Visual guidance

- Keep the midnight-violet, teal, and soft-gold palette for primary brand moments.
- Preserve the M rune and star as a single signature; avoid adding literal wizard
  hats, staffs, or dense ornamental detail at small sizes.
- Use the monochrome mark when a single-color symbol is needed.
- Preserve clear space around the icon and do not stretch the wordmarks.
- Do not add GitHub's Octocat, Copilot symbol, or GitHub wordmark to this
  independent project identity.
- App artwork is not evidence of a completed or connected product feature.
