# 06 — Meta Quality Feedback Loop, Contact Tracking, Guides & Docs

**Prerequisite:** prompts 01–05 completed. Read `update-prompts/README.md`.

## Goal

Close the loop that fixes junk leads structurally: telecaller quality verdicts
(Hot / Seat Booked) flow back to Meta automatically as server-side conversion
events so the algorithm learns what a good lead is; phone/WhatsApp clicks stop
being an invisible side-door; and the operator documentation matches the new
funnel. Ends with a full QA checklist.

## Files to edit

- `public/api/leads.php` — status-transition → CAPI hook
- `public/api/telecalls.php` — same hook for telecalling statuses
- `public/api/meta-capi.php` — whitelist `QualifiedLead`; shared sender reuse
- **NEW** `public/api/capi-feedback.php` — shared server-side CAPI sender (included by both stores)
- `src/utils/gtm.js` + phone/WhatsApp CTA call sites — `Contact` event wiring
- `src/utils/metaPixel.js` — use the existing (currently dead) contact helper
- `src/admin/pages/guidelineContent/MetaAdsGuide.jsx` — campaign playbook rewrite
- `CLAUDE.md`, `CHANGELOG.md`, `update-prompts/README.md` (mark series complete)

## Requirements

### 1. Server-side quality feedback (`capi-feedback.php`, included from both stores)

1. Implement `send_capi_feedback($lead, $eventName, $value = null)`: builds a
   Meta CAPI event using the credentials already configured for
   `meta-capi.php` (`config.php`: `META_PIXEL_ID`, `META_ACCESS_TOKEN`,
   `META_API_VERSION`); silently no-ops when unconfigured. Event payload:
   - `event_name`, `event_time` (now), `action_source: 'system_generated'`.
   - `event_id`: `"{$eventName}_{$lead['lead_id']}"` — deterministic, so
     retries dedupe.
   - `event_source_url`: the lead's stored `page_url`.
   - `user_data`: SHA-256 hashes computed **server-side** from the lead's stored
     fields — `ph` (E.164: `'91' . mobile`), `em` (lowercased email when
     present), `fn`/`ln` (name split), plus `external_id` = `lead_id`, and raw
     `fbp`/`fbc` when stored on the lead. Never use the admin's request
     cookies/IP/user-agent — this event is about the applicant, not the admin.
   - Fire-and-forget with a 3-second cURL timeout; log failures to
     `api/data/capi-feedback.log`; NEVER fail the admin update because CAPI
     failed.
2. In `leads.php`'s `update` action, after a successful merge, when
   `patch['status']` CHANGED the stored status:
   - to `contacted` (the "Hot" stage) → `send_capi_feedback($lead, 'QualifiedLead')`.
   - to `completed` (seat booked/admitted) → `send_capi_feedback($lead,
     'Purchase', <value>)` with `currency: 'INR'` and `value` from
     `config.php` constant `CONVERSION_VALUE_ADMISSION` (default 50000 —
     document that the operator should set the real first-year revenue value;
     this number is internal, never rendered on the page).
   - Fire only on genuine transitions (compare old vs new status) so repeated
     saves don't re-send (the deterministic `event_id` is the second guard).
3. `telecalls.php`: same hook on its own status vocabulary — `hot` →
   `QualifiedLead`, `seat_booked` → `Purchase` (map from
   `src/admin/utils/telecallStatus.js` keys; telecall records store mobile/name
   directly). Skip silently when a record lacks a valid 10-digit Indian mobile
   (telecall entries allow loose formats).
4. `meta-capi.php`: add `QualifiedLead` to the supported-events whitelist
   (`SubmitApplication` was added in prompt 02).

### 2. Phone & WhatsApp click tracking (the untracked side-door)

1. `src/utils/metaPixel.js` has a contact-event helper with zero call sites.
   Create a tiny shared util `src/utils/contactTracking.js` exporting
   `trackContactClick(channel, source)` that fires: GTM `phone_click` /
   `whatsapp_click` (already defined in `gtm.js`), the Meta Pixel `Contact`
   event, and the Google Ads phone-conversion helper (`trackPhoneConversion` in
   `src/utils/googleAds.js` — currently dead code; document in MetaAdsGuide
   that it needs a separate call-conversion action configured in Google Ads).
2. Wire `trackContactClick` on every `tel:` and WhatsApp link:
   `grep -rn "tel:+918069645014\|wa.me\|whatsapp" src/components src/pages --include="*.jsx"`
   — Header, Footer, MobileNavigation, MobileDrawer, HeroSection, WhyChooseCIT,
   CTASection, SecondaryCTASection, ContactSection, LocationSection, ThankYou,
   and the `/apply` error banner. Attach without altering any protected
   component's mechanics (onClick handlers on links are content, not
   mechanics).

### 3. `MetaAdsGuide.jsx` rewrite (campaign playbook for the new funnel)

Update the guide content (keep the component's structure/style):
1. **Optimization events:** explain the three-tier signal — `Lead` (any capture,
   incl. Step-1 partials), `SubmitApplication` (completed application — switch
   ad-set optimization to this once it exceeds ~50 events/month),
   `QualifiedLead`/`Purchase` (server-side telecaller verdicts — use for value
   optimization and reporting truth).
2. **Audiences:** replace the "25-55 for most businesses" boilerplate with the
   admissions split — Ad set A: students 17–24, Instagram-heavy; Ad set B:
   parents 35–55, Facebook Feed; both geo-targeted to the 8 NE states.
3. **Placements:** manual — FB Feed + IG Feed/Stories/Reels; exclude Audience
   Network until junk is verifiably under control.
4. **Creative guidance:** lead with eligibility check, transparent-fees promise
   ("no consultancy or agent fees" — never amounts), NE hostel/community,
   placements; retire every "free counselling" angle. Destination URL =
   landing page with UTMs (existing convention), CTA "Apply Now".
5. **Custom audiences:** build from Hot/`QualifiedLead` leads → 1% lookalike;
   exclude `not_interested`. Retarget Step-1 partials with a "finish your
   application" creative.
6. **Verification section:** how to confirm `SubmitApplication` (browser+server,
   deduped) and `QualifiedLead`/`Purchase` (server, `system_generated`) in
   Events Manager, incl. the test-event-code flow. Add a prominent note: the
   code-level pixel requires `REACT_APP_META_PIXEL_ID` to be set — if the pixel
   currently runs only via GTM, CAPI dedup is NOT active until this is
   configured.

### 4. Documentation

1. **`CLAUDE.md`:** update to the new architecture — `/apply` multi-step
   application form is the sole public capture surface (drawer retained but
   unreachable); document the canonical new-field schema location
   (`update-prompts/README.md`), the lead-tier concept, the quality feedback
   loop, and the hardened `leads.php` behavior. Update the DO-NOT-MODIFY list:
   keep `webhookSubmit.js`, `swalHelper.js`, drawer/modal mechanics; ADD
   `src/utils/applicationSubmit.js` payload contract, `/apply` step order, and
   `capi-feedback.php` event names.
2. **`CHANGELOG.md`:** add an `## [Unreleased]` entry in the house style (bold
   thematic groups, exact files) covering prompts 01–06: "High-Intent
   Application Funnel (New)", "Tracking Fixes", "Lead API Hardening", "Admin
   Qualification Data", "Meta Quality Feedback Loop", "Removed" (placeholder
   recruiter logos, PG block, drawer reachability).
3. Operator runbook (inside MetaAdsGuide or a short `LAUNCH_NOTES.md`): rotate
   `ADMIN_API_KEY` + `REACT_APP_LEADS_ADMIN_KEY` (old values are compromised —
   they were committed), set Meta pixel/CAPI credentials in `config.php`, set
   `CONVERSION_VALUE_ADMISSION`, provide real testimonials
   (`testimonialsData.js` → `isLive: true`) and recruiter logos, upload the
   (now non-empty) Google offline-conversion CSV weekly.

### 5. Final QA sweep (perform and report)

1. `npm run build` clean; every acceptance criterion from prompts 01–05
   re-verified (run their grep checks).
2. Funnel smoke test: ad-style URL with UTMs+fbclid → land → CTA → `/apply` →
   Step 1 partial visible in admin → full completion → same lead upgraded →
   ThankYou reached → mark `contacted` in admin → `QualifiedLead` attempt in
   `capi-feedback.log` (or clean no-op without config).
3. 360 px pass on: home, `/apply` all steps, thank-you, admin list/detail.
4. Grep sweeps: no `placehold.co` in StatsSection; no reachable
   `openLeadDrawer`; ≤1 "free"-style claim; exactly one scarcity instance; no
   fee amounts (`₹` absent from all public sections except none expected).
5. Report results as a checklist with any deviations.

## Constraints

- DO NOT modify `webhookSubmit.js`, `UnifiedLeadForm.jsx`, `LeadFormDrawer.jsx`,
  `ModalContext.jsx`, `swalHelper.js`, `leadStatus.js` status keys, or
  `telecallStatus.js` status keys.
- CAPI feedback must never block or fail an admin save, and must never send the
  admin's own browser identifiers.
- `php -l` must pass on every touched PHP file; no new npm dependencies.

## Acceptance criteria

- [ ] `grep -n "QualifiedLead\|Purchase" public/api/leads.php public/api/telecalls.php public/api/capi-feedback.php` → transition hooks present in both stores, sender shared.
- [ ] `grep -n "system_generated" public/api/capi-feedback.php` → present; `grep -n "HTTP_\|REMOTE_ADDR" public/api/capi-feedback.php` → admin request data never enters `user_data`.
- [ ] `grep -rn "trackContactClick" src/ --include="*.jsx" | wc -l` → ≥ 10 call sites (all tel:/WhatsApp surfaces).
- [ ] `grep -n "25-55" src/admin/pages/guidelineContent/MetaAdsGuide.jsx` → no matches; `grep -n "Audience Network" …` → exclusion documented.
- [ ] `grep -n "apply" CLAUDE.md` → new architecture documented; CHANGELOG has the Unreleased entry.
- [ ] Full QA checklist from §5 executed and reported.
