# Changelog

All notable changes to the Landing Page Boilerplate project.

## [Unreleased]

### `/apply` Step 5 — fee transparency, affordability and two ranked branches

The funnel asked how a family planned to pay before it had ever shown them a
number. A new final step closes that gap: the complete cost of the degree, then
the two questions that only mean something once it has been seen.

**Added**
- New `src/pages/Apply/steps/StepFeesBranches.jsx` — `/apply` becomes a **5-step**
  form, with "Fees & branch choice" appended after Logistics. It carries four
  blocks: an accordion of all 7 branches (year-wise tuition, 4-year tuition, total
  excluding hostel, total including hostel), a "Same for every branch" card for the
  three universal costs, the affordability question, and a two-branch ranked
  picker. Every figure is derived from `src/data/meritProgram.js` — nothing is
  hard-coded in the step, so a fee revision can never leave the form contradicting
  the rest of the site.
- `fee_affordability` (`'own_income'` | `'education_loan'`) — asked *after* the
  applicant has seen the real cost, which makes it a capability signal rather than
  the intention signal `funding_plan` (Step 3) already captures. Both are kept.
- `branch_pref_1` / `branch_pref_2` — exactly two distinct branches in order of
  preference, stored as the same em-dash course strings as `service_interest`.
  Preference 1 is pre-seeded from the Step-1 branch, first tap sets Preference 1,
  second sets Preference 2, a third is refused with a hint, and removing
  Preference 1 promotes Preference 2 into its place.
- Conditional education-loan panel, shown inline when the applicant answers
  `education_loan`: ~80% of the total study cost, the loan in the student's own
  name, repayment after the course from their own post-placement salary, and a
  worked B.E. ECE example (₹12,17,500 → ≈ ₹9,74,000 loan, ≈ ₹2,43,500 from the
  family, ≈ ₹12,600/month for 10 years at ~9.5% p.a.). The loan amount and EMI are
  computed, not typed, and the "indicative — the bank sets the final numbers"
  disclaimer sits in the panel rather than in a footnote.
- `fee_affordability`, `branch_pref_1` and `branch_pref_2` added to the
  `lead_field_whitelist()` in `public/api/leads.php` and to the canonical schema in
  `update-prompts/README.md`.

**Changed**
- Fee amounts are now allowed in exactly one place — `/apply` Step 5 and its loan
  panel. Every landing-page section still states no numbers; `CLAUDE.md` and
  `update-prompts/README.md` record the narrowed rule.
- `application_step_complete` for a finished application now reports
  `step: 5, step_name: 'fees_branches'` (was `4` / `'logistics'`). **A GTM trigger
  pinned to step 4 as "application finished" must be re-pointed.**
- Step 4's progress label "Almost done" → "Where & when" — with a step after it,
  the old label was untrue.
- Step 2 intro no longer claims eligibility is confirmed "instantly"; Step 3's
  reassurance now says the complete fee structure is shown on the final step of the
  form instead of promising it on a later call.
- `/apply` page title → "Apply — CIT Merit-Based Selection Program 2026".

Unchanged by design: the Step-1 partial payload and its `/step1-partial` source
suffix, the shared `lead_id` upsert, attribution fields, the honeypot, the retry
queue, and Steps 1–4. Drafts saved by the 4-step build rehydrate cleanly — the
three new keys layer in from the defaults.

### From an enquiry funnel to a high-intent application funnel

Meta was producing junk leads for a structural reason: it optimised on a
zero-friction `Lead` event and never received any quality feedback, the 5-field
enquiry form carried no qualification signal, the copy repeated "free" and fake
scarcity, and `?action=create` was public with no server-side validation. This
release addresses all four.

**High-Intent Application Funnel (New)**
- New full-page multi-step application at `/apply` — `src/pages/Apply/`
  (`Apply.jsx`, `fields.jsx`, `EligibilityBadge.jsx`, `preload.js`, and the four
  steps `StepIdentity`, `StepAcademics`, `StepFamilyFinance`, `StepLogistics`).
  Mobile-first at 360 px: only the active step is mounted, CSS-only transitions,
  no framer-motion / sweetalert2 / iconify on the route.
- Subject-marks entry with live eligibility computation
  ((Physics + Maths + best other) / 3) via `src/utils/applicationValidators.js`,
  surfaced by `EligibilityBadge`.
- Step-1 partial capture — completing Step 1 immediately writes a
  `lead_tier: 'partial'` lead, so a mid-form abandoner is still workable. The
  final submit re-posts the same `lead_id` and upgrades it to
  `lead_tier: 'application'` (`src/utils/applicationSubmit.js`).
- sessionStorage drafts plus a localStorage retry queue, so a dropped Jio
  connection never costs an applicant their answers or loses a completed
  application.
- `src/hooks/useApplyCTA.js` — the one CTA handler on the site: warms the
  `/apply` chunk on `pointerdown`, fires `cta_click`, and stashes the CTA key so
  each lead records which CTA produced it.
- Every CTA re-pointed to `/apply` (Header, Hero, CTASection,
  SecondaryCTASection, ContactSection, LocationSection, ServicesSection,
  FeaturesSection, WhyChooseCIT, MobileNavigation, MobileDrawer).
- New content sections: `FeesFundingSection` (transparency promise, no
  numbers), `AdmissionProcessSection`, `EligibilityStrip`, `FAQSection` with
  FAQ schema, and `TestimonialsSection` behind an `isLive` flag.
- Hero reworked from an embedded enquiry form into an application pitch card.

**Tracking Fixes**
- `SubmitApplication` added as a distinct Meta event for completed applications
  (`metaPixel.js`, `metaCAPI.js`, `meta-capi.php` whitelist) — pixel and CAPI
  share one `event_id` so the pair deduplicates.
- Fixed phone hashing for Meta/Google: numbers are now normalised to E.164
  (`91` + subscriber digits) before SHA-256 (`metaCAPI.js`,
  `enhancedConversions.js`). Previously hashed in a format Meta could not match.
- Fixed the Google Ads offline-conversion export, which filtered on a
  `'converted'` status that does not exist in `leadStatus.js` and therefore
  exported 0 rows forever — it now filters on the canonical `completed` key
  (`src/admin/utils/googleAdsExport.js`).
- Fixed the course → dataLayer key mismatch in `trackFormSubmission`, which was
  silently sending an empty `investmentInterest` (`src/utils/gtm.js`).
- New `src/utils/attribution.js` — first-touch persistence of `utm_*`, `gclid`,
  `fbclid`, `fbp` and `fbc`, so a visitor who lands on `/` with ad parameters and
  only then navigates to `/apply` keeps full attribution on the lead.
- Unicode-safe name validation, so applicants with non-ASCII names are no longer
  rejected.

**Lead API Hardening** (`public/api/leads.php`)
- Server-side field whitelist and length caps — unknown keys are dropped.
- Honeypot (`website`), read before the whitelist strips it and never stored.
- Time-trap on `submitted_at − form_started_at` (`LEADS_MIN_FORM_SECONDS`).
- Suspicious-number flagging (repeated-digit and straight-sequence mobiles).
- Sliding-window per-IP rate limiting (`LEADS_RATE_LIMIT_MAX` / `_WINDOW`),
  failing open on I/O trouble so infrastructure hiccups never drop real leads.
- Anti-bot rejections respond exactly like a success, so a bot learns nothing;
  flagged payloads are stored as `lead_tier: 'spam'` instead of being lost.
- Upsert by `lead_id` and silent duplicate merge by `mobile` — a re-submitter is
  a hot lead, not an error. The old `duplicate` response flag is gone; it was a
  public enumeration vector for stored phone numbers.
- Removed the committed fallback admin key from `leads.php` **and**
  `telecalls.php`. Both now answer `503` until `ADMIN_API_KEY` is configured —
  a default key that ships in the repository cannot gate anything.

**Admin Qualification Data**
- Lead detail regrouped into Academic Details / Family & Funding / Logistics
  with the full application payload rendered (`src/admin/pages/LeadDetail.jsx`).
- Lead quality score and lead-tier badges (`src/admin/utils/leadQuality.js`);
  partial leads are visually distinct and filterable.
- New list columns and filters (tier, eligibility, intake year, funding plan)
  plus updated search and CSV export (`LeadManagement.jsx`, `leadService.js`),
  covered by `src/admin/utils/__tests__/csvRoundTrip.test.js`.
- Dashboard counts split by lead tier.

**Meta Quality Feedback Loop**
- New `public/api/capi-feedback.php` — a shared server-side CAPI sender included
  by both stores. Telecaller verdicts now flow back to Meta: `contacted` / `hot`
  → `QualifiedLead`, `completed` / `seat_booked` → `Purchase` with
  `currency: INR` and a value from `CONVERSION_VALUE_ADMISSION`.
- Events fire only on a genuine status transition; `event_id` is
  `"{event}_{recordId}"` so retries deduplicate; `action_source` is
  `system_generated`.
- `user_data` is hashed server-side from the stored record only — never the
  admin's cookies, IP or user agent. The event is about the applicant, not the
  telecaller looking at it.
- Fire-and-forget with a 3s timeout after the HTTP response is flushed, so a
  slow or unreachable Meta can never block or fail an admin save. Failures land
  in `public/api/data/capi-feedback.log`; missing credentials are a silent no-op.
- New `src/utils/contactTracking.js` — `trackContactClick(channel, source)`
  fires GTM `phone_click`/`whatsapp_click`, the Meta Pixel `Contact` event and
  the Google Ads call conversion from one call site. The Meta and Google legs
  previously existed as dead code with zero callers; phone and WhatsApp taps
  were an invisible side door out of the funnel. Now wired at every `tel:` and
  WhatsApp surface (Header, Footer, MobileNavigation, MobileDrawer, Hero,
  WhyChooseCIT, CTASection, SecondaryCTASection, ContactSection, LocationSection,
  FAQSection, ThankYou and the `/apply` submit-error banner).
- `MetaAdsGuide` rewritten as a campaign playbook for this funnel: the
  three-tier optimisation-event model, the students 17-24 / parents 35-55 ad-set
  split across the 8 NE states, manual placements excluding Audience Network,
  eligibility-led creative guidance, quality-seeded lookalikes and Step-1-partial
  retargeting, an Events Manager verification walkthrough, and an operator
  launch checklist.
- New `LAUNCH_NOTES.md` — pre-launch operator runbook (rotate the admin key,
  configure Meta credentials and `CONVERSION_VALUE_ADMISSION`, supply real
  testimonials and recruiter logos, weekly Google offline-conversion upload).

**Removed**
- Placeholder recruiter logos. The wall rendered machine-generated
  `placehold.co` images, which read as a broken page to a parent choosing a
  college. It now renders name chips, and an image can only appear by adding
  licensed artwork to `RECRUITER_LOGOS` in `StatsSection.jsx`.
- The "PG & Research" block from `ContactSection.jsx` — the campaign sells B.E.
  2026 admission, and PG copy pulled traffic off that offer.
- Drawer reachability. `openLeadDrawer()` now has zero call sites, so the short
  enquiry form is no longer reachable from anywhere. `LeadFormDrawer`,
  `UnifiedLeadForm`, `ModalContext` and `webhookSubmit.js` stay in the repo
  untouched.
- "Free counselling" angles and fabricated scarcity from public copy.

### Server-side leads as the single source of truth (cross-device sync fix)

**Fixed**
- Leads now sync correctly across every browser and device. The public form
  writes each submission directly to the shared server store
  (`public/api/leads.php`), and the admin panel reads/writes only the server
  (auto-refreshing every 15s). Previously leads were kept in per-browser
  `localStorage` and never reliably reached the server, so the admin panel
  showed different data on different devices.
- `webhookSubmit.js` now `POST`s straight to `/api/leads.php?action=create`
  and reports honest success/failure; the lead is no longer stored only in the
  submitting browser.
- Duplicate prevention is now server-side (by mobile number), so it works
  across devices instead of per-browser.

**Removed**
- **Pabbly Connect** integration entirely — webhook URL, `USE_PABBLY` /
  `DUMMY_MODE` flags, the admin Pabbly mirror (`REACT_APP_ADMIN_PABBLY_WEBHOOK_URL`),
  `adminConfig.js`, the Pabbly setup guide tab, and `PABBLY_GUIDE.md`.
- All `localStorage` use for lead data (`lp_submitted_leads` / `lp_test_leads`).
  Per-device essentials (admin login session, theme preference, Google Ads
  gclid attribution) still use `localStorage` by design.

**Notes**
- Meta Pixel / CAPI and Google Ads tracking are kept (env-driven, IDs blank —
  ready for CIT's own Pixel/Ads IDs). No third-party/other-client IDs remain.
- Added a "Lead Storage" tab to the admin Guideline page documenting the new
  architecture.

## [1.0.0] - 2026-04-01

### Converted from Brand-Specific to Generic Boilerplate

**Content & Branding**
- Replaced all brand-specific text (company names, taglines, descriptions) with generic placeholder content
- Replaced all product images with `placehold.co` placeholder images
- Replaced all logo references with placeholder logo URLs
- Updated all contact info to generic `+91-XXXXXXXXXX` / `info@yourbusiness.com` patterns
- Updated all social media links to empty/placeholder values

**Data Files Renamed & Genericized**
- `servicesData.js` — Generic service/plan card data
- `serviceDetailsData.js` — Generic detailed service information
- `featuresData.js` — Generic feature categories and items
- `statsData.js` — Generic statistics/highlights
- `locationData.js` — Generic location and contact data

**Admin Panel (New)**
- Built admin authentication system with login page at `/admin/login`
- Created admin dashboard at `/admin/dashboard` with lead analytics
- Created admin layout with sidebar navigation and topbar
- Protected routes require authentication via `ProtectedRoute` component
- Admin credentials configurable via `.env` variables

**Lead Management System — LMS (New)**
- Built full-featured Lead Management page at `/admin/lms`
- Lead table with search, filter by status, sort, and pagination
- Status management (New, Contacted, Qualified, Converted, Lost)
- Notes system for adding per-lead notes
- CSV export functionality for offline use
- Google Ads offline conversion export format
- Conversion tracking data (mark as converted with value)
- Leads stored in localStorage (easily replaceable with backend API)

**GTM Integration (New)**
- Integrated Google Tag Manager with `initGTM()` utility
- Created `useGTMTracking` hook for automatic page-level tracking
- DataLayer events: `page_view`, `cta_click`, `generate_lead`, `scroll_depth`, `section_view`
- Engagement tracking via `EngagementTracker` component
- Google Consent Mode v2 support via `consentMode.js`
- Created `GTM_GUIDE.md` documentation

**Meta Conversions API — CAPI (New)**
- Browser-side Meta Pixel tracking via `metaPixel.js`
- Server-side CAPI endpoint at `public/api/meta-capi.php`
- Event deduplication via `eventDedup.js` (shared event IDs between browser & server)
- Test Event Code support for debugging in Meta Events Manager

**Google Ads Conversion Tracking (New)**
- Browser-side gtag.js conversion tracking via `googleAds.js`
- GCLID capture and persistent storage via `gclidManager.js`
- Enhanced conversions support via `enhancedConversions.js`
- Offline conversion import CSV export via `googleAdsExport.js`

**SEO System (New)**
- Dynamic SEO head management via `SEOHead` component
- Configurable schemas in `src/config/seo.js`
- JSON-LD structured data: Organization, LocalBusiness, FAQPage, BreadcrumbList, WebPage
- Proper meta tags, Open Graph, Twitter Cards in `index.html`
- `robots.txt` with admin route exclusions
- `sitemap.xml` template
- Created `SEO_GUIDE.md` documentation

**Webhook & Form System**
- Pabbly Connect webhook integration in `webhookSubmit.js`
- Dummy mode for local testing without webhook
- Lead duplicate prevention
- Multiple form sources tracked (hero, contact, drawer, secondary CTA)
- UTM parameter capture and GCLID enrichment
- Created `PABBLY_GUIDE.md` documentation

**Infrastructure & Performance**
- React 18 with concurrent features and lazy loading
- Idle-time section preloading via `requestIdleCallback`
- Error boundaries per section
- Web Vitals monitoring
- CSS Modules for component-scoped styles
- CSS custom properties in `variables.css`
- Responsive design with mobile-first approach
- PWA manifest and service worker support

**Files Added**
- `src/admin/` — Complete admin panel (components, pages, context, utils)
- `src/components/common/SEO/SEOHead.jsx` — Dynamic SEO management
- `src/components/common/EngagementTracker/EngagementTracker.jsx` — Analytics tracker
- `src/components/common/LeadFormDrawer/` — Slide-in lead form drawer
- `src/config/seo.js` — SEO configuration
- `src/hooks/useGTMTracking.js` — GTM tracking hook
- `src/utils/gtm.js` — GTM initialization
- `src/utils/consentMode.js` — Google Consent Mode
- `src/utils/metaPixel.js` — Meta Pixel helpers
- `src/utils/metaCAPI.js` — Meta CAPI client
- `src/utils/googleAds.js` — Google Ads tracking
- `src/utils/gclidManager.js` — GCLID persistence
- `src/utils/enhancedConversions.js` — Enhanced conversions
- `src/utils/eventDedup.js` — Event deduplication
- `public/api/meta-capi.php` — Server-side CAPI endpoint
- `public/api/google-offline-conversions.php` — Offline conversions endpoint
- `public/api/config.example.php` — API config template
- `PABBLY_GUIDE.md` — Pabbly webhook setup guide
- `GTM_GUIDE.md` — Google Tag Manager setup guide
- `SEO_GUIDE.md` — SEO configuration guide
- `CUSTOMIZATION_GUIDE.md` — Quick-start customization guide
- `CHANGELOG.md` — This file

**Dependencies Added**
- `canvas-confetti` — Thank You page confetti animation
- `react-router-dom` v7 — Client-side routing
- `react-intersection-observer` — Scroll-triggered animations
- `sweetalert2` + `sweetalert2-react-content` — Success/error modals
- `swiper` — Mobile carousels
- `@iconify/react` — MDI icon system
- `@mui/lab` — MUI experimental components
- `web-vitals` — Performance monitoring
