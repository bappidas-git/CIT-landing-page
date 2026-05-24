# 02 — Brand Colour System & MUI Theme

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§8 Brand colours).

## Goal
Replace the boilerplate's medical teal/navy palette with the **CIT blue + red +
amber** system across the design tokens and theme, so every later section
inherits the right colours.

## Files to edit
- `src/styles/variables.css` (CSS custom properties — the master palette)
- `src/theme/muiTheme.js` (MUI palette: primary, secondary, etc.)
- `src/styles/global.css` and `src/styles/animations.css` (any hardcoded teal)
- `src/App.css`

## Requirements
1. In `variables.css`, define the CIT tokens from §8 and map any existing
   colour variable names to them so consuming CSS keeps working:
   - primary `#0B3D91`, primary-dark `#072A66`, secondary/red `#C8102E`,
     accent/CTA `#F4A300`, accent-dark `#D98C00`, success `#1E8E5A`,
     tint `#EAF1FB`, text `#11203A`, white `#FFFFFF`.
2. In `muiTheme.js`, set:
   - `palette.primary.main = #0B3D91` (dark `#072A66`)
   - `palette.secondary.main = #C8102E`
   - a custom accent (`#F4A300`) used for CTA buttons
   - update any success/info/text colours that were teal.
3. Find and replace the hardcoded medical palette wherever it appears in these
   files: teal `#148F77`, `#1ABC9C`, `#0E6655`, `#16A085`; navy `#1A5276`,
   `#1A3C5E`; CTA orange `#FF6B35`/`#E85A20`. Map:
   - teal/navy structural colour → CIT blue tokens
   - CTA orange → CIT amber (`#F4A300` / hover `#D98C00`)
4. Update the loader/spinner colours and the scroll-progress gradient in
   `src/App.jsx` (they use `#148F77`) — change to CIT blue. (You may do the
   App.jsx colour swap here or note it for the section prompts; prefer doing it
   here.)

## Constraints
- This prompt is **colours only** — do not change copy, layout, or structure.
- Keep contrast accessible (amber buttons use dark text `#11203A` or white as
  appropriate; verify legibility).

## Acceptance criteria
- No teal (`#148F77`, `#1ABC9C`) or `#FF6B35` orange remains in the edited files.
- App renders with a blue/red/amber identity; CTAs are amber.
- `npm run build` compiles with no new warnings from these files.
