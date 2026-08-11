import React from 'react';

const MetaAdsGuide = ({ styles }) => {
  return (
    <div>
      {/* Section 1: How Meta Ads works for this campaign */}
      <h2 className={styles.guideTitle}>How Meta Ads Works for CIT Admissions</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Meta Ads (Facebook + Instagram) shows your ad to people who match a targeting profile,
          rather than to people searching for you. For a Direct B.E. admissions campaign running across
          India, that is the right channel — students and parents are not searching "direct
          admission Karnataka", they are scrolling Reels and Feed.
        </p>
        <p className={styles.guideParagraph}>
          The single most important thing to understand: <strong>Meta optimises for whatever
          conversion event you feed it.</strong> If the only event it ever receives is a
          zero-friction form fill, it will get very good at finding people who fill forms and never
          answer the phone. That is exactly how the earlier junk-lead problem happened. The whole
          tracking setup below exists to send Meta better signals than "someone submitted a form".
        </p>
      </div>

      {/* Section 2: Which event to optimize for */}
      <h2 className={styles.guideTitle}>Which Event to Optimise For</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          The landing page now emits three tiers of conversion signal. They are not
          interchangeable — each one has a job.
        </p>
        <div className={styles.guideTableWrap}>
          <table className={styles.guideTable}>
            <thead className={styles.guideTableHead}>
              <tr>
                <th>Event</th>
                <th>Fires when</th>
                <th>Use it for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.guideTableCell}>
                  <code className={styles.guideInlineCode}>Lead</code>
                </td>
                <td className={styles.guideTableCell}>
                  Any capture — including a Step-1 partial on{' '}
                  <code className={styles.guideInlineCode}>/apply</code>, where the applicant gave
                  name + mobile and then abandoned.
                </td>
                <td className={styles.guideTableCell}>
                  Cold start only. Volume is high and quality is unverified, so it is the weakest
                  signal of the three. Do not leave ad sets here once you have alternatives.
                </td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  <code className={styles.guideInlineCode}>SubmitApplication</code>
                </td>
                <td className={styles.guideTableCell}>
                  The full multi-step application is completed — marks, parent contact, funding
                  plan, the lot. Never on a partial.
                </td>
                <td className={styles.guideTableCell}>
                  <strong>Switch ad-set optimisation to this once it exceeds roughly 50 events per
                  month.</strong> Below ~50/month Meta's learning phase cannot exit and delivery
                  stalls, so stay on <code className={styles.guideInlineCode}>Lead</code> until you
                  clear that bar.
                </td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  <code className={styles.guideInlineCode}>QualifiedLead</code> /{' '}
                  <code className={styles.guideInlineCode}>Purchase</code>
                </td>
                <td className={styles.guideTableCell}>
                  Server-side, from the admin panel: a telecaller marks a lead <strong>Hot</strong>{' '}
                  (<code className={styles.guideInlineCode}>QualifiedLead</code>) or{' '}
                  <strong>Seat Booked</strong> (<code className={styles.guideInlineCode}>Purchase</code>,
                  carrying a rupee value).
                </td>
                <td className={styles.guideTableCell}>
                  Value optimisation and <em>reporting truth</em>. This is the only signal that
                  reflects whether a lead was actually worth anything. Use it to judge which ad sets
                  and creatives to keep, even while optimising on something else.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.guideTip}>
          <strong>The quality feedback loop:</strong> every status change a telecaller makes in Lead
          Management or Tele-Calling is pushed straight back to Meta as a server event
          (<code className={styles.guideInlineCode}>public/api/capi-feedback.php</code>). Telecallers
          keeping statuses up to date is not admin hygiene — it is what teaches the algorithm which
          people to find next. A week of un-updated statuses is a week of Meta learning nothing.
        </div>
        <div className={styles.guideNote}>
          <strong>Set the admission value.</strong> The{' '}
          <code className={styles.guideInlineCode}>Purchase</code> event reports{' '}
          <code className={styles.guideInlineCode}>CONVERSION_VALUE_ADMISSION</code> from{' '}
          <code className={styles.guideInlineCode}>public/api/config.php</code>. It ships as a
          placeholder — replace it with the real first-year revenue of one admission so value
          optimisation ranks campaigns by money rather than lead count. This number is internal and
          is never shown on the public page.
        </div>
      </div>

      {/* Section 3: Create Meta Business Account */}
      <h2 className={styles.guideTitle}>Create Meta Business Account</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Go to <code className={styles.guideInlineCode}>https://business.facebook.com</code>
          </li>
          <li className={styles.guideStepItem}>Click "Create Account"</li>
          <li className={styles.guideStepItem}>
            Enter your business name, your name, and business email
          </li>
          <li className={styles.guideStepItem}>Follow the verification steps</li>
          <li className={styles.guideStepItem}>
            Once inside Business Suite, go to "All Tools" → "Events Manager"
          </li>
          <li className={styles.guideStepItem}>
            Click "Connect Data Sources" → "Web" → "Facebook Pixel"
            <ul>
              <li>Name your pixel (e.g., "CIT Admissions Landing Page Pixel")</li>
              <li>Click "Create Pixel"</li>
              <li>You'll see a Pixel ID (15-digit number) — copy it</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Section 4: Install the Pixel */}
      <h2 className={styles.guideTitle}>Install the Pixel on Your Landing Page</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Open your <code className={styles.guideInlineCode}>.env</code> file
          </li>
          <li className={styles.guideStepItem}>
            Set <code className={styles.guideInlineCode}>REACT_APP_META_PIXEL_ID=YOUR_15_DIGIT_PIXEL_ID</code>
          </li>
          <li className={styles.guideStepItem}>
            Set <code className={styles.guideInlineCode}>REACT_APP_ENABLE_ANALYTICS=true</code>
          </li>
          <li className={styles.guideStepItem}>
            Rebuild and redeploy (<code className={styles.guideInlineCode}>npm run build</code>) —{' '}
            <code className={styles.guideInlineCode}>REACT_APP_*</code> values are baked in at build
            time, so editing <code className={styles.guideInlineCode}>.env</code> on the server
            changes nothing until you rebuild.
          </li>
        </ol>
        <div className={styles.guideNoteWarning}>
          <strong>Important — read before trusting any dedup numbers.</strong> The code-level pixel
          only initialises when <code className={styles.guideInlineCode}>REACT_APP_META_PIXEL_ID</code>{' '}
          is set. If your pixel is currently firing only through the GTM container, then{' '}
          <code className={styles.guideInlineCode}>SubmitApplication</code>,{' '}
          <code className={styles.guideInlineCode}>Contact</code> and every shared{' '}
          <code className={styles.guideInlineCode}>event_id</code> in this codebase are NOT being
          sent from the browser — and <strong>CAPI deduplication is not active</strong>. Your server
          events will still arrive, but each one counts on its own with no browser twin to match.
          Set the env var and rebuild before reading any Events Manager comparison.
        </div>

        <h3 className={styles.guideSubtitle}>What the Pixel Tracks</h3>
        <div className={styles.guideTableWrap}>
          <table className={styles.guideTable}>
            <thead className={styles.guideTableHead}>
              <tr>
                <th>Event</th>
                <th>When It Fires</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.guideTableCell}>
                  <code className={styles.guideInlineCode}>PageView</code>
                </td>
                <td className={styles.guideTableCell}>Every page load</td>
                <td className={styles.guideTableCell}>Browser</td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  <code className={styles.guideInlineCode}>Lead</code>
                </td>
                <td className={styles.guideTableCell}>
                  Step-1 partial capture, and again on full completion
                </td>
                <td className={styles.guideTableCell}>Browser + Server (deduped)</td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  <code className={styles.guideInlineCode}>SubmitApplication</code>
                </td>
                <td className={styles.guideTableCell}>
                  Full application completed at <code className={styles.guideInlineCode}>/apply</code>
                </td>
                <td className={styles.guideTableCell}>Browser + Server (deduped)</td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  <code className={styles.guideInlineCode}>Contact</code>
                </td>
                <td className={styles.guideTableCell}>
                  Any phone or WhatsApp tap, anywhere on the site
                </td>
                <td className={styles.guideTableCell}>Browser</td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  <code className={styles.guideInlineCode}>QualifiedLead</code>
                </td>
                <td className={styles.guideTableCell}>Telecaller marks the lead Hot</td>
                <td className={styles.guideTableCell}>Server only</td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  <code className={styles.guideInlineCode}>Purchase</code>
                </td>
                <td className={styles.guideTableCell}>Telecaller marks the lead Seat Booked</td>
                <td className={styles.guideTableCell}>Server only</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.guideNote}>
          <strong>Contact events:</strong> phone and WhatsApp taps used to leave no trace at all —
          the visitor converted on a channel the page could not see. They now fire GTM, Meta{' '}
          <code className={styles.guideInlineCode}>Contact</code> and a Google Ads call conversion
          from one shared helper. The Google leg needs its own <em>call conversion action</em>{' '}
          created in Google Ads (Tools → Conversions → New → Phone calls) and its ID/label set in{' '}
          <code className={styles.guideInlineCode}>.env</code>; without that it stays a silent no-op
          while the Meta and GTM legs still work.
        </div>
      </div>

      {/* Section 5: Campaign structure */}
      <h2 className={styles.guideTitle}>Campaign Setup</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Go to <code className={styles.guideInlineCode}>https://adsmanager.facebook.com</code>{' '}
            and click "+ Create"
          </li>
          <li className={styles.guideStepItem}>
            Objective: <strong>Leads</strong>, with the conversion location set to{' '}
            <strong>Website</strong> — not Instant Forms. On-Facebook lead forms are exactly the
            zero-friction capture this funnel was rebuilt to get away from.
          </li>
          <li className={styles.guideStepItem}>
            Campaign name:{' '}
            <code className={styles.guideInlineCode}>
              CIT - B.E. 2026 Admission Leads - [Month] [Year]
            </code>
          </li>
          <li className={styles.guideStepItem}>Budget: start with ₹500-800/day, Daily Budget</li>
          <li className={styles.guideStepItem}>
            Conversion event: see "Which Event to Optimise For" above — start on{' '}
            <code className={styles.guideInlineCode}>Lead</code>, move to{' '}
            <code className={styles.guideInlineCode}>SubmitApplication</code> past ~50/month
          </li>
        </ol>

        <h3 className={styles.guideSubtitle}>Audiences — Run Two Ad Sets, Not One</h3>
        <p className={styles.guideParagraph}>
          Students and parents are two different buyers with two different objections, and they live
          on two different apps. Splitting them is worth more than any creative tweak.
        </p>
        <div className={styles.guideTableWrap}>
          <table className={styles.guideTable}>
            <thead className={styles.guideTableHead}>
              <tr>
                <th>Ad set</th>
                <th>Age</th>
                <th>Weighting</th>
                <th>Angle</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.guideTableCell}>
                  <strong>A — Students</strong>
                </td>
                <td className={styles.guideTableCell}>17-24</td>
                <td className={styles.guideTableCell}>Instagram-heavy (Feed, Stories, Reels)</td>
                <td className={styles.guideTableCell}>
                  Branch choice, campus and hostel life, placements, "check if you are eligible"
                </td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  <strong>B — Parents</strong>
                </td>
                <td className={styles.guideTableCell}>35-55</td>
                <td className={styles.guideTableCell}>Facebook Feed</td>
                <td className={styles.guideTableCell}>
                  Accreditation (NAAC / AICTE / VTU), transparent fee process, safety and campus
                  community, placement record
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.guideParagraph}>
          Geo-target both ad sets to the campaign’s geography: all of India — with Karnataka and
          Tumkur district worth their own ad set, since a local applicant converts on a very
          different message from an outstation one — plus Nepal and Bhutan. Keep interests broad
          at first; stacking narrow interests on top of a wide geography starves delivery. Split by
          region only once a region has enough conversions to learn from.
        </p>

        <h3 className={styles.guideSubtitle}>Placements — Manual, Not Advantage+</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Choose <strong>Manual placements</strong>.
          </li>
          <li className={styles.guideStepItem}>
            Select Facebook Feed, Instagram Feed, Instagram Stories and Instagram Reels.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Exclude Audience Network.</strong> It is the largest single source of accidental
            taps and mis-clicks in in-app banners and rewarded-video units, and those arrive looking
            exactly like cheap leads. Leave it off until junk is verifiably under control — that
            means <code className={styles.guideInlineCode}>QualifiedLead</code> rates holding steady
            in Events Manager for several weeks. Only then is it worth testing as its own ad set so
            you can judge it in isolation.
          </li>
        </ol>
        <div className={styles.guideNote}>
          Advantage+ Placements will quietly put you back on Audience Network. If you later turn it
          on to chase cheaper delivery, watch the Hot-to-lead ratio in Lead Management, not the
          cost per lead in Ads Manager.
        </div>

        <h3 className={styles.guideSubtitle}>Destination URL</h3>
        <p className={styles.guideParagraph}>
          Send traffic to the landing page (not straight to{' '}
          <code className={styles.guideInlineCode}>/apply</code>) so visitors get the eligibility,
          fees-process and placement context before the form. Keep the existing UTM convention, and
          set the ad CTA button to <strong>"Apply Now"</strong>.
        </p>
        <pre className={styles.guideCode}>
{`https://landing.cittumkur.org/?utm_source=facebook&utm_medium=paid&utm_campaign=cit_be_admissions_2026_ne&utm_content=students_reels_v1`}
        </pre>
        <p className={styles.guideParagraph}>
          Vary <code className={styles.guideInlineCode}>utm_content</code> per creative. The landing
          page persists UTMs and <code className={styles.guideInlineCode}>fbclid</code> across the
          navigation to <code className={styles.guideInlineCode}>/apply</code>, so whichever creative
          produced a Seat Booked is visible on the lead record in the admin panel.
        </p>
      </div>

      {/* Section 6: Creative */}
      <h2 className={styles.guideTitle}>Creative Guidance</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Creative decides who clicks, so it decides lead quality more than targeting does. Lead with
          a qualifier, not with an incentive.
        </p>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            <strong>Lead with the eligibility check.</strong> "Check if your 12th marks qualify you
            for Direct B.E. admission at CIT Tumkur" self-selects for people who actually have
            marks to enter. It is the highest-quality hook available.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Transparent fees, never amounts.</strong> Say "no capitation, no consultancy or
            agent fees — the full fee structure is shared on your first call". Do not put a number in
            an ad: it dates instantly, invites comparison shopping, and the page deliberately carries
            no figures.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Hostel and campus community.</strong> Separate hostels, students from every region
            of India on campus, travel and settling-in support. This is the parent objection,
            answered — and for Tumkur and nearby towns, the day-scholar option.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Placements.</strong> Recruiters and outcomes — use only verified, current
            information.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Retire every "free counselling" angle.</strong> "Free" attracts people
            optimising for free things, which is precisely the audience that never answers the
            second call. The offer is a place at an accredited college, not a free consultation. The
            same applies to countdown urgency and invented seat counts — if scarcity is stated
            anywhere it must be true.
          </li>
          <li className={styles.guideStepItem}>
            Use video and Reels-native vertical creative; static images under-deliver on IG
            placements. Write in the language the audience actually uses — Kannada for Karnataka,
            Assamese for Assam, Hindi across the north, English elsewhere — and refresh creative every 2-3 weeks for ad fatigue.
          </li>
        </ol>
      </div>

      {/* Section 7: Custom audiences */}
      <h2 className={styles.guideTitle}>Custom Audiences &amp; Retargeting</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            <strong>Seed a quality lookalike.</strong> Build a custom audience from your Hot /{' '}
            <code className={styles.guideInlineCode}>QualifiedLead</code> leads — either the{' '}
            <code className={styles.guideInlineCode}>QualifiedLead</code> website event, or a CSV of
            Hot leads exported from Lead Management — then create a <strong>1% lookalike</strong>{' '}
            from it, geo-limited to the regions the campaign actually sells in. A lookalike built from verified good leads is a
            completely different audience from one built on raw form fills.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Exclude the dead ends.</strong> Upload leads marked{' '}
            <code className={styles.guideInlineCode}>not_interested</code> as a custom audience and
            exclude it from every ad set. You are otherwise paying to re-reach people who already
            said no.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Retarget Step-1 partials.</strong> Anyone who fired{' '}
            <code className={styles.guideInlineCode}>Lead</code> but not{' '}
            <code className={styles.guideInlineCode}>SubmitApplication</code> started the application
            and dropped out. Retarget that segment with a "finish your application" creative — they
            already typed their name and number, so the ask is small and the intent is proven. Cap
            frequency and give it its own small budget.
          </li>
          <li className={styles.guideStepItem}>
            Also retarget page viewers who never fired any conversion event, with the eligibility-check
            creative rather than a generic reminder.
          </li>
        </ol>
      </div>

      {/* Section 8: CAPI setup */}
      <h2 className={styles.guideTitle}>Set Up Conversions API (CAPI)</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Browser tracking is blocked by ad blockers and iOS settings; CAPI sends events from the
          server, so they arrive regardless. It is also the only way{' '}
          <code className={styles.guideInlineCode}>QualifiedLead</code> and{' '}
          <code className={styles.guideInlineCode}>Purchase</code> can exist at all — those happen in
          the admin panel days after the visitor left, when there is no browser to fire anything.
        </p>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            On the hosting server, go to <code className={styles.guideInlineCode}>public/api/</code>
          </li>
          <li className={styles.guideStepItem}>
            Copy <code className={styles.guideInlineCode}>config.example.php</code> to{' '}
            <code className={styles.guideInlineCode}>config.php</code>
          </li>
          <li className={styles.guideStepItem}>
            Open <code className={styles.guideInlineCode}>config.php</code> and fill in:
            <ul>
              <li>
                <code className={styles.guideInlineCode}>META_PIXEL_ID</code> — your 15-digit Pixel
                ID (same as in <code className={styles.guideInlineCode}>.env</code>)
              </li>
              <li>
                <code className={styles.guideInlineCode}>META_ACCESS_TOKEN</code> — Events Manager →
                Settings → Conversions API → "Generate Access Token"
              </li>
              <li>
                <code className={styles.guideInlineCode}>META_API_VERSION</code> — leave as{' '}
                <code className={styles.guideInlineCode}>v19.0</code>
              </li>
              <li>
                <code className={styles.guideInlineCode}>META_TEST_EVENT_CODE</code> — Events Manager
                → Test Events tab (blank in production)
              </li>
              <li>
                <code className={styles.guideInlineCode}>CONVERSION_VALUE_ADMISSION</code> — the real
                first-year revenue of one admission
              </li>
              <li>
                <code className={styles.guideInlineCode}>ADMIN_API_KEY</code> — a fresh long random
                string; see the launch checklist below
              </li>
            </ul>
          </li>
          <li className={styles.guideStepItem}>
            In <code className={styles.guideInlineCode}>.env</code>, set{' '}
            <code className={styles.guideInlineCode}>REACT_APP_META_CAPI_ENDPOINT=/api/meta-capi.php</code>{' '}
            and rebuild
          </li>
          <li className={styles.guideStepItem}>Deploy, then run the verification below</li>
        </ol>
        <div className={styles.guideNote}>
          <strong>Note:</strong> CAPI needs a server that can run PHP. On static hosting (Netlify,
          Vercel) neither the shared lead store nor the quality feedback loop works. If Meta
          credentials are missing, <code className={styles.guideInlineCode}>capi-feedback.php</code>{' '}
          does nothing at all — status changes save normally, they just teach Meta nothing.
        </div>
      </div>

      {/* Section 9: Verification */}
      <h2 className={styles.guideTitle}>Verifying Events in Events Manager</h2>
      <div className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Test-event flow</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Events Manager → your pixel → <strong>Test Events</strong> tab. Copy the test event code.
          </li>
          <li className={styles.guideStepItem}>
            Put the same value in both places:{' '}
            <code className={styles.guideInlineCode}>META_TEST_EVENT_CODE</code> in{' '}
            <code className={styles.guideInlineCode}>config.php</code> (server) and{' '}
            <code className={styles.guideInlineCode}>REACT_APP_META_TEST_EVENT_CODE</code> in{' '}
            <code className={styles.guideInlineCode}>.env</code> (browser, needs a rebuild).
          </li>
          <li className={styles.guideStepItem}>
            Keep the Test Events tab open while you walk the funnel in another tab.
          </li>
        </ol>

        <h3 className={styles.guideSubtitle}>
          Confirming <code className={styles.guideInlineCode}>SubmitApplication</code>
        </h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Complete a full test application at <code className={styles.guideInlineCode}>/apply</code>{' '}
            through to the thank-you page.
          </li>
          <li className={styles.guideStepItem}>
            In Test Events you should see <strong>two</strong>{' '}
            <code className={styles.guideInlineCode}>SubmitApplication</code> rows — one{' '}
            <em>Browser</em>, one <em>Server</em> — sharing one{' '}
            <code className={styles.guideInlineCode}>event_id</code>, flagged as deduplicated.
          </li>
          <li className={styles.guideStepItem}>
            Only a Server row and no Browser row means the code-level pixel is not initialised — go
            back and set <code className={styles.guideInlineCode}>REACT_APP_META_PIXEL_ID</code>,
            then rebuild. Until then there is nothing to deduplicate against.
          </li>
        </ol>

        <h3 className={styles.guideSubtitle}>
          Confirming <code className={styles.guideInlineCode}>QualifiedLead</code> /{' '}
          <code className={styles.guideInlineCode}>Purchase</code>
        </h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Open that test lead in Lead Management and change its status to <strong>Hot</strong>.
          </li>
          <li className={styles.guideStepItem}>
            Within a few seconds a <code className={styles.guideInlineCode}>QualifiedLead</code> row
            appears with source <strong>Server</strong> and action source{' '}
            <code className={styles.guideInlineCode}>system_generated</code> — never Browser, because
            no browser is involved. There is no matching Browser row and that is correct.
          </li>
          <li className={styles.guideStepItem}>
            Change the status to <strong>Seat Booked</strong> and a{' '}
            <code className={styles.guideInlineCode}>Purchase</code> row appears carrying{' '}
            <code className={styles.guideInlineCode}>value</code> and{' '}
            <code className={styles.guideInlineCode}>currency: INR</code>.
          </li>
          <li className={styles.guideStepItem}>
            Re-saving the same status sends nothing — the event only fires on a genuine change, and
            the event ID is deterministic so even a retry deduplicates.
          </li>
          <li className={styles.guideStepItem}>
            Nothing appeared? Check{' '}
            <code className={styles.guideInlineCode}>public/api/data/capi-feedback.log</code> on the
            server. Every failure is logged there with Meta's own error message. An empty or absent
            log with credentials set means the transition never fired; an{' '}
            <code className={styles.guideInlineCode}>OAuthException</code> means the access token is
            wrong or expired.
          </li>
        </ol>
        <div className={styles.guideNoteWarning}>
          <strong>Warning:</strong> clear both test event codes before going live. Test events do not
          count towards real event data or optimisation.
        </div>
      </div>

      {/* Section 10: Launch checklist */}
      <h2 className={styles.guideTitle}>Launch Checklist (Operator)</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Do all of this before the first rupee of spend. The repo copy of this list lives in{' '}
          <code className={styles.guideInlineCode}>LAUNCH_NOTES.md</code>.
        </p>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            <strong>Rotate the admin API key.</strong> The previous key was committed to the
            repository, so treat it as public. Generate a new one
            (<code className={styles.guideInlineCode}>openssl rand -hex 32</code>) and set it in{' '}
            <em>both</em> <code className={styles.guideInlineCode}>ADMIN_API_KEY</code> (
            <code className={styles.guideInlineCode}>public/api/config.php</code>) and{' '}
            <code className={styles.guideInlineCode}>REACT_APP_LEADS_ADMIN_KEY</code> (
            <code className={styles.guideInlineCode}>.env</code>), then rebuild and redeploy. They
            must match or the admin panel gets 401s. Both the lead store and the tele-calling store
            answer 503 until a key is configured — there is deliberately no built-in default.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Set the Meta credentials</strong> in{' '}
            <code className={styles.guideInlineCode}>config.php</code> (
            <code className={styles.guideInlineCode}>META_PIXEL_ID</code>,{' '}
            <code className={styles.guideInlineCode}>META_ACCESS_TOKEN</code>) and{' '}
            <code className={styles.guideInlineCode}>REACT_APP_META_PIXEL_ID</code> in{' '}
            <code className={styles.guideInlineCode}>.env</code>. Without the second one there is no
            browser pixel and no deduplication.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Set <code className={styles.guideInlineCode}>CONVERSION_VALUE_ADMISSION</code></strong>{' '}
            to the real first-year revenue per admission.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Replace the sample testimonials.</strong>{' '}
            <code className={styles.guideInlineCode}>src/data/testimonialsData.js</code> ships with
            clearly-marked placeholder content that does not render. Collect real, consented student
            or parent quotes and flip{' '}
            <code className={styles.guideInlineCode}>isLive: true</code>. Never publish invented
            testimonials.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Supply real recruiter logos.</strong> The machine-generated placeholder images
            were removed; the recruiter wall now renders name chips. Add licensed artwork to{' '}
            <code className={styles.guideInlineCode}>RECRUITER_LOGOS</code> in{' '}
            <code className={styles.guideInlineCode}>StatsSection.jsx</code> and those chips become
            real logos — no entry means it stays a name chip, so a placeholder can never ship again.
          </li>
          <li className={styles.guideStepItem}>
            <strong>Upload the Google offline-conversion CSV weekly.</strong> The export bug that
            produced zero rows forever is fixed, so the file now has content — export it from Lead
            Management and import it in Google Ads so that channel gets the same quality feedback
            Meta now receives.
          </li>
        </ol>
      </div>

      {/* Section 11: Troubleshooting */}
      <h2 className={styles.guideTitle}>Troubleshooting</h2>
      <div className={styles.guideSection}>
        <div className={styles.guideTableWrap}>
          <table className={styles.guideTable}>
            <thead className={styles.guideTableHead}>
              <tr>
                <th>Problem</th>
                <th>Solution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.guideTableCell}>Pixel Helper shows "No Pixel Found"</td>
                <td className={styles.guideTableCell}>
                  Verify <code className={styles.guideInlineCode}>REACT_APP_META_PIXEL_ID</code> is
                  set in <code className={styles.guideInlineCode}>.env</code> <em>and</em> that the
                  app was rebuilt after setting it.
                </td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  Server events arrive but never show as deduplicated
                </td>
                <td className={styles.guideTableCell}>
                  The browser pixel is not initialised — almost always a missing{' '}
                  <code className={styles.guideInlineCode}>REACT_APP_META_PIXEL_ID</code>. A
                  GTM-managed pixel does not fire this code's events.
                </td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  <code className={styles.guideInlineCode}>QualifiedLead</code> never appears
                </td>
                <td className={styles.guideTableCell}>
                  Check <code className={styles.guideInlineCode}>public/api/data/capi-feedback.log</code>.
                  No log lines at all means Meta credentials are unset (silent no-op) or the status
                  did not actually change.
                </td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  <code className={styles.guideInlineCode}>Purchase</code> value shows as 50000 for
                  every admission
                </td>
                <td className={styles.guideTableCell}>
                  That is the shipped placeholder — set{' '}
                  <code className={styles.guideInlineCode}>CONVERSION_VALUE_ADMISSION</code> in{' '}
                  <code className={styles.guideInlineCode}>config.php</code>.
                </td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>
                  Lots of leads, almost none reach Hot
                </td>
                <td className={styles.guideTableCell}>
                  Check placements first (Audience Network on?), then creative (an incentive-led hook
                  rather than the eligibility check), then the optimisation event — an ad set still
                  optimising on <code className={styles.guideInlineCode}>Lead</code> is being
                  rewarded for volume.
                </td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>Events showing "Duplicate" in Events Manager</td>
                <td className={styles.guideTableCell}>
                  Expected — it means deduplication is working.
                </td>
              </tr>
              <tr>
                <td className={styles.guideTableCell}>Low ad delivery after switching events</td>
                <td className={styles.guideTableCell}>
                  The ad set re-entered the learning phase and the new event is rarer. If it has not
                  cleared ~50 conversions in a week, move back to the previous event tier.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetaAdsGuide;
