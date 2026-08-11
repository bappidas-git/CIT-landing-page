# Changelog

All notable changes to the Landing Page Boilerplate project.

## [Unreleased]

### Added — first-visit admission notice popup

A visitor who has spent **10 seconds** on the landing page now gets one
admission notice: Session 2026 is closing, and `TOTAL_SEATS_LEFT` seats remain
across all seven B.E. branches. Its CTA goes to `/apply` like every other CTA on
the site. Skip it and it never comes back.

New `src/components/common/AdmissionNoticeModal/`, mounted inside
`HomePageContent` in `App.jsx` — landing page only, so it can never interrupt
`/apply`, `/thank-you` or a running merit test.

- **The 10 seconds are *visible* seconds.** The timer accrues only while
  `document.hidden` is false and resumes where it left off, so a page opened in
  a background tab has not been "stayed on" and does not burn the countdown.
- **One skip is final.** Closing it — X, "Not now", Escape or a backdrop tap —
  writes `cit_admission_notice_dismissed` to **localStorage**, not
  sessionStorage: "should not appear for that student again" means across
  visits, not just across this tab. Acting on the CTA retires it too, so an
  applicant returning to the page is not told about closing admissions again.
  A visitor who already applied this session (`lead_login_key` /
  `lead_submitted`) never arms the timer at all.
- **Seat count is derived, never typed.** `TOTAL_SEATS_LEFT` and `SESSION_LABEL`
  come from `src/data/meritProgram.js`, so the notice cannot drift from the
  seven branch cards. No fee figures — the landing-page fee rule holds.
- **Dependency-free and eagerly mounted.** No framer-motion, iconify or MUI:
  CSS-module animation and one inline SVG. It is imported eagerly on purpose —
  a lazy chunk still in flight on a budget Android could lose the race with its
  own 10-second timer — and that is only affordable because it weighs almost
  nothing.
- **Accessible:** `role="dialog"` + `aria-modal`, labelled and described,
  focus moved in and restored on close, a Tab focus trap, Escape to close, and
  a body scroll lock that saves and restores the previous value rather than
  blanking it (the mobile drawer sets it too).
- **Attribution:** the CTA runs through `useApplyCTA('admission-notice')`, so
  the lead's `source` becomes `admission-notice/step1-partial` and
  `admission-notice/full` — popup leads are separable from hero leads in
  reporting.
- **Tracking:** one new GTM event, `admission_notice`, via
  `trackAdmissionNotice()` in `src/utils/gtm.js`. It carries
  `notice_action: 'view' | 'dismiss' | 'cta'` and, on a dismiss,
  `dismiss_method`. No PII. **The GTM container owner needs one new trigger.**

Both invisible contracts — the visible-time countdown and the permanence of a
skip — are pinned by `AdmissionNoticeModal/__tests__/admissionNotice.test.js`
(`npm test`). Neither shows up in the rendered output, so a plain `setTimeout`
or a `sessionStorage` swap would look correct on screen while quietly re-nagging
students who already said no.

### Changed — the page now sells to all of India, not only the North East

The campaign is going live across every Indian state (Karnataka and Tumkur
itself included) plus Nepal and Bhutan, so copy that addressed North East
students as the only audience no longer fits. Every such surface was rewritten,
and the city is now written **Tumkur** throughout.

Landing-page copy:

- **Hero** — dropped *"This is CIT Tumkur, Karnataka — not CIT Kokrajhar,
  Assam."* The disambiguation only made sense to an Assamese reader; to everyone
  else it introduced a college they had never heard of. `.locationClarifier`
  went with it.
- **Why Choose CIT** — the "far from home" answer now reads *"…for students from
  across India, including the North East."* Inclusive rather than exclusive: the
  North East is still named, it just no longer defines the audience. The merit
  band's hostel bullet becomes *"Safe hostel & mess facilities for all students
  across India."*
- **Campus Life** — the tab is *Campus Life & Student Support* (was *& NE Student
  Support*), the heading *"A Safe, Supportive Home for Students From Across
  India"*, and the hostel card drops "North East students".
- **Location** — *"reachable by train, bus or flight from across India"*; the
  travel block is *"Coming from another state? We've got you covered."* and now
  also speaks to Tumkur/Karnataka locals and their day-scholar option; the
  "CIT North East admission desk" is simply the "CIT admission desk". The states
  band renders `locationData.servingRegions` — regions plus Nepal and Bhutan
  rather than eight state pills.
- **FAQ, testimonials, CTA bands, footer** — same treatment. The hostel FAQ adds
  the day-scholar option for nearby towns; sample testimonial states are now a
  pan-India mix.
- **SEO** — `Tumkur` is primary everywhere in titles, descriptions and JSON-LD;
  `cit tumakuru` stays in the keyword lists only, because people still type it.

Where the applicant lives (new `src/data/geoOptions.js`, the single source):

- **`/apply` Step 4 gains a Country control** — India (default) · Nepal · Bhutan
  · Other. The state field follows it: 36 Indian states and union territories,
  Nepal's 7 provinces, Bhutan's 20 dzongkhags, or a free-text box under *Other*,
  with the label switching between state / province / dzongkhag. Changing
  country clears the chosen state so a Bhutan dzongkhag can never ship on an
  Indian application. *"Your district / town"* is relabelled *"Your city /
  town"* (the stored key stays `district`).
- **`country` is a new lead field** — added to `applicationSubmit.js`, to
  `lead_field_whitelist()` in `leads.php`, to the admin Lead Detail *Logistics*
  card, to lead search, and to the CSV export/import round trip (covered by a
  test). The canonical schema in `update-prompts/README.md` is updated.
- **The enquiry drawer** (`UnifiedLeadForm`, still unreachable) gets the same
  country + state pair, so if it is ever re-enabled it cannot capture a lead the
  admin panel would misread.
- **Tele-calling** now offers the same geography: `TELECALL_STATE_OPTIONS`
  re-exports `TELECALL_REGION_OPTIONS` — one flat list, since a telecaller
  typing a lead by hand should not have to pick a country first.
- **12th board options** were North East boards plus CBSE/ICSE, which forced a
  Tumkur applicant to answer "Other". Added `CBSE`/`ICSE`/`NIOS`/`KAR_PUC`
  ordering with **Karnataka PUC (KSEAB)**; existing values are untouched and
  `BOARD_LABELS` was kept in step so the CSV still round-trips.
- **`counselling_mode: 'ne_rep'`** keeps its stored value; only the label
  widened, to *"Meet CIT's representative near me"*.

Admin ad guides (Meta / Google / SEO) were re-pointed too: geo-targeting advice
now covers all of India — with Karnataka and Tumkur worth their own ad set,
since a local applicant converts on a different message — plus Nepal and Bhutan.

### Fixed — the ₹12,500 Extra Fees is one-time, not yearly

Step 5 of `/apply` billed the ₹12,500 Extra Fees (Skill & Cultural activities
etc.) as `₹12,500/year`, and `branchTotals()` multiplied it across all four
years. It is a **one-time charge, paid once at admission in the 1st year** —
exactly like the ₹1,07,500 Admission Fee sitting next to it. Every 4-year total
on the page was therefore ₹37,500 too high.

`EXTRA_FEES_PER_YEAR` is renamed **`EXTRA_FEES_ONE_TIME`** in
`src/data/meritProgram.js` (the name is what made the mistake easy to write),
`branchTotals()` now counts it once, and the "Same for every branch" card drops
the `/year` suffix and carries the same note as the Admission Fee row:
*"One-time, payable in the 1st year at admission — Skill & Cultural activities
etc."* Only Hostel (₹65,000) remains a per-year charge in that card.

Corrected 4-year totals (tuition | excl. hostel | incl. hostel):

| Branch | 4-yr tuition | Excl. hostel | Incl. hostel |
|---|---|---|---|
| CSE | ₹12,50,000 | ₹13,70,000 | ₹16,30,000 |
| AI & DS | ₹12,00,000 | ₹13,20,000 | ₹15,80,000 |
| ISE | ₹10,25,000 | ₹11,45,000 | ₹14,05,000 |
| ECE | ₹8,00,000 | ₹9,20,000 | ₹11,80,000 |
| EEE | ₹4,00,000 | ₹5,20,000 | ₹7,80,000 |
| Civil | ₹3,45,000 | ₹4,65,000 | ₹7,25,000 |
| Mech | ₹3,45,000 | ₹4,65,000 | ₹7,25,000 |

The education-loan panel derives from `branchTotals()`, so it re-rendered on its
own: the B.E. ECE worked example is now ₹11,80,000 total → ≈ ₹9,44,000 loan (80%)
→ ≈ ₹2,36,000 from the family, ≈ ₹12,200/month for 10 years at ~9.5% p.a. No
figure is hard-coded in the step, so this was a one-file data fix plus the label.

Landing-page copy is untouched: `FeesFundingSection` and the FAQ name *"tuition,
admission fee, extra fees and hostel"* as categories without amounts or
periodicity, which stays correct and keeps fee numbers on Step 5 only. The
`new-refinement-prompts/` archive keeps the old figures — it records what was
specified at the time, not what the form charges now.

### Changed — the admissions number is now +91 84536 23233

Every call and WhatsApp surface moves off `+91 8069645014`. The number lives in
too many places to hold in one constant today, so all of them were swapped
together: `locationData.js` (`phone` / `phoneDisplay` / `whatsapp`),
`SUPPORT_PHONE` in `applicationSubmit.js` (which feeds the `/apply` and `/test`
support lines and `PostTestScreen`), `CONTACT_PHONE` in `contactTracking.js`
(the number reported to Google Ads as the call-conversion target), the Footer,
MobileDrawer and MobileNavigation constants, the FAQ support line, `/thank-you`,
both `/apply` and drawer privacy overlays, `seoConfig.organization.phone`, both
JSON-LD `telephone` values in `public/index.html`, and
`REACT_APP_SALES_PHONE` / `REACT_APP_WHATSAPP_NUMBER` in `.env` + `.env.example`.

Display strings pick up the new 5-5 grouping (`+91 84536 23233`); `tel:` hrefs,
`wa.me` / `api.whatsapp.com` links and the Google Ads value stay unspaced E.164
(`+918453623233` / `918453623233`). The `tel:` builders that derive from the
display constant — `SUPPORT_PHONE.replace(/[^\d+]/g, '')` on `/apply`, `/test`
and `PostTestScreen` — strip the new interior space, so they still emit
`tel:+918453623233`.

Historical `CHANGELOG` entries and the `prompts/` archives keep the old number:
they record what the page was at the time, not what it dials now.

### Fixed — the footer's accents were painted in its own background colour

`--accent-gold` was remapped to CIT navy `#0C2D48` during the rebrand, and the
footer's background is `--primary-dark`, the *same* `#0C2D48`. Everything the
footer accented with it rendered invisible:

- **Quick Links vanished on hover** (`.footerLink:hover`) — the reported bug.
  Hover is now full white, up from `rgba(255,255,255,.65)` at rest.
- The **Call chip** disappeared on hover the same way (`.contactChipCall:hover`).
- **Column rules** under *Quick Links* / *Admissions Contact* and the **contact
  icons** never showed at all, and the missing icons are what made the contact
  block look misaligned — the icon still occupied its inline space.
- **Focus rings** on `.footerLink` / `.legalLink` were invisible, and so was the
  privacy modal's header rule.

Fixed with two footer-scoped tokens (`--footer-accent`,
`--footer-accent-strong`) rather than by touching the global palette, where
navy-on-light is correct. The privacy modal is portalled to `document.body` and
cannot inherit them, so its rule names `--accent-amber` directly.

### Changed — Contact, Location and the closing band lose their side exits

- **Contact / Admissions** — the *Get Admission Details* form is gone.
  `UnifiedLeadForm` is untouched and still mounted in the drawer; it simply has
  no second mount point, which is what "`/apply` is the sole public
  lead-capture surface" already said. The three contact cards now span the
  section on a self-sizing `auto-fit` grid — three across, two on tablet, one
  at 360px — so the `1fr 1fr` and `max-width: 600px` breakpoint rules that
  existed to fit them into a half-width column are gone. The subtitle no longer
  offers to take the visitor's details.
- **Location** — the two bottom CTAs (*Request a Callback*, *Call …*) are
  replaced by one *Apply for the Merit Assessment Test*, which is what the
  callback button already did behind the scenes. The gap under "Proudly
  welcoming students from across North East India" moves to a wrapper class:
  MUI's `margin: 0` for Typography is injected after this stylesheet and was
  silently winning the tie, so the heading sat on top of the state pills.
- **Mid-page CTA band** — the *Call +91 8069645014* button beside *Start My
  Application* is removed.
- **Closing band** — the *WhatsApp Us* button, the phone link and the
  illustration are removed. With the image gone the two-column split had
  nothing to balance, so the band is now one centred `max 760px` column at
  every width, with the ticks left-aligned inside it. The tablet/mobile
  overrides that used to re-centre it are no longer needed.

**GTM container owner:** four more `cta_click` values stop firing —
`primary_cta_call`, `secondary_cta_whatsapp`, `secondary_cta_call` and
`why_cit_call` — along with the `phone` / `whatsapp` contact legs from
`mid_page_cta`, `secondary_cta` and `location_cta`. The Location CTA now
reports `apply_apply-now` with `cta_location: 'location'`; it previously
reported `apply_request-callback`, so a trigger pinned to that value needs
re-pointing. Nothing was renamed.

### Changed — the top of the funnel points at the application, not the phone

Three phone CTAs sat above the fold, each offering a caller-shaped exit from a
page whose entire job is to start an application. They are gone, and the
five-step selection story now runs directly under the hero that promises it.

**Phone CTAs removed** (the number is unchanged everywhere else — Contact,
FAQ, Location, Footer, and the mobile bottom-nav / drawer Call actions all
still carry it):
- `Header.jsx` — the desktop `+91 8069645014` pill beside *Apply Now*, and the
  matching call row at the foot of the mobile menu, so the header offers one
  action at every breakpoint. `PRIMARY_PHONE`, its display constant and the
  `trackContactClick` import are gone with them; the mobile *Apply Now* icon
  now uses `.applyButtonIcon` rather than borrowing the call button's class.
- `HeroSection.jsx` — the outlined *Call +91 8069645014* button beside the
  primary CTA. The `hero_secondary_cta` `cta_click` and the `phone` leg of
  `trackContactClick` no longer fire from the hero.
- `WhyChooseCIT.jsx` — the *Or call …* link under *Start My Application* in the
  Merit Promise card, and with it `handleCallClick` / the `why_cit_call`
  `cta_click`. The card is a flex column with a gap, so it closes up on its own.

**Section order** — `AdmissionProcessSection` ("How the Selection Works") moves
from sixth to first below the hero, ahead of `AboutSection`. The hero promises a
30-minute merit test; the next thing on the page now explains it instead of
making the visitor read three sections first. The idle-preload list in
`App.jsx` is reordered to match, so the first section below the fold is also
the first one warmed after `/apply`.

**Branch-wise accordion removed** — the `<details>` strip under *Last 3 Years —
Placement Record* in `StatsSection.jsx`, plus its `.branch*` rules. The
three-year table and the source footnote are untouched. `BRANCH_PLACEMENTS`
stays in `src/data/placementsData.js`, now flagged as unrendered: the figures
are verified and worth keeping sourced.

**GTM container owner:** `header_desktop`, `header_mobile_menu`, `hero` and
`why_choose_cit` no longer appear as the `source` on `phone_click` /
`Contact` events, and the `why_cit_call` and `hero_secondary_cta` `cta_click`
values stop firing. Nothing was renamed — these sources simply have no call
site left, so any report or audience segmented on them will trend to zero
rather than break.

### Fixed — counselling slots are offered only in office hours

The post-test picker drew its chips from the clock alone: an applicant who
finished at 11:40 PM was offered *12:00 – 1:00 AM*, *1:00 – 2:00 AM* and the
rest of the night, and could book a call nobody was ever going to make. The
counselling desk works **10:00 AM – 7:00 PM IST, every day of the week**, so
the 24-hour booking window is now intersected with that day.

**`public/api/test.php`**
- Three new fixed constants — `CIT_TEST_SLOT_TZ_OFFSET_SECONDS` (IST,
  UTC+05:30), `CIT_TEST_SLOT_FIRST_HOUR` (10) and `CIT_TEST_SLOT_LAST_HOUR`
  (18, the last hour a call may *start* in) — mirrored in `PostTestScreen.jsx`
  and documented as a pair that must be changed together.
- `slot_is_office_hour()` replaces the old any-quarter-hour test inside
  `validate_counselling_slot()`. The hour must now be an **exact IST hour
  boundary** (`:30` past in UTC) **and** inside 10:00–19:00 IST. The
  quarter-hour rule existed to accept any timezone's hour boundary; that is too
  loose now the appointment goes into an IST diary. Everything else about the
  endpoint is untouched: the 24-hour window, the 5-minute past-grace,
  write-once, the `parse_client_iso` shape check that keeps `strtotime()` from
  accepting `tomorrow`, and the `Counselling slot booked` activity string.
- The hours are enforced **server-side in IST**, so a phone left on another
  timezone cannot book 10 AM local — the middle of the night in Tumakuru.

**`src/pages/Test/PostTestScreen.jsx`**
- `buildSlots()` filters to office hours and now steps IST hour boundaries,
  returning epoch ms rather than `Date` objects.
- The time layer is anchored to the fixed IST offset instead of the device's
  timezone, and formatted by hand rather than through `toLocaleTimeString`.
  `timeZone: 'Asia/Kolkata'` would have said it exactly, but budget Android
  WebViews ship without the timezone data to honour it and fail *silently* —
  printing device-local time under an IST label is the one outcome worse than
  an ugly string. Slots are always whole hours, so there is little to build:
  the old `splitTime` Intl round-trip and its am/pm-casing repair are gone.
- Copy: the notice now states the office hours ("Our Counselling Officers call
  between **10:00 AM and 7:00 PM**, every day of the week"), and the
  window-closed branch says when the team will ring instead.

No migration. Slots booked under the old rule stay exactly as stored — nothing
re-validates them, and the admin panel renders them as before.

**Verified** — the picker was exercised at every 10-minute completion time
across four dates (including month-end, year-end and a leap day): every chip
lands in 10:00–18:00 IST, inside the 24-hour window, on an IST hour boundary,
and the list is **never empty — 9 hours at every completion time**, because any
24-hour window spans a whole office day. Identical output under `TZ=UTC`,
`Asia/Kolkata`, `Asia/Kathmandu` (+05:45) and `America/New_York`. `book_slot`
was driven over HTTP against a live `php -S`: it accepts IST hours 10–18 and
refuses 19–09, refuses quarter/half-past the hour, still refuses `tomorrow`,
`+2 hours`, `midnight` and offset-bearing timestamps, still refuses the past
and beyond-24h, and every chip the client drew was accepted by the server.

### Admin panel — merit test, counselling slots and the two telecaller queues

Four prompts' worth of new lead fields (`login_key`, the `test_*` block,
`counselling_slot`, `fee_affordability`, `branch_pref_1/2`) were being written
server-side and read by nobody. They are now visible and, more to the point,
**workable**: the panel answers the two questions the team asks all day — *who
still owes us a paper*, and *who am I calling next and when*.

Everything is additive and gated on presence. A lead that predates the merit
program carries none of these fields and renders exactly as it did before —
verified against a legacy enquiry lead in the QA run below.

**Added — `src/admin/utils/leadQuality.js`** (still the single source for labels)
- `AFFORDABILITY_LABELS` (`Own income` / `Needs loan`) and
  `AFFORDABILITY_LONG_LABELS` (the applicant's own two sentences from Step 5).
- `TEST_STATUS_OPTIONS` chip configs — `Not Started` (grey) · `In Progress`
  (amber) · `Completed` (green) — with `getTestStatusConfig()`.
- `getTestStatus(lead)` resolves `completed` / `in_progress` from
  `lead.test_status`, falls back to `not_started` **only when the lead holds a
  login key**, and otherwise returns `null`. A legacy lead was never asked to
  sit the paper, so it shows nothing rather than being branded a no-show — the
  same reasoning that keeps unscored leads out of the quality bands.
- `getTestSortValue()`, `formatSlot()` (`Sat 10 Aug, 4:00 PM`, built from
  `formatToParts` so separators and AM/PM casing cannot drift with the browser's
  ICU build), `formatScore()` (`84/120`), `describeSlotTiming()`
  (`in 3 hours` / `overdue`), `hasSelectionData()`, and `shortBranch()` +
  `BRANCH_SHORT_LABELS` derived from `MERIT_BRANCHES` so the short names can
  never contradict the fee table.

**Added — Lead Management (`LeadManagement.jsx`)**
- Five columns after Quality: **Key** (monospace, click-to-copy),
  **Test** (status chip, plus the score inline once completed), **Call Slot**,
  and — tablet-hidden, like Eligibility and Funding — **Affordability** and
  **Pref Branches** (`CSE → ECE`). Header, body cells and the mobile card were
  all updated together, as the file's own note demands.
- Sorting for `test_status` (state, then score), `counselling_slot` (epoch,
  unbooked last) and `fee_affordability`. `test_status` joins
  `DESC_FIRST_COLUMNS`; `counselling_slot` deliberately does not, because the
  next call belongs at the top. Ties inside the slot column break on score
  descending — that is the entire ordering of the counselling queue's tail.
- Two filters, **Test** and **Affordability**, applied in the same client-side
  chain as tier/quality/intake/funding.
- **Two telecaller queue presets**, grouped with Refresh (and in the mobile
  overflow menu):
  - **Push-to-test queue** — apply-funnel leads holding a key whose paper is not
    finished, newest first. Call, re-share the key, get them to attempt it.
  - **Counselling queue** — finished papers by booked hour, next call on top;
    applicants who never chose a slot fall to the bottom, best score first.
  A preset is a saved position of the existing filter/sort state plus one extra
  predicate in the same filter chain — no parallel pipeline, so the table can
  never disagree with the chips. Touching any filter by hand drops the badge.
- `getLeads()` search now also matches `login_key`, case-insensitively and with
  or without the `CIT26-` prefix — how an applicant reads it back on a call.

**Added — Lead Detail (`LeadDetail.jsx`)**
- A **Merit Test & Selection** card before Academic Details, gated on
  `hasSelectionData`. The booked hour leads the card in a highlight box
  (green, red when overdue, amber "No slot chosen — fix a time on the call" when
  a finished applicant never picked one) because it is the only thing on the
  page with a deadline. Then the login key with a Copy button, the status chip,
  `84/120` with `Maths 44/60 · Physics 40/60` and `Correct 21 · Wrong 6 ·
  Blank 3`, both timestamps, the affordability sentence, and the two ranked
  branch choices in full.
- `test_qualified` renders as a Qualified / Below-cutoff chip **only** when the
  field exists — it is written solely when `TEST_QUALIFY_CUTOFF` is configured,
  and an absent field means "not decided", never "rejected".

**Added — CSV + Dashboard**
- 14 export columns after `FBCLID`: `Login Key`, `Test Status`, `Test Score`,
  `Maths Score`, `Physics Score`, `Correct`, `Wrong`, `Blank`, `Test Started`,
  `Test Completed`, `Counselling Slot`, `Affordability`, `Branch Pref 1`,
  `Branch Pref 2`. Timestamps and `test_status` go out raw so a re-import lands
  the same values; affordability round-trips through its label.
- **Import restores these columns to the admin's view, but the server will not
  take them back.** `login_key` and every `test_*` field are absent from
  `lead_field_whitelist()` in `leads.php` by design, so `?action=create` strips
  them even from an admin-keyed import. Re-importing an export is for reporting
  and for rebuilding a local view — never for replaying test results into the
  store. (`fee_affordability` and the branch preferences *are* whitelisted and
  do persist.)
- `getLeadStats()` gains `testsCompleted` and `awaitingTest` (holds a key, has
  not finished), both spam-excluded; the Dashboard renders them as a card pair.
  `awaitingTest` is exactly the push-to-test queue, so the two agree by
  construction.

**Verified** — `csvRoundTrip.test.js` covers a lead carrying the full new field
set, the "never sat the test" case and a legitimate zero score; suite green,
`npm run build` clean.

### Post-test tele-counselling slot booking

Finishing the paper is no longer the end of the funnel. The applicant now
leaves `/test` with an appointment: the hour in which CIT's Counselling Officer
will call them, chosen by them, inside the 24 hours after they submitted — and
written onto the lead so the officer calls at exactly that time.

Still no score anywhere. Every applicant reads the same conditional sentence
("**if** you qualify"), because the cutoff is the admission team's to apply.

**Added — `public/api/test.php`**
- `POST ?action=book_slot` — `{ key, slot }`, where `slot` is an ISO UTC
  timestamp for the start of an hour. Persists `counselling_slot` on the
  attempt, then stamps the same value on the lead through `patch_lead()` with
  the fixed activity entry `Counselling slot booked`. Answers
  `{"success": true, "slot": "<iso>"}`.
- **Write-once from the student side.** A second booking answers
  `{"success": true, "already_booked": true, "slot": "<stored iso>"}` and leaves
  the original untouched — by then the officer has the appointment in their day,
  so a change is a conversation with the telecaller, not a form. The admin panel
  can still edit `counselling_slot` on the lead directly.
- **The window is re-derived server-side; the browser's chip list is
  convenience, never the authority.** A slot must parse as a UTC ISO timestamp,
  sit on an hour boundary, fall inside `completed_at … completed_at + 24h`, and
  not already be in the past (5 minutes of slack for a phone clock that runs
  fast). Anything else → `{"success": false, "error": "invalid_slot"}`. Booking
  before the paper is finished → `not_completed`.
- The shape check runs **before** parsing, because `strtotime()` happily accepts
  `tomorrow` and `+2 hours` — a lax parse would let a client name any instant it
  liked where a timestamp belongs.
- "On the hour" is checked as a quarter-hour boundary in UTC. An hour boundary
  in the applicant's local time is not one in UTC — IST is UTC+05:30, so 4:00 PM
  in Tumakuru is `10:30Z` — and every real UTC offset is a whole number of
  quarter-hours, so this accepts every genuine hour start while still refusing
  arbitrary instants.
- Completed responses from `login`, `start`, `state` and `answer` now also carry
  `completed_at` (the post-test screen measures its 24-hour window from it) plus
  `slot_booked`, and `slot` once one is booked, so an applicant who logs back in
  sees their confirmed appointment instead of a picker that could only overwrite
  it. Still no score, no answers, no pass/fail.
- Helpers: `parse_client_iso()`, `validate_counselling_slot()`, `attempt_slot()`.

**Added — `src/pages/Test/PostTestScreen.jsx`**
- Replaces the completion placeholder. Header, the conditional qualification
  sentence, and an hourly picker: 24 chips grouped `Today` / `Tomorrow`, each
  reading as the hour it covers (`4:00 – 5:00 PM`), radio semantics, 44 px
  targets, two across at 360 px and three from 600 px.
- Confirmed state — also what a returning applicant lands on — states the
  appointment in full and adds the prep checklist: **10th & 12th marksheets**,
  **parents present**, **phone reachable, about 15 minutes**.
- Honest about the clock: chips whose hour has passed drop off a minute-ticking
  refresh, a selection that expires clears itself, and an `invalid_slot` from the
  server redraws the list and asks for another pick rather than dead-ending.
  When the 24 hours have run out entirely the screen says so and hands off to
  the phone — never an empty picker.
- Phone + WhatsApp on every branch, through
  `trackContactClick('phone'|'whatsapp', 'test_post')`.
- GTM: `counselling_slot_booked`, fired once and carrying **nothing** — no key,
  no name, no slot time.

**Changed**
- `src/pages/Test/TestEngine.jsx` passes the completion payload to
  `onCompleted(data)`, so the post-test screen gets `completed_at` without
  spending a second round-trip on it.
- `src/pages/Test/Test.jsx` drops `SubmittedScreen` / `CompletedScreen` for the
  one `PostTestScreen`; both ways in (straight off the last question, or a later
  login with a used key) land on the same screen.
- `src/pages/Test/fields.jsx` adds the icons the screen needs
  (`IconCalendarClock`, `IconCalendarCheck`, `IconDocument`, `IconFamily`,
  `IconPhone`, `IconWhatsApp`) — inline SVG paths, no iconify.

**GTM container owner:** `counselling_slot_booked` is a new event and needs a
trigger. It carries no parameters at all.

### Test engine — random 15+15 paper, 60-second clock, server-side scoring

The paper is now real. An applicant who accepts the terms gets 30 questions
drawn for them alone, one per screen, on a clock that belongs to the server —
and a score that never travels back to their browser.

**Added — `public/api/test.php`**
- `POST ?action=start` — `{ key, tnc_accepted: true }`. Draws 15 random
  Mathematics + 15 random Physics qids from the 120-question bank, merges and
  shuffles the 30, persists the attempt and serves question 1. **One attempt per
  key, for life:** a second `start` resumes the existing attempt instead of
  drawing a second paper. Stamps the lead `test_status: 'in_progress'` +
  `test_started_at` and appends the activity entry `Merit test started`.
- `POST ?action=state` — the resume path. Finalises anything that ran out of
  time while the applicant was away, then serves the current question with its
  **true** remaining seconds. A refresh mid-question lands on the same question,
  not a fresh minute.
- `POST ?action=answer` — `{ key, index, selected: 0-3 | null }`. Records the
  choice, advances, and scores the paper on the 30th finalisation. A stale
  `index` answers `{"success": false, "error": "out_of_sync"}` **plus the
  current serving payload**, which is both the client's re-sync path and the
  whole of the no-going-back rule: an old index can never overwrite an answer.
- The timing model, exact because prompt 09 and the admin panel read it: a
  question's 60-second clock starts at its **first** serving (`first_served_at`,
  never re-stamped on resume); an answer is accepted while
  `now − first_served_at ≤ 60 + 15` (`CIT_TEST_GRACE_SECONDS`, slack for slow
  networks and invisible to the client); serving returns
  `remaining_seconds = clamp(60 − elapsed, 0, 60)`. **Auto-advance is
  server-authoritative** — `advance_attempt()` finalises every overdue question
  (`selected: null, timed_out: true`) before anything else happens, so a student
  who shut the laptop on question 7 does not find question 7 waiting.
- Server-side scoring: +4 correct, 0 wrong, 0 blank, max 120. No negative
  marking, so a guess never costs anything. Correctness is derived from the bank
  against the stored option index — the attempts file never held an answer key.
  Persists `score`, per-subject splits and correct/wrong/blank counts, then
  stamps the lead with `test_status: 'completed'`, `test_score`,
  `test_maths_score`, `test_physics_score`, `test_correct_count`,
  `test_wrong_count`, `test_blank_count`, `test_completed_at` and the fixed
  activity entry `Merit test completed — scored` (no marks in the timeline — it
  gets read out to applicants over the phone).
- Optional `TEST_QUALIFY_CUTOFF` (documented commented-out in
  `config.example.php`): when set, a completed attempt also gets
  `test_qualified: true|false`. Unset — the default — means no automatic
  verdict and a human decides, which is not the same as a stored `false`.
  Nothing student-visible branches on it either way.
- Helpers: `with_attempts_locked()` (one `flock(LOCK_EX)` read-modify-write per
  request; `patch_lead()` runs *after* the lock releases so only one file is
  ever held), `question_bank_index()`, `draw_question_ids()`, `new_attempt()`,
  `advance_attempt()`, `serve_current_question()`, `score_attempt()`,
  `attempt_index_by_key()`, `attempt_is_complete()`, `question_is_final()`,
  `iso_to_epoch()`.

**Added — `src/pages/Test/TestEngine.jsx`**
- One question per screen: sticky question counter + subject tag + countdown
  (tabular figures, reserved width, no sideways twitch), a `scaleX`-only timer
  bar, the question in `pre-wrap` (the bank's Unicode notation is plain text),
  four 48 px radio-semantic option buttons, and Next — disabled until an option
  is chosen. No back control anywhere, plus a `beforeunload` courtesy confirm.
- The countdown is **deadline-based**, not tick-counted, so a backgrounded tab
  or a throttled timer still hits zero at the right moment. At zero it posts a
  blank and asks for the next question — it never scores anything.
- Last 10 seconds: colour shift plus a polite `aria-live` announcement (silent
  before that, so it does not drown out the question).
- `out_of_sync` re-syncs silently; a dropped connection shows a retry banner
  that says honestly that *the question timer keeps running*, and Retry re-sends
  exactly what failed.
- GTM: `merit_test_start` (on a start the server actually honoured) and
  `merit_test_complete`, both carrying only `test_state` — never the key, the
  name or any other PII.

**Changed**
- `attempt_question_index()` now skips timed-out questions too (a blank keeps
  `selected: null` forever, and would otherwise be reported as the resume point).
- `test_parameters()` reads the new `CIT_TEST_*` constants instead of repeating
  the numbers.
- `/test` gains a `done` screen — *"Test submitted. Evaluation in progress."* —
  distinct from the already-used-key screen. Prompt 09 replaces it with slot
  booking.

**Security**
- Serving payloads carry the option **text** only: no `answer`, no qid, no
  `topic` / `difficulty`, and never the full question list. The completion
  response is identical for every applicant — no score, no pass/fail.
- `start` / `state` / `answer` resolve the applicant from the key alone and
  charge the login rate-limit budget **only when the key fails to resolve** — a
  running test makes ~30 calls, and CGNAT would otherwise lock out a whole
  district mid-paper.
- The `test_*` fields are absent from `lead_field_whitelist()` in `leads.php`,
  so a bot POSTing `test_score: 120` to `?action=create` finds it stripped.
  Verified: zero bank strings in `build/static/`.

### Test platform foundation — `/test`, key login, instructions, T&C

The applicant now has somewhere to spend the key they were handed on
`/thank-you`. This is the scaffold the test engine mounts into: the route, the
login handshake and the two screens an applicant reads before committing to a
one-shot, no-going-back paper.

**Added**
- `public/api/test.php` — the merit-test API, a standalone sibling of
  `leads.php` / `telecalls.php` (same single-file `?action=` router,
  `flock(LOCK_EX)` writes, `now_iso()`, `merge_lead_array()`, sliding-window
  per-IP rate limiter, deny-all `data/` bootstrap, `Cache-Control: no-store`).
- `POST ?action=login` — takes `{ "key": "CIT26-XXXXX" }` and answers the
  attempt state that decides which screen `/test` shows: `not_started`,
  `in_progress` (plus `question_index`, the first unanswered question) or
  `completed` (plus `completed_at` and `slot_booked`). Every success carries
  `student_name` and the test-parameter block
  (`total` 30, `maths` 15, `physics` 15, `seconds_per_question` 60,
  `marks_correct` 4), which is what the instructions screen renders its numbers
  from — so the rules can never drift from the paper the engine serves.
- Helpers `find_lead_by_key()` (normalise → shape-check → scan `leads.json`),
  `patch_lead()` (internal server-side write-back: scalars last-write-wins,
  activity appended, `updated_at` bumped), `find_attempt_by_key()`,
  `attempt_question_index()`, `test_parameters()`, `respond_invalid_key()`.
- React route `/test` (`src/pages/Test/`) wired lazily in `App.jsx`:
  `Test.jsx` (login → instructions → tnc → engine → done state machine),
  `Test.module.css`, `fields.jsx` (route-local icons, the key mask and the two
  controls), `index.js` and `preload.js`.
- Login screen: one monospace, wide-tracked key field pre-filled from
  `sessionStorage.lead_login_key`, accepting the key typed or pasted with or
  without its `CIT26-` prefix, in any case, with or without separators. Failure
  offers the support number as a tracked `tel:` link.
- Instructions screen: the eight rules of the paper, and a **`Resume test`**
  primary button when the server reports an attempt already in progress.
- Terms & Conditions screen: seven plain-English clauses in a scrollable box,
  gated behind a 44 px checkbox — `Start Test` stays disabled until it is
  ticked, then hands `{ key, tnc_accepted: true }` to the engine.
- `REACT_APP_TEST_API_URL` (default `/api/test.php`) in `.env.example`.
- GTM: `merit_test_login` and `merit_test_instructions_view`, both carrying only
  `test_state` — never the key, the name or any other PII.

**Security**
- **The login key is the credential.** No admin key gates any student-facing
  action, and `test.php` never accepts a `lead_id` from the browser — a client
  that could name its own lead id could sit someone else's test. Every request
  resolves the applicant from the key alone.
- **One generic error.** A malformed key, an unknown key and a rate-limited
  request all answer `{"success": false, "error": "invalid_key"}` with HTTP 200,
  so the endpoint is not an oracle for which keys exist. Login is capped at
  **30 attempts per IP per hour** (`data/test_ratelimit.json`, fails open so a
  disk hiccup can never lock an applicant out).
- No login response carries questions, answers or scores, in any state.
- `?action=login` writes nothing: it is idempotent reconnaissance, so refreshing
  the login screen leaves no trace on the applicant's timeline.
- `patch_lead()` refuses to touch `notes` (the humans' column), `lead_id`,
  `submitted_at` and `login_key` — one lead keeps one key for life.
- `data/test_attempts.json` lives in the same deny-all `data/` folder as
  `leads.json`, and is keyed on the login key rather than the lead, so a
  re-issued lead record can never hand out a second attempt.
- `/test` is `noindex, nofollow` and deliberately absent from `sitemap.xml`;
  leaving the route restores `index, follow`.

**Notes**
- Route-bundle discipline matches `/apply`: no framer-motion, sweetalert2,
  iconify or MUI popovers on `/test`. Only the active screen is mounted, icons
  are inlined SVG paths, and the key field is 16 px+ so iOS does not zoom on
  focus. 360 px first, 44 px touch targets throughout.
- `action=start` / `answer` / `state` (test engine) and `action=book_slot` (slot
  booking) land in later updates. A commented stub in `test.php` marks the seam
  — extend that file rather than adding a second endpoint, because the login
  action, the attempt store and the key-is-the-credential rule are all there.

### MCQ question bank for the 30-Minute Online Merit Assessment Test

The merit test needs questions that actually discriminate, and answers that a
motivated applicant cannot read out of the page source. Both are settled here:
the bank is authored in full, and it lives in a PHP file that is executed rather
than served.

**Added**
- `public/api/question-bank.php` — **120 original MCQs**, 60 Mathematics
  (`M001`–`M060`) and 60 Physics (`P001`–`P060`), written fresh at Class-12 /
  engineering-entrance (JEE-Main / KCET) difficulty. Every question is solvable
  mentally or in two or three lines of rough work inside 60 seconds, which is
  what a 30-question / 30-minute paper demands.
- Row schema: `id`, `subject` (`maths` | `physics`), `topic` (lowercase slug),
  `difficulty` (`easy` | `medium` | `hard`), `q`, `options` (exactly 4 distinct
  non-empty strings), `answer` (int 0–3, index into `options`).
- Syllabus coverage follows the Class-12 weighting. **Maths:** relations &
  functions 4, inverse trigonometry 3, matrices 5, determinants 5, continuity &
  differentiability 6, applications of derivatives 6, integrals 7, applications
  of integrals 2, differential equations 4, vectors 5, 3-D geometry 4, linear
  programming 2, probability 7. **Physics:** electrostatics 7, current
  electricity 7, moving charges & magnetism 6, magnetism & matter 3,
  electromagnetic induction 5, alternating current 5, electromagnetic waves 2,
  ray optics 6, wave optics 4, dual nature of matter 4, atoms & nuclei 6,
  semiconductors 5.
- Difficulty mix of exactly **24 easy / 24 medium / 12 hard per subject**, and
  each answer index 0–3 is correct exactly **15 times per subject**, so the
  position of the correct option leaks nothing. Distractors are built from the
  common sign and formula errors for each question — no "all of the above", no
  "both A and B".

**Security**
- The bank is a **guarded PHP data file, not a JSON asset.** It opens with
  `if (!defined('CIT_TEST_INTERNAL')) { http_response_code(404); exit; }`, so a
  direct HTTP request returns a bare 404 with no body. A `.json` under `data/`
  would have depended on `.htaccess`, which Apache honours but a Cloudways nginx
  static-file layer can bypass; a `.php` file is executed, never served as
  source, on every PHP host.
- Correct answers are server-side only. The consuming endpoint defines
  `CIT_TEST_INTERNAL` before requiring the bank and strips `answer` (and
  optionally `topic` / `difficulty`) before anything is serialised to a browser.
  Nothing in `src/` references the file, so it can never reach a client bundle.

**Notes**
- Notation is plain text and Unicode only (`x²`, `√`, `π`, `θ`, `Ω`, `μ`, `°`,
  `×`, `·`, `−`, `≤`, `→`) — no LaTeX, no KaTeX, no HTML in any string — so the
  questions render with the existing stack and need no new dependency.
  Fractions are inline with explicit parentheses, matrices are row-listed as
  `[[a, b], [c, d]]`, vectors use `î, ĵ, k̂`, and every constant a student needs
  (`g`, `c`, `hc`, `μ₀`, `1/(4πε₀)`) is supplied inside the question.

### Unique test login keys + a Thank-You page that hands off to the test

An application is no longer the end of the funnel — it is the moment the
applicant is handed their credential for the merit test. The key is issued by
the server, so it cannot be guessed, forged or duplicated by anything the
browser sends.

**Added**
- Server-assigned **Test Login Keys** in `public/api/leads.php`. Format
  `CIT26-XXXXX`, 5 characters from a 32-char alphabet that excludes the
  ambiguous `0 O 1 I` so a telecaller can read one out over a bad line
  (~33.5M combinations). New helpers: `generate_login_key()`,
  `load_key_pool()` / `save_key_pool()`, `seed_key_pool_if_missing()`,
  `build_key_pool_entries()`, `assign_login_key()`, `ensure_login_key()`,
  `decoy_login_key()`, `is_key_eligible_lead()`.
- `public/api/data/login_keys.json` — the key ledger, seeded with 100 unassigned
  keys on first use and auto-extended by 50 whenever it runs dry, so a campaign
  that outruns the pool never costs a lead. Entries are
  `{ key, lead_id, assigned_at }`. It lives in the same deny-all `data/` folder
  as `leads.json` and is git-ignored.
- `?action=create` now answers `{"success": true, "login_key": "..."}`. A key is
  claimed only for apply-funnel leads (incoming `lead_tier` `partial` or
  `application`, untrusted requests only) — drawer enquiries, admin CSV imports
  and legacy creates never consume one.
- The assigned key is written onto the lead record with a
  `Test login key assigned` activity entry, so a telecaller can re-share it from
  the admin panel.
- `submitFullApplication()` returns the key and stashes it in sessionStorage
  (`lead_login_key`), alongside `lead_lead_id`. The Step-1 partial submit stashes
  it too, so the key is already on the device if the final response is lost
  mid-flight. Storage key names are exported as `THANKYOU_*_STORAGE` constants.
- `Cache-Control: no-store` on every `leads.php` response — lead data must never
  sit in a proxy or CDN cache.

**Changed**
- **`/thank-you` rebuilt around the key.** The applicant's key is the centerpiece
  (large monospace, tap-to-select readonly input, Copy button with a clipboard-API
  fallback for old Android), followed by the `Start Your 30-Minute Online Merit
  Assessment Test` CTA to `/test`, an `I'll take it later` link, the key-validity
  note, and a what-to-expect strip (30 MCQs · 60s per question · +4 per correct
  answer · no going back · one attempt). Trust badges now read NAAC / AICTE·VTU /
  Merit-Based Selection, and the WhatsApp prefill asks about the login key.
- The confetti celebration is gone. This is an exam handoff, not a party.
- Session flags: `lead_submitted` / `lead_name` still self-clear after 5 minutes,
  but `lead_login_key` deliberately survives — the `/test` login screen pre-fills
  from it.
- Anti-bot responses stay indistinguishable from success: the rate-limit discard
  and every spam path now answer with an **unpersisted decoy key**, so the create
  response is byte-shape identical whether a payload was stored, merged or
  silently dropped.

Unchanged by design: the field whitelist (`login_key` is deliberately *not* in
it, so a client-supplied value is dropped), honeypot, time-trap,
suspicious-number flagging, per-IP rate limiting, upsert/dedup semantics, admin
auth and the CAPI feedback hook. The Thank-You gate, its two dataLayer events and
its `noindex` handling are untouched.

Note: the `/test` route arrives in the next step of this series — until then the
Start-Test CTA points at a route that does not exist yet.

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
