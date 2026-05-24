# 04 — Unified Lead Form (the conversion core)

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§10 Lead-form spec).

## Goal
Convert the medical consultation form into the **CIT 2026 admission enquiry form**
— the most important component on the page. It must capture admission-relevant
fields while keeping ALL existing submission, tracking, validation, and
duplicate-prevention plumbing working.

## Files to edit
- `src/components/common/UnifiedLeadForm/UnifiedLeadForm.jsx`
- `src/components/common/UnifiedLeadForm/UnifiedLeadForm.module.css` (only if
  styling changes are needed for the new fields)
- `src/utils/validators.js` (add a state/course validator if helpful — optional)

## Requirements
1. **Course dropdown** — replace `SERVICE_OPTIONS` (Hair Transplant, etc.) with
   the 7 B.E. branches from §3 + a final `"Not Sure — Need Guidance"`. Rename the
   field label/placeholder to "Course Interested In" and the select icon to an
   education icon (e.g. `mdi:school-outline`).
2. **State dropdown (new)** — add a required NE-states dropdown after course:
   Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Tripura,
   Sikkim, Other. Icon `mdi:map-marker-outline`. Wire it into form state,
   validation, error display, and the submitted payload.
3. **Field key plumbing** — keep the JSON key working end-to-end. Either keep
   `service_interest` but treat it as the course value, **or** rename to
   `course_interest` consistently here AND note it for prompts 05 & 23 (admin).
   Add `state` to the payload object built in `handleSubmit`.
4. **Copy changes:**
   - `getHeaderDefaults`: hero → "Apply for Direct B.E. Admission 2026" /
     "Get personal guidance from CIT's admission team"; contact → "Request a
     Callback" / "Our admission team will call you within 24 hours"; default →
     "Enquire About 2026 Admission" / "Fill the form — we'll guide you".
   - Submit button default → "Apply for 2026 Admission".
   - Trust badges → "100% Free Guidance", "Limited 2026 Seats", "NAAC Accredited"
     with suitable icons (`mdi:gift-outline`, `mdi:seat-outline`,
     `mdi:certificate-outline`).
   - Consent line → CIT version from §10; success alert → CIT version from §10.
   - Replace the phone-button number and the error-fallback phone with
     `+91 88673 54168`.
5. **Privacy Policy modal** — rewrite `PrivacyPolicyContent` for CIT / Assam
   Digital: education-admissions context, data collected (name, mobile, email,
   course, state), used to provide admission guidance & contact the applicant,
   shared with CIT admission office, contact = CIT email/phone (§2). Remove all
   Monjoven/medical text and `dr@monjoven.com`.
6. Keep the `showCourseFields` prop name working (it now gates the course+state
   block). Keep all GTM/Meta/Google-Ads/CAPI/enhanced-conversion calls and
   `navigate('/thank-you')` intact.

## Constraints
- Do NOT change submission logic, duplicate detection, or tracking calls.
- Keep the form to ~5-6 fields — do not bloat it.
- Mobile: dropdown menus must open above the drawer (keep the high zIndex).

## Acceptance criteria
- Form shows: Name, Mobile, Email, Course (7 B.E. + Not Sure), State (NE), Message.
- Submitting a valid form still navigates to `/thank-you` and the lead payload
  includes the selected course and state.
- No "service", "consultation", "Monjoven", or medical text remains in the file.
