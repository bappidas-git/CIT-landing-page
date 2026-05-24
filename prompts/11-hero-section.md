# 11 — Hero Section

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§7 hook, §10 form, §9 images).

## Goal
Rebuild the hero as the campaign's headline + the lead form (desktop) — the
single most important above-the-fold conversion zone.

## Files to edit
- `src/components/sections/HeroSection/HeroSection.jsx`
- `src/components/sections/HeroSection/HeroSection.module.css` (colours/spacing)

## Requirements
1. **Background images** → replace the Cloudinary desktop/mobile URLs with
   placehold.co, labelled `CIT+Campus+Hero+Desktop` (1600x900) and
   `CIT+Campus+Hero+Mobile` (800x1000), blue background. Keep the
   fallback-loading logic intact.
2. **Pre-headline chip** → "Direct B.E. Admission 2026 • Limited Seats".
3. **Headline (h1)** → strong, benefit-led, e.g.
   "Your Engineering Future Starts at CIT" with an amber-highlighted phrase like
   "Direct B.E. Admission for 2026". Keep it short and scannable.
4. **Sub-headline** → one or two lines: NAAC-accredited, AICTE-approved,
   VTU degree in Tumakuru, Karnataka with 85%+ placements — guided direct
   admission for students from North East India.
5. **CTA buttons** → primary "Apply Now" (amber) → `openLeadDrawer('apply-now')`;
   secondary "Call +91 88673 54168" → `tel:+918867354168`. Keep `trackCTAClick`.
6. **Trust indicators** → replace the medical ones with:
   "25 Years of Excellence", "85%+ Placements", "90+ Recruiters",
   "NAAC • AICTE • VTU". Use education icons.
7. **Desktop lead form card** → header "Apply for Direct B.E. Admission 2026" /
   "Free guidance from CIT's admission team"; render `UnifiedLeadForm`
   (`source="hero"`, `formId="hero-form"`, `showCourseFields={true}`,
   submit "Apply for 2026 Admission").
8. Swap all teal/navy/orange colours to CIT blue/amber. Set/keep `id="home"`.

## Constraints
- Keep the image fallback `useEffect`, animations, and responsive grid logic.
- Don't remove the desktop-only form gating (`isDesktop`).

## Acceptance criteria
- Hero communicates "Direct B.E. Admission 2026 at CIT for NE students" instantly.
- Desktop shows the admission form; CTAs open the drawer / dial CIT.
- No medical copy; CIT colours throughout.
