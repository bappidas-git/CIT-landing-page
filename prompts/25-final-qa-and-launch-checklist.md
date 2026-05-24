# 25 — Final QA & Launch Checklist

**Prerequisite:** All prompts 01-24 completed.

## Goal
Guarantee a clean, working, fully-CIT landing page with zero Monjoven/medical
traces, correct placeholders, and a passing build.

## Steps

### A. Eradicate every Monjoven / medical trace
Run and resolve until empty (search code, copy, comments, alt text, meta, admin):
```
grep -rni "monjoven\|porag\|neog\|transplant\|cosmetic\|clinic\|patient\|hairfall\|rhinoplasty\|liposuction\|gynecomastia\|prp\|fue\|dhi\|consultation\|surgery\|surgeon\|guwahati\|pratiksha" src public .env .env.example package.json index.html
```
Fix any remaining hits (some legitimate words like "Civil"/"service worker" may
match substrings — review each; only change actual medical/Monjoven content).
Also re-check the old teal/orange palette:
```
grep -rni "#148F77\|#1ABC9C\|#0E6655\|#FF6B35\|#1A5276" src
```
Replace any stragglers with CIT blue/amber tokens.

### B. Placeholder image audit
- Confirm **every** image uses `placehold.co` with a descriptive `text=` label and
  CIT brand colours. No Cloudinary/Monjoven/real asset URLs remain.
- `grep -rni "cloudinary\|res.cloudinary\|monjoven.com" src public` → empty.

### C. Lead-capture smoke test (manual, `npm start`)
- Hero form, drawer (from every CTA), and contact form all: validate, block
  duplicates, submit, and redirect to `/thank-you`.
- Submitted payload includes name, mobile, email, **course**, **state**, message.
- Admin (`/admin`) login works; new lead appears with Course + State; CSV export
  has matching columns.

### D. Content & UX pass
- Page order matches §11 of the master reference; nav anchors scroll correctly.
- Copy is minimal, benefit-led, NE-focused; only facts from the master reference.
- Trust signals present (NAAC/AICTE/VTU, 25 years, 85%+ placements, recruiters).
- Urgency/limited-2026-seats messaging present near the end.

### E. Responsive & quality gates
- Verify at 360px, 768px, 1280px: hero, forms, recruiter wall, mobile bottom nav,
  drawer, footer — no overflow or broken layout.
- `npm run build` completes with no errors (warnings reviewed).
- Lighthouse/console: no runtime errors; images have alt text; CTAs are tappable.

### F. Final report
Summarise: files changed, any assumptions made, anything the user must still
configure (real images, real domain, GTM/Pixel/Ads IDs, social URLs, hostel/fee
details). List anything that could NOT be verified (e.g. exact fees) so the user
can fill it in.

## Acceptance criteria
- All greps in A & B come back clean (after legitimate-substring review).
- Build passes; lead flow + admin verified end-to-end.
- A short launch-readiness report is produced.
