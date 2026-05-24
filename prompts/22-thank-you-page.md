# 22 — Thank You Page

**Prerequisite:** Read `prompts/00-cit-master-reference.md`.

## Goal
Rebrand the post-submission Thank-You page to reassure the applicant and reinforce
next steps for CIT 2026 admission.

## Files to edit
- `src/pages/ThankYou/ThankYou.jsx`
- `src/pages/ThankYou/ThankYou.module.css` (colours/spacing)

## Requirements
1. **Headline** → "Thank You! Your 2026 Admission Enquiry is Received."
2. **Body** → "Our CIT admission team will call you shortly to guide you through
   the direct B.E. admission process for 2026." Use the applicant's name from
   `sessionStorage` (`lead_name`) if the existing code already does.
3. **Next steps (3 short points)** → e.g. keep your phone reachable; have your
   10th/12th marks handy; ask us about courses, hostel & fees.
4. **Contact reassurance** → primary phone `+91 88673 54168` (call) + WhatsApp;
   "or call us now if it's urgent".
5. **Back-to-home** button → CIT amber styling.
6. Keep the access guard (the page checks `lead_submitted` in sessionStorage) and
   any confetti/animation. Keep `robots: noindex` behaviour.
7. Remove all medical copy (Dr. Neog/consultation/appointment) and teal/orange.

## Constraints
- Don't change the session-guard logic or tracking that fires here (if any).

## Acceptance criteria
- Thank-you page is CIT-branded with admission next steps + contact.
- No medical/Monjoven copy; CIT colours applied.
