# Brand assets

Copilot Config Studio uses a small route-to-hub mark: three route lines meet a
central node, then continue as an arrow. The artwork is an original project
identity and is not affiliated with or endorsed by GitHub.

## Source artwork

| Asset | Intended use |
|---|---|
| `static/brand/app-icon.svg` | Square gradient app mark; source for native application icons. |
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

- Keep the violet gradient for the app icon and primary brand moments.
- Use the monochrome mark when a single-color symbol is needed.
- Preserve clear space around the icon and do not stretch the wordmarks.
- Do not add GitHub's Octocat, Copilot symbol, or GitHub wordmark to this
  independent project identity.
- App artwork is not evidence of a completed or connected product feature.
