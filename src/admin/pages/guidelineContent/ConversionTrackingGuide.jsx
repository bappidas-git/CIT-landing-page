import React from 'react';

const ConversionTrackingGuide = ({ styles }) => {
  return (
    <div>
      {/* Section 1: The Big Picture */}
      <h2 className={styles.guideTitle}>The Big Picture</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Here's how the complete conversion tracking flow works, from ad click to customer:
        </p>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            A person sees your ad on Google or Facebook
          </li>
          <li className={styles.guideStepItem}>
            They click the ad and arrive on your landing page — the URL contains tracking IDs like{' '}
            <code className={styles.guideInlineCode}>gclid</code>,{' '}
            <code className={styles.guideInlineCode}>utm_source</code>, etc.
          </li>
          <li className={styles.guideStepItem}>
            They browse the page — the code tracks scroll depth, time on page, and sections viewed
          </li>
          <li className={styles.guideStepItem}>
            They fill out a form and submit it
          </li>
          <li className={styles.guideStepItem}>
            Lead data goes to Pabbly (Google Sheets + Email notification)
          </li>
          <li className={styles.guideStepItem}>
            Conversion events fire: Google Ads conversion, GA4{' '}
            <code className={styles.guideInlineCode}>generate_lead</code>, Meta Pixel{' '}
            <code className={styles.guideInlineCode}>Lead</code>, and Meta CAPI{' '}
            <code className={styles.guideInlineCode}>Lead</code>
          </li>
          <li className={styles.guideStepItem}>
            You manage the lead in the admin panel
          </li>
          <li className={styles.guideStepItem}>
            When the lead becomes a customer, you mark it as "Converted" in the admin panel
          </li>
          <li className={styles.guideStepItem}>
            Google Ads offline conversion export — upload to Google Ads for Smart Bidding optimization
          </li>
          <li className={styles.guideStepItem}>
            Meta CAPI conversion event — sent to Meta for campaign optimization
          </li>
        </ol>
        <div className={styles.guideNote}>
          <strong>Note:</strong> This whole flow is automated. You just need to set up the initial
          configuration (Pabbly, Google Ads ID, Meta Pixel ID) and the code handles everything else.
        </div>
      </div>

      {/* Section 2: What is a Conversion? */}
      <h2 className={styles.guideTitle}>What is a Conversion?</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          A conversion is when a website visitor takes a desired action — in our case, submitting a
          lead form. There are two types of conversions in this system:
        </p>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            <strong>Primary conversion:</strong> Form submission — tracked automatically when a
            visitor fills out and submits a lead form on your landing page
          </li>
          <li className={styles.guideStepItem}>
            <strong>Secondary conversion:</strong> Lead becomes a paying customer — tracked manually
            when you mark a lead as "Converted" in the admin panel
          </li>
        </ol>
        <p className={styles.guideParagraph}>
          <strong>Why tracking conversions matters:</strong> It tells Google and Meta which ads are
          bringing real customers, so they can show your ads to more people like them. Without
          conversion tracking, these platforms have no way to optimize your ad spend — they're
          essentially guessing who to show your ads to.
        </p>
      </div>

      {/* Section 3: Google Ads Conversion Flow */}
      <h2 className={styles.guideTitle}>Google Ads Conversion Flow</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            <strong>GCLID Capture:</strong> When someone clicks your Google Ad, a{' '}
            <code className={styles.guideInlineCode}>gclid</code> parameter is added to the URL. The
            code automatically captures this and stores it in localStorage (see{' '}
            <code className={styles.guideInlineCode}>src/utils/gclidManager.js</code>)
          </li>
          <li className={styles.guideStepItem}>
            <strong>Form Submission:</strong> When the form is submitted, the code fires{' '}
            <code className={styles.guideInlineCode}>
              window.gtag('event', 'conversion', ...)
            </code>{' '}
            with your Ads ID and Conversion Label
          </li>
          <li className={styles.guideStepItem}>
            <strong>Enhanced Conversions:</strong> If enabled, hashed (encrypted) email and phone are
            sent to Google for better matching — this improves conversion attribution accuracy
          </li>
          <li className={styles.guideStepItem}>
            <strong>Offline Conversion:</strong> When you mark a lead as "Converted" in the admin
            panel, you can export a CSV with the GCLID and upload it to Google Ads
          </li>
        </ol>

        <h3 className={styles.guideSubtitle}>Required .env Settings</h3>
        <pre className={styles.guideCode}>
{`REACT_APP_GOOGLE_ADS_ID=AW-XXXXXXXXXX
REACT_APP_GOOGLE_ADS_CONVERSION_LABEL=YourLabel
REACT_APP_GOOGLE_ADS_ENHANCED_CONVERSIONS=true
REACT_APP_ENABLE_ANALYTICS=true`}
        </pre>
      </div>

      {/* Section 4: Meta Conversion Flow */}
      <h2 className={styles.guideTitle}>Meta Conversion Flow</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            <strong>Browser Pixel:</strong> When the page loads, Meta Pixel fires{' '}
            <code className={styles.guideInlineCode}>PageView</code>. When a form is submitted, it
            fires <code className={styles.guideInlineCode}>Lead</code>
          </li>
          <li className={styles.guideStepItem}>
            <strong>Server CAPI:</strong> Simultaneously, the code sends the same{' '}
            <code className={styles.guideInlineCode}>Lead</code> event to your server, which forwards
            it to Meta via their Conversions API
          </li>
          <li className={styles.guideStepItem}>
            <strong>Deduplication:</strong> Both events share the same{' '}
            <code className={styles.guideInlineCode}>event_id</code>, so Meta counts it only once
          </li>
          <li className={styles.guideStepItem}>
            <strong>Admin Conversion:</strong> When you mark a lead as "Converted" in the admin panel,
            a <code className={styles.guideInlineCode}>Purchase</code> event is sent to Meta CAPI
          </li>
        </ol>

        <h3 className={styles.guideSubtitle}>Required .env Settings</h3>
        <pre className={styles.guideCode}>
{`REACT_APP_META_PIXEL_ID=XXXXXXXXXXXXXXX
REACT_APP_META_CAPI_ENDPOINT=/api/meta-capi.php
REACT_APP_ENABLE_ANALYTICS=true`}
        </pre>

        <h3 className={styles.guideSubtitle}>Server-side config.php Requirements</h3>
        <pre className={styles.guideCode}>
{`META_PIXEL_ID = same as above
META_ACCESS_TOKEN = from Events Manager`}
        </pre>
      </div>

      {/* Section 5: How to Mark a Lead as Converted */}
      <h2 className={styles.guideTitle}>How to Mark a Lead as Converted</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Follow these steps in the admin panel to mark a lead as converted:
        </p>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Go to Admin Panel → Lead Management
          </li>
          <li className={styles.guideStepItem}>
            Find the lead you want to mark as converted
          </li>
          <li className={styles.guideStepItem}>
            Click the "View" button to open the lead detail page
          </li>
          <li className={styles.guideStepItem}>
            Click "Mark as Converted" button at the bottom
          </li>
          <li className={styles.guideStepItem}>
            Enter the conversion value (e.g., ₹50,000) and select the conversion type
          </li>
          <li className={styles.guideStepItem}>
            Click "Send Conversion"
          </li>
          <li className={styles.guideStepItem}>
            This does 3 things:
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '4px' }}>Changes lead status to "Converted"</li>
              <li style={{ marginBottom: '4px' }}>Sends a conversion event to Meta CAPI</li>
              <li>Records the conversion for Google Ads export</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Section 6: How to Export Google Ads Offline Conversions */}
      <h2 className={styles.guideTitle}>How to Export Google Ads Offline Conversions</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            In Lead Management, click "Export for Google Ads" button
          </li>
          <li className={styles.guideStepItem}>
            A CSV file downloads with only converted leads that have a GCLID
          </li>
          <li className={styles.guideStepItem}>
            Go to Google Ads → Tools &amp; Settings → Conversions → Uploads
          </li>
          <li className={styles.guideStepItem}>
            Click "+" to upload a new file
          </li>
          <li className={styles.guideStepItem}>
            Select the CSV, choose "Google Click ID" as the identifier, and upload
          </li>
        </ol>
        <div className={styles.guideNote}>
          <strong>Note:</strong> Only leads that came from Google Ads clicks (have a GCLID) can be
          uploaded. Leads from Meta Ads or direct traffic won't have a GCLID.
        </div>
      </div>

      {/* Section 7: Verification Checklist */}
      <h2 className={styles.guideTitle}>Verification Checklist</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Follow these steps to verify everything is working correctly:
        </p>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Submit a test form on the landing page
          </li>
          <li className={styles.guideStepItem}>
            <strong>Check Google Ads:</strong> Go to Tools → Conversions — should show "Recording"
            within 24 hours
          </li>
          <li className={styles.guideStepItem}>
            <strong>Check GA4:</strong> Go to Real-Time report — should see{' '}
            <code className={styles.guideInlineCode}>generate_lead</code> event
          </li>
          <li className={styles.guideStepItem}>
            <strong>Check Meta:</strong> Go to Events Manager → Overview — should see{' '}
            <code className={styles.guideInlineCode}>Lead</code> event
          </li>
          <li className={styles.guideStepItem}>
            <strong>Check Meta Test Events:</strong> If test code is set, events appear immediately
          </li>
          <li className={styles.guideStepItem}>
            <strong>Check Admin Panel:</strong> Lead should appear in Lead Management
          </li>
          <li className={styles.guideStepItem}>
            <strong>Check localStorage:</strong>{' '}
            <code className={styles.guideInlineCode}>
              JSON.parse(localStorage.getItem('lp_test_leads'))
            </code>{' '}
            should have the lead
          </li>
          <li className={styles.guideStepItem}>
            Mark the lead as Converted in admin → check Meta Events Manager for{' '}
            <code className={styles.guideInlineCode}>Purchase</code> event
          </li>
          <li className={styles.guideStepItem}>
            Export for Google Ads → verify CSV has the correct format
          </li>
        </ol>
      </div>

      {/* Section 8: Consent Mode */}
      <h2 className={styles.guideTitle}>Consent Mode (Brief)</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          <strong>What it is:</strong> Google Consent Mode v2 controls which tracking fires based on
          user cookie consent. It lets you respect user privacy choices while still collecting some
          anonymized data.
        </p>
        <p className={styles.guideParagraph}>
          <strong>When to use:</strong> If you're targeting EU/UK users (GDPR compliance). For
          India-focused landing pages, it's not strictly required, but it's good practice.
        </p>
        <p className={styles.guideParagraph}>
          <strong>How to enable:</strong> Set the following in your{' '}
          <code className={styles.guideInlineCode}>.env</code> file:
        </p>
        <pre className={styles.guideCode}>
{`REACT_APP_ENABLE_CONSENT_MODE=true`}
        </pre>
        <p className={styles.guideParagraph}>
          The code defaults to "denied" for ads and analytics, then updates the consent state when
          the user grants consent.
        </p>
        <div className={styles.guideNoteWarning}>
          <strong>Warning:</strong> You'll need to integrate a cookie consent banner to actually
          collect user consent. A consent banner is not included in this boilerplate — you'll need
          to add one separately (e.g., CookieConsent, Osano, or a custom implementation).
        </div>
      </div>
    </div>
  );
};

export default ConversionTrackingGuide;
