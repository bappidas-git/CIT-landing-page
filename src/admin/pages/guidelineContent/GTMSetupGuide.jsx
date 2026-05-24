import React from 'react';

const GTMSetupGuide = ({ styles }) => {
  return (
    <div>
      {/* Section 1: What is Google Tag Manager? */}
      <h2 className={styles.guideTitle}>What is Google Tag Manager?</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Google Tag Manager (GTM) is a free tool from Google that lets you manage all your tracking
          codes — Google Analytics, Google Ads, Meta Pixel, and more — from one dashboard, without
          changing your website code. Instead of asking a developer to add or update tracking snippets
          every time, you do it yourself through GTM's web interface.
        </p>
        <p className={styles.guideParagraph}>
          Think of GTM as a control panel for all your tracking. Instead of adding tracking code to
          your website every time, you add it once (the GTM container), and then manage everything
          from GTM's web interface. You can add new tags, edit triggers, and publish changes — all
          without touching your site's source code.
        </p>
      </div>

      {/* Section 2: Create GTM Account & Container */}
      <h2 className={styles.guideTitle}>Create GTM Account &amp; Container</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Go to <code className={styles.guideInlineCode}>https://tagmanager.google.com</code>
          </li>
          <li className={styles.guideStepItem}>Click "Create Account"</li>
          <li className={styles.guideStepItem}>
            Account name: Monjoven. Container name: landing.monjoven.com. Platform: "Web"
          </li>
          <li className={styles.guideStepItem}>
            Accept the terms of service — you'll get a container ID like{' '}
            <code className={styles.guideInlineCode}>GTM-XXXXXXX</code> — copy this
          </li>
        </ol>
      </div>

      {/* Section 3: Install GTM on Your Landing Page */}
      <h2 className={styles.guideTitle}>Install GTM on Your Landing Page</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          You need to update two things: the HTML file and the environment variables.
        </p>

        <h3 className={styles.guideSubtitle}>A) In public/index.html (2 places)</h3>
        <p className={styles.guideParagraph}>
          Near the top of the file (around line 7), find the GTM{' '}
          <code className={styles.guideInlineCode}>&lt;script&gt;</code> tag and replace{' '}
          <code className={styles.guideInlineCode}>GTM-XXXXXXX</code> with your GTM ID:
        </p>
        <pre className={styles.guideCode}>
{`<!-- Google Tag Manager -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
  f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');
                         <!-- Replace GTM-XXXXXXX with your ID -->
</script>`}
        </pre>

        <p className={styles.guideParagraph}>
          After the opening <code className={styles.guideInlineCode}>&lt;body&gt;</code> tag, find
          the <code className={styles.guideInlineCode}>&lt;noscript&gt;</code> iframe and replace{' '}
          <code className={styles.guideInlineCode}>GTM-XXXXXXX</code> with your GTM ID:
        </p>
        <pre className={styles.guideCode}>
{`<!-- Google Tag Manager (noscript) -->
<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
          height="0" width="0"
          style="display:none;visibility:hidden">
                         <!-- Replace GTM-XXXXXXX with your ID -->
  </iframe>
</noscript>`}
        </pre>

        <h3 className={styles.guideSubtitle}>B) In .env file</h3>
        <pre className={styles.guideCode}>
{`REACT_APP_GTM_ID=GTM-XXXXXXX
REACT_APP_ENABLE_ANALYTICS=true`}
        </pre>

        <div className={styles.guideNote}>
          <strong>Note:</strong> Both the{' '}
          <code className={styles.guideInlineCode}>index.html</code> snippet AND the{' '}
          <code className={styles.guideInlineCode}>.env</code> variable are needed. The HTML snippet
          loads GTM before React loads (for faster tracking), and the{' '}
          <code className={styles.guideInlineCode}>.env</code> variable enables the React-side
          tracking events.
        </div>
      </div>

      {/* Section 4: DataLayer Events Reference */}
      <h2 className={styles.guideTitle}>DataLayer Events Reference</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          The landing page automatically sends events to GTM's dataLayer. Here's every event the
          code fires:
        </p>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Event Name</th>
              <th>When It Fires</th>
              <th>Key Data</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>virtual_pageview</code>
              </td>
              <td className={styles.guideTableCell}>Every page/route change</td>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>page_path</code>,{' '}
                <code className={styles.guideInlineCode}>page_title</code>
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>lead_form_submission</code>
              </td>
              <td className={styles.guideTableCell}>Form submitted</td>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>formSource</code>,{' '}
                <code className={styles.guideInlineCode}>serviceInterest</code>
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>generate_lead</code>
              </td>
              <td className={styles.guideTableCell}>Form submitted (GA4 format)</td>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>currency</code>,{' '}
                <code className={styles.guideInlineCode}>value</code>,{' '}
                <code className={styles.guideInlineCode}>lead_source</code>
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>cta_click</code>
              </td>
              <td className={styles.guideTableCell}>Any CTA button clicked</td>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>cta_name</code>,{' '}
                <code className={styles.guideInlineCode}>cta_location</code>,{' '}
                <code className={styles.guideInlineCode}>cta_text</code>
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>phone_click</code>
              </td>
              <td className={styles.guideTableCell}>Phone number link clicked</td>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>phone_number</code>,{' '}
                <code className={styles.guideInlineCode}>click_location</code>
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>whatsapp_click</code>
              </td>
              <td className={styles.guideTableCell}>WhatsApp link clicked</td>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>click_location</code>
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>scroll_depth</code>
              </td>
              <td className={styles.guideTableCell}>User scrolls 25%, 50%, 75%, 100%</td>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>scroll_percentage</code>
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>time_on_page</code>
              </td>
              <td className={styles.guideTableCell}>User stays 30s, 60s, 2min, 5min</td>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>time_seconds</code>
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>section_view</code>
              </td>
              <td className={styles.guideTableCell}>A page section enters viewport</td>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>section_id</code>
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>enhanced_conversion_data</code>
              </td>
              <td className={styles.guideTableCell}>Form submitted (hashed PII)</td>
              <td className={styles.guideTableCell}>Hashed email, phone, name</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 5: Set Up GA4 Tag in GTM */}
      <h2 className={styles.guideTitle}>Set Up GA4 Tag in GTM</h2>
      <div className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>GA4 Configuration Tag</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            In GTM, go to Tags → New → Tag Type: "Google Analytics: GA4 Configuration"
          </li>
          <li className={styles.guideStepItem}>
            Measurement ID: Your GA4 ID (format{' '}
            <code className={styles.guideInlineCode}>G-XXXXXXXXXX</code> — get from
            analytics.google.com → Admin → Data Streams)
          </li>
          <li className={styles.guideStepItem}>Trigger: "All Pages"</li>
          <li className={styles.guideStepItem}>Name the tag: "GA4 - Configuration"</li>
          <li className={styles.guideStepItem}>Click Save</li>
        </ol>

        <h3 className={styles.guideSubtitle}>Track Leads as GA4 Events</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            New Tag → "Google Analytics: GA4 Event"
          </li>
          <li className={styles.guideStepItem}>
            Configuration Tag: select your GA4 Config tag
          </li>
          <li className={styles.guideStepItem}>
            Event Name: <code className={styles.guideInlineCode}>generate_lead</code>
          </li>
          <li className={styles.guideStepItem}>
            Add parameters:{' '}
            <code className={styles.guideInlineCode}>lead_source</code> ={' '}
            <code className={styles.guideInlineCode}>{'{{dlv - lead_source}}'}</code> (create a Data
            Layer Variable)
          </li>
          <li className={styles.guideStepItem}>
            Trigger: Custom Event where Event Name equals{' '}
            <code className={styles.guideInlineCode}>generate_lead</code>
          </li>
          <li className={styles.guideStepItem}>Save</li>
        </ol>
      </div>

      {/* Section 6: Set Up Google Ads Conversion Tag in GTM */}
      <h2 className={styles.guideTitle}>Set Up Google Ads Conversion Tag in GTM</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            New Tag → "Google Ads Conversion Tracking"
          </li>
          <li className={styles.guideStepItem}>
            Conversion ID: Your{' '}
            <code className={styles.guideInlineCode}>AW-XXXXXXXXXX</code> (from Google Ads)
          </li>
          <li className={styles.guideStepItem}>
            Conversion Label: Your conversion label (from Google Ads)
          </li>
          <li className={styles.guideStepItem}>
            Trigger: Custom Event where Event Name equals{' '}
            <code className={styles.guideInlineCode}>generate_lead</code>
          </li>
          <li className={styles.guideStepItem}>Save</li>
        </ol>
        <div className={styles.guideNote}>
          <strong>Note:</strong> This is an alternative to the direct gtag.js tracking built into
          the code. Use EITHER the GTM tag OR the direct code, not both — otherwise you'll get
          duplicate conversions.
        </div>
      </div>

      {/* Section 7: Preview & Debug Mode */}
      <h2 className={styles.guideTitle}>Preview &amp; Debug Mode</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            In GTM, click the "Preview" button (top right)
          </li>
          <li className={styles.guideStepItem}>Enter your landing page URL</li>
          <li className={styles.guideStepItem}>
            A new tab opens with a debug panel at the bottom
          </li>
          <li className={styles.guideStepItem}>
            Interact with the page — you'll see every event fire and which tags triggered
          </li>
        </ol>

        <h3 className={styles.guideSubtitle}>What to Look For</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            <strong>"Tags Fired"</strong> vs <strong>"Tags Not Fired"</strong> — your GA4 and Ads
            tags should appear under "Tags Fired" when the right events happen
          </li>
          <li className={styles.guideStepItem}>
            Click on each event in the left panel to see the dataLayer data it sent
          </li>
          <li className={styles.guideStepItem}>
            Verify your GA4 and Ads tags fire on the{' '}
            <code className={styles.guideInlineCode}>generate_lead</code> event — submit a test
            form and check
          </li>
        </ol>
      </div>

      {/* Section 8: Publish Your Container */}
      <h2 className={styles.guideTitle}>Publish Your Container</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            After testing, click "Submit" in GTM (top right)
          </li>
          <li className={styles.guideStepItem}>
            Add a version name (e.g., "v1.0 - GA4 + Ads Conversion")
          </li>
          <li className={styles.guideStepItem}>Click "Publish"</li>
        </ol>
        <div className={styles.guideNoteWarning}>
          <strong>Warning:</strong> Always test in Preview mode before publishing. Publishing bad
          tags can break tracking for all users.
        </div>
      </div>

      {/* Section 9: Troubleshooting */}
      <h2 className={styles.guideTitle}>Troubleshooting</h2>
      <div className={styles.guideSection}>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Problem</th>
              <th>Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}>GTM not loading</td>
              <td className={styles.guideTableCell}>
                Check that GTM ID is correct in both{' '}
                <code className={styles.guideInlineCode}>index.html</code> locations. Verify no ad
                blocker is active.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Events not appearing in Preview</td>
              <td className={styles.guideTableCell}>
                Make sure{' '}
                <code className={styles.guideInlineCode}>REACT_APP_ENABLE_ANALYTICS=true</code> in{' '}
                <code className={styles.guideInlineCode}>.env</code>. Check browser console for the{' '}
                <code className={styles.guideInlineCode}>dataLayer</code> array.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Tags not firing</td>
              <td className={styles.guideTableCell}>
                Verify trigger conditions. Custom Event triggers must match the exact event name
                (case-sensitive).
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>GA4 DebugView empty</td>
              <td className={styles.guideTableCell}>
                Enable debug mode: in GTM Preview, GA4 auto-enables debug. Or add{' '}
                <code className={styles.guideInlineCode}>?debug_mode=true</code> to your URL.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Duplicate events in dataLayer</td>
              <td className={styles.guideTableCell}>
                Check if both the GTM snippet and programmatic init are loading GTM. Only one method
                of initialization is needed.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GTMSetupGuide;
