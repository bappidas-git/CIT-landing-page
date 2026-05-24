import React from 'react';

const PabblySetupGuide = ({ styles }) => {
  return (
    <div>
      {/* Section 1: What is Pabbly Connect? */}
      <h2 className={styles.guideTitle}>What is Pabbly Connect?</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Pabbly Connect is a no-code automation tool that connects different apps together.
          It lets you build automated workflows without writing any backend code — you just
          pick a trigger (something that starts the workflow) and one or more actions (things
          that happen automatically after the trigger).
        </p>
        <p className={styles.guideParagraph}>
          Think of Pabbly as a bridge between your landing page form and your Google
          Sheet/Email/CRM. When someone fills out the consultation form on{' '}
          <code className={styles.guideInlineCode}>landing.monjoven.com</code>, Pabbly
          automatically sends that data wherever you want.
        </p>
        <div className={styles.guideNote}>
          <strong>How it works:</strong> UnifiedLeadForm Submit → webhookSubmit.js → Pabbly Webhook →
          Google Sheets / Email / CRM
        </div>
      </div>

      {/* The Big Picture */}
      <h2 className={styles.guideTitle}>The Big Picture (Lead Capture + Lead Management)</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          When a visitor fills a form on your landing page, their details travel to{' '}
          <strong>three places at the same time</strong>. Here's what each one does:
        </p>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Destination</th>
              <th>Why it matters</th>
              <th>Who reads it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}>
                <strong>Pabbly Connect</strong> (the main webhook)
              </td>
              <td className={styles.guideTableCell}>
                Forwards the lead to Google Sheets, Email, WhatsApp, or CRM.
              </td>
              <td className={styles.guideTableCell}>Your sales team</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <strong>Your server</strong>{' '}
                (<code className={styles.guideInlineCode}>/api/leads.php</code>)
              </td>
              <td className={styles.guideTableCell}>
                Stores every lead in one shared JSON file so every admin — on any device — can see
                the same list.
              </td>
              <td className={styles.guideTableCell}>The Admin Panel</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <strong>Visitor's browser</strong> (localStorage)
              </td>
              <td className={styles.guideTableCell}>
                Remembers the submission so the same phone can't submit duplicates immediately.
              </td>
              <td className={styles.guideTableCell}>The landing page</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.guideParagraph}>
          All three happen in under 2 seconds. The visitor just sees the "Thank You" page.
        </p>
        <div className={styles.guideTip}>
          <strong>What about the Admin Panel?</strong> When an admin logs in, the panel asks your
          server for the full lead list (protected with a secret key), then merges it into the
          admin's browser. When an admin changes a status or adds a note, the panel updates the
          server so every other admin sees the change. That's it — no magic.
        </div>
      </div>

      {/* Section 2: Step-by-Step Setup */}
      <h2 className={styles.guideTitle}>Step-by-Step Setup</h2>

      {/* Step 1 */}
      <div className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Step 1: Create a Pabbly Account</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Go to <code className={styles.guideInlineCode}>https://www.pabbly.com/connect/</code>
          </li>
          <li className={styles.guideStepItem}>Click "Sign Up Free"</li>
          <li className={styles.guideStepItem}>Create account with email and password</li>
          <li className={styles.guideStepItem}>
            Pabbly offers a free tier with 100 tasks/month — enough for testing
          </li>
        </ol>
      </div>

      {/* Step 2 */}
      <div className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Step 2: Create a New Workflow</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>After login, click "Create Workflow"</li>
          <li className={styles.guideStepItem}>
            Name it something like "Monjoven - Lead Capture"
          </li>
          <li className={styles.guideStepItem}>
            For the Trigger app, search and select "Webhook / API"
          </li>
          <li className={styles.guideStepItem}>
            Click "Copy" on the generated webhook URL — you'll need this URL in the next step
          </li>
        </ol>
        <div className={styles.guideTip}>
          <strong>Tip:</strong> Keep this browser tab open — you'll come back to it after
          configuring the landing page.
        </div>
      </div>

      {/* Step 3 */}
      <div className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Step 3: Configure the Landing Page Code</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Open the file: <code className={styles.guideInlineCode}>src/utils/webhookSubmit.js</code>
          </li>
          <li className={styles.guideStepItem}>
            Find the line: <code className={styles.guideInlineCode}>const WEBHOOK_URL = "..."</code> (near the top of the file)
          </li>
          <li className={styles.guideStepItem}>
            Replace the placeholder URL with your Pabbly webhook URL
          </li>
          <li className={styles.guideStepItem}>
            Find <code className={styles.guideInlineCode}>const USE_PABBLY = false;</code> — change to{' '}
            <code className={styles.guideInlineCode}>true</code>
          </li>
          <li className={styles.guideStepItem}>
            Find <code className={styles.guideInlineCode}>const DUMMY_MODE = true;</code> — change to{' '}
            <code className={styles.guideInlineCode}>false</code>
          </li>
          <li className={styles.guideStepItem}>Save the file</li>
        </ol>
        <div className={styles.guideNote}>
          <strong>Note:</strong> When <code className={styles.guideInlineCode}>DUMMY_MODE</code> is
          true, form submissions are saved to your browser's localStorage only (for testing). When{' '}
          <code className={styles.guideInlineCode}>USE_PABBLY</code> is true, they're sent to Pabbly.
        </div>
      </div>

      {/* Step 4 */}
      <div className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Step 4: Test the Webhook Connection</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Start your landing page: <code className={styles.guideInlineCode}>npm start</code>
          </li>
          <li className={styles.guideStepItem}>Go to the landing page and fill in the consultation form</li>
          <li className={styles.guideStepItem}>Submit the form</li>
          <li className={styles.guideStepItem}>
            Go back to Pabbly → your workflow → click "History"
          </li>
          <li className={styles.guideStepItem}>
            You should see the test submission with all the data
          </li>
          <li className={styles.guideStepItem}>
            If you don't see it, check the Troubleshooting section below
          </li>
        </ol>
      </div>

      {/* Step 5 */}
      <div className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Step 5: Add Google Sheets Action in Pabbly</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            In your Pabbly workflow, click the "+" button to add an action step
          </li>
          <li className={styles.guideStepItem}>
            Search for "Google Sheets" and select it
          </li>
          <li className={styles.guideStepItem}>Choose action: "Add Row"</li>
          <li className={styles.guideStepItem}>
            Connect your Google account (click "Connect" and authorize)
          </li>
          <li className={styles.guideStepItem}>
            Select your spreadsheet (create one first if you haven't)
          </li>
          <li className={styles.guideStepItem}>Select the worksheet (usually "Sheet1")</li>
          <li className={styles.guideStepItem}>
            Map each column to the webhook data fields (see Column Mapping table below)
          </li>
          <li className={styles.guideStepItem}>
            Click "Save & Send Test Request" to verify
          </li>
        </ol>
      </div>

      {/* Step 6 */}
      <div className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Step 6: Add Email Notification (Optional but Recommended)</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Click "+" to add another action step after Google Sheets
          </li>
          <li className={styles.guideStepItem}>
            Select "Email by Pabbly" (free built-in) or "Gmail"
          </li>
          <li className={styles.guideStepItem}>
            If using Gmail: connect your Google account
          </li>
          <li className={styles.guideStepItem}>Set recipient: dr@monjoven.com or your sales team email</li>
          <li className={styles.guideStepItem}>
            Subject:{' '}
            <code className={styles.guideInlineCode}>
              {'New Consultation: {{name}} - {{service_interest}}'}
            </code>
          </li>
          <li className={styles.guideStepItem}>
            Use the email body template provided in the Email Notification Template section below
          </li>
          <li className={styles.guideStepItem}>Save and test</li>
        </ol>
      </div>

      {/* Section 3: Lead Data Fields Reference */}
      <h2 className={styles.guideTitle}>Lead Data Fields Reference</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          These are all the fields sent by the UnifiedLeadForm to your Pabbly webhook:
        </p>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Field</th>
              <th>Example</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>name</code></td>
              <td className={styles.guideTableCell}>Rahul Sharma</td>
              <td className={styles.guideTableCell}>Patient's full name</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>mobile</code></td>
              <td className={styles.guideTableCell}>9876543210</td>
              <td className={styles.guideTableCell}>10-digit mobile number</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>email</code></td>
              <td className={styles.guideTableCell}>rahul@example.com</td>
              <td className={styles.guideTableCell}>Email address (optional)</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>service_interest</code></td>
              <td className={styles.guideTableCell}>Hair Transplant</td>
              <td className={styles.guideTableCell}>Selected service (Hair Transplant, Rhinoplasty, PRP Therapy, etc.)</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>message</code></td>
              <td className={styles.guideTableCell}>Interested in FUE technique</td>
              <td className={styles.guideTableCell}>Additional message from patient (optional)</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>source</code></td>
              <td className={styles.guideTableCell}>hero-form</td>
              <td className={styles.guideTableCell}>Which form they used (see table below)</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>lead_id</code></td>
              <td className={styles.guideTableCell}>a1b2c3d4-e5f6...</td>
              <td className={styles.guideTableCell}>Unique ID for each lead</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>status</code></td>
              <td className={styles.guideTableCell}>new</td>
              <td className={styles.guideTableCell}>Always "new" on submission</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>submitted_at</code></td>
              <td className={styles.guideTableCell}>2026-04-11T10:30:00.000Z</td>
              <td className={styles.guideTableCell}>When the form was submitted</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>page_url</code></td>
              <td className={styles.guideTableCell}>https://landing.monjoven.com/?utm_source=google</td>
              <td className={styles.guideTableCell}>Full page URL</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>utm_source</code></td>
              <td className={styles.guideTableCell}>google</td>
              <td className={styles.guideTableCell}>Ad platform source</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>utm_medium</code></td>
              <td className={styles.guideTableCell}>cpc</td>
              <td className={styles.guideTableCell}>Traffic medium</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>utm_campaign</code></td>
              <td className={styles.guideTableCell}>hair_transplant_guwahati</td>
              <td className={styles.guideTableCell}>Campaign name</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>utm_term</code></td>
              <td className={styles.guideTableCell}>hair+transplant+guwahati</td>
              <td className={styles.guideTableCell}>Search keyword</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>utm_content</code></td>
              <td className={styles.guideTableCell}>ad_variant_a</td>
              <td className={styles.guideTableCell}>Ad variant</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>gclid</code></td>
              <td className={styles.guideTableCell}>EAIaIQob...</td>
              <td className={styles.guideTableCell}>Google Click ID (auto-captured)</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>user_agent</code></td>
              <td className={styles.guideTableCell}>Mozilla/5.0...</td>
              <td className={styles.guideTableCell}>Browser information</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 4: Form Sources Reference */}
      <h2 className={styles.guideTitle}>Form Sources Reference</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          The <code className={styles.guideInlineCode}>source</code> field tells you which form on{' '}
          <code className={styles.guideInlineCode}>landing.monjoven.com</code> the lead came from.
          All forms use the UnifiedLeadForm component:
        </p>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Source Value</th>
              <th>Form Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>hero-form</code></td>
              <td className={styles.guideTableCell}>Main consultation form in the Hero section</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>contact-form</code></td>
              <td className={styles.guideTableCell}>Enquiry form in the Contact section</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>unified-lead-form</code></td>
              <td className={styles.guideTableCell}>Default form (no specific formId prop set)</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>drawer-form-apply-now</code></td>
              <td className={styles.guideTableCell}>Slide-in drawer — Book Consultation</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>drawer-form-request-callback</code></td>
              <td className={styles.guideTableCell}>Slide-in drawer — Request Callback</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>drawer-form-get-details</code></td>
              <td className={styles.guideTableCell}>Slide-in drawer — Get Details</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>drawer-form-download-brochure</code></td>
              <td className={styles.guideTableCell}>Slide-in drawer — Download Brochure</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 5: Google Sheets Column Mapping */}
      <h2 className={styles.guideTitle}>Google Sheets Column Mapping</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          When configuring the Google Sheets action in Pabbly, map each column as follows:
        </p>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Column</th>
              <th>Header</th>
              <th>Pabbly Field</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}>A</td>
              <td className={styles.guideTableCell}>Name</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{name}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>B</td>
              <td className={styles.guideTableCell}>Mobile</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{mobile}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>C</td>
              <td className={styles.guideTableCell}>Email</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{email}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>D</td>
              <td className={styles.guideTableCell}>Service Interest</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{service_interest}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>E</td>
              <td className={styles.guideTableCell}>Message</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{message}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>F</td>
              <td className={styles.guideTableCell}>Source</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{source}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>G</td>
              <td className={styles.guideTableCell}>Lead ID</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{lead_id}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>H</td>
              <td className={styles.guideTableCell}>Status</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{status}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>I</td>
              <td className={styles.guideTableCell}>Submitted At</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{submitted_at}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>J</td>
              <td className={styles.guideTableCell}>Page URL</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{page_url}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>K</td>
              <td className={styles.guideTableCell}>UTM Source</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{utm_source}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>L</td>
              <td className={styles.guideTableCell}>UTM Medium</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{utm_medium}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>M</td>
              <td className={styles.guideTableCell}>UTM Campaign</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{utm_campaign}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>N</td>
              <td className={styles.guideTableCell}>UTM Term</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{utm_term}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>O</td>
              <td className={styles.guideTableCell}>UTM Content</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{utm_content}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>P</td>
              <td className={styles.guideTableCell}>GCLID</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{gclid}}'}</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Q</td>
              <td className={styles.guideTableCell}>User Agent</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>{'{{user_agent}}'}</code></td>
            </tr>
          </tbody>
        </table>
        <div className={styles.guideTip}>
          <strong>Tip:</strong> Create the header row manually in your Google Sheet first, then map
          each column in Pabbly.
        </div>
      </div>

      {/* Section 6: Email Notification Template */}
      <h2 className={styles.guideTitle}>Email Notification Template</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Use this template for the email body in your Pabbly email notification action:
        </p>
        <pre className={styles.guideCode}>
{`New consultation request from {{source}}

Name: {{name}}
Mobile: {{mobile}}
Email: {{email}}
Service Interest: {{service_interest}}
Message: {{message}}

Submitted: {{submitted_at}}
Page: {{page_url}}
UTM Source: {{utm_source}} | Campaign: {{utm_campaign}}`}
        </pre>
      </div>

      {/* Section 6b: Lead Management Setup (Required) */}
      <h2 className={styles.guideTitle}>Lead Management Setup (Required for Admin Panel)</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          The Admin Panel needs to see leads from <strong>every</strong> device — a visitor could
          submit a form from their phone in Delhi, and your sales team should be able to see that
          lead from their laptop in Mumbai. To make this possible, the project ships a tiny PHP
          file (<code className={styles.guideInlineCode}>public/api/leads.php</code>) that stores
          every lead in a shared file on your server.
        </p>
        <div className={styles.guideNote}>
          <strong>Requirement:</strong> Your hosting must support PHP (cPanel, Hostinger, VPS — yes.
          Netlify/Vercel static-only — no). If you use a static host, put{' '}
          <code className={styles.guideInlineCode}>leads.php</code> on any cheap PHP host and point
          the env var to its full URL.
        </div>

        <h3 className={styles.guideSubtitle}>Step 1: Create config.php on your server</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Open your server's file manager (cPanel / FTP / SSH).
          </li>
          <li className={styles.guideStepItem}>
            Go to the <code className={styles.guideInlineCode}>api/</code> folder inside your
            deployed project.
          </li>
          <li className={styles.guideStepItem}>
            Find <code className={styles.guideInlineCode}>config.example.php</code> → make a copy →
            rename the copy to <code className={styles.guideInlineCode}>config.php</code>.
          </li>
          <li className={styles.guideStepItem}>
            Open <code className={styles.guideInlineCode}>config.php</code> in the editor and find
            this line:
            <pre className={styles.guideCode}>{`define('ADMIN_API_KEY', 'CHANGE_ME_TO_A_LONG_RANDOM_STRING');`}</pre>
          </li>
          <li className={styles.guideStepItem}>
            Replace the placeholder with a long random string. You can generate one at{' '}
            <code className={styles.guideInlineCode}>https://www.random.org/strings/</code>.
            Example:
            <pre className={styles.guideCode}>{`define('ADMIN_API_KEY', 'Zk8pQ3mX9yL2wN7bV5rT1jH6cD4fG0aE');`}</pre>
          </li>
          <li className={styles.guideStepItem}>Save the file.</li>
        </ol>

        <h3 className={styles.guideSubtitle}>Step 2: Put the same key in your .env file</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Open the <code className={styles.guideInlineCode}>.env</code> file in your project.
          </li>
          <li className={styles.guideStepItem}>
            Add (or update) these two lines:
            <pre className={styles.guideCode}>
{`REACT_APP_LEADS_API_URL="/api/leads.php"
REACT_APP_LEADS_ADMIN_KEY="Zk8pQ3mX9yL2wN7bV5rT1jH6cD4fG0aE"`}
            </pre>
          </li>
          <li className={styles.guideStepItem}>
            <strong>
              The value of REACT_APP_LEADS_ADMIN_KEY must EXACTLY match ADMIN_API_KEY from the PHP
              file.
            </strong>{' '}
            If they don't match, the admin panel will show "Unauthorized".
          </li>
        </ol>

        <h3 className={styles.guideSubtitle}>Step 3: Rebuild and redeploy</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Run <code className={styles.guideInlineCode}>npm run build</code> — the .env values get
            "baked" into the final JavaScript files.
          </li>
          <li className={styles.guideStepItem}>
            Upload the fresh <code className={styles.guideInlineCode}>build/</code> folder to your
            server.
          </li>
          <li className={styles.guideStepItem}>
            Make sure the <code className={styles.guideInlineCode}>api/data/</code> folder is
            writable by PHP (usually automatic on cPanel — if not, set permissions to{' '}
            <code className={styles.guideInlineCode}>755</code>).
          </li>
        </ol>

        <h3 className={styles.guideSubtitle}>Step 4: Test</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Submit a test lead from your phone (or any device other than the one you're admin'ing
            from).
          </li>
          <li className={styles.guideStepItem}>
            Log into the admin panel at{' '}
            <code className={styles.guideInlineCode}>/admin/login</code>.
          </li>
          <li className={styles.guideStepItem}>
            Open <code className={styles.guideInlineCode}>/admin/lms</code> — the lead should
            appear within a few seconds.
          </li>
          <li className={styles.guideStepItem}>
            If it doesn't, open browser DevTools → Network tab and look for a request to{' '}
            <code className={styles.guideInlineCode}>/api/leads.php?action=list</code> — the
            response will tell you what went wrong.
          </li>
        </ol>

        <div className={styles.guideTip}>
          <strong>How it works under the hood:</strong> When a lead is submitted, the site POSTs to{' '}
          <code className={styles.guideInlineCode}>/api/leads.php?action=create</code> (public, no
          auth needed). When the admin panel loads, it GETs{' '}
          <code className={styles.guideInlineCode}>/api/leads.php?action=list</code> with the{' '}
          <code className={styles.guideInlineCode}>X-Admin-Key</code> header — this is why the two
          keys must match.
        </div>
      </div>

      {/* Section 7: Admin Panel Webhook (Optional — not required) */}
      <h2 className={styles.guideTitle}>
        Admin Panel Pabbly Webhook (OPTIONAL — Skip Unless You Need It)
      </h2>
      <div className={styles.guideSection}>
        <div className={styles.guideNote}>
          <strong>Short answer:</strong> You do <strong>NOT</strong> need this for Lead Management
          to work. The Lead Management Setup above already syncs admin actions across all devices
          through your server. This webhook is a bonus — only set it up if you want admin actions
          to also appear in a <em>second</em> Pabbly workflow (e.g., a separate Google Sheet or a
          Slack notification).
        </div>

        <h3 className={styles.guideSubtitle}>Set it up only if you want:</h3>
        <ul className={styles.guideList}>
          <li className={styles.guideListItem}>
            Your main Google Sheet to auto-update when an admin marks a lead as
            Contacted/Converted/Lost.
          </li>
          <li className={styles.guideListItem}>
            A Slack/email ping whenever any admin adds a note.
          </li>
          <li className={styles.guideListItem}>
            A full audit log of admin actions inside Pabbly.
          </li>
        </ul>

        <h3 className={styles.guideSubtitle}>Skip it if:</h3>
        <ul className={styles.guideList}>
          <li className={styles.guideListItem}>
            You manage lead statuses only inside the Admin Panel itself.
          </li>
          <li className={styles.guideListItem}>
            You don't need external tools to know when admins change things.
          </li>
        </ul>

        <h3 className={styles.guideSubtitle}>Setup (if you decide you need it)</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Create a <strong>second</strong> Pabbly workflow with a Webhook trigger.
          </li>
          <li className={styles.guideStepItem}>Copy its webhook URL.</li>
          <li className={styles.guideStepItem}>
            In <code className={styles.guideInlineCode}>.env</code>, set:
            <pre className={styles.guideCode}>
{`REACT_APP_ADMIN_PABBLY_WEBHOOK_URL="https://connect.pabbly.com/webhook-listener/webhook/YOUR_SECOND_URL"`}
            </pre>
          </li>
          <li className={styles.guideStepItem}>
            Rebuild with <code className={styles.guideInlineCode}>npm run build</code> and redeploy.
          </li>
        </ol>

        <p className={styles.guideParagraph}>
          When configured, the admin panel will send one of these payloads for each action:
        </p>
        <pre className={styles.guideCode}>
{`// When an admin changes a lead's status
{
  "action": "status_update",
  "lead_id": "a1b2c3d4-e5f6...",
  "new_status": "contacted",
  "old_status": "new",
  "timestamp": "2026-04-12T10:30:00.000Z"
}

// When an admin adds a note
{
  "action": "note_added",
  "lead_id": "a1b2c3d4-e5f6...",
  "note_text": "Called and left voicemail",
  "timestamp": "2026-04-12T11:00:00.000Z"
}

// When an admin deletes a lead
{
  "action": "lead_deleted",
  "lead_id": "a1b2c3d4-e5f6...",
  "timestamp": "2026-04-12T11:30:00.000Z"
}`}
        </pre>
        <div className={styles.guideTip}>
          <strong>Tip:</strong> Use a Pabbly <strong>Router</strong> or <strong>Filter</strong>{' '}
          step to branch on the <code className={styles.guideInlineCode}>action</code> field so
          each event type lands in the right place.
        </div>
      </div>

      {/* Section 8: Testing Checklist */}
      <h2 className={styles.guideTitle}>Testing Checklist</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>Submit a test consultation form on the landing page</li>
          <li className={styles.guideStepItem}>
            Check Pabbly workflow history — data should appear within 30 seconds
          </li>
          <li className={styles.guideStepItem}>
            Check your Google Sheet — new row should be added
          </li>
          <li className={styles.guideStepItem}>
            Check your email — notification should arrive
          </li>
          <li className={styles.guideStepItem}>
            Check the admin panel at{' '}
            <code className={styles.guideInlineCode}>landing.monjoven.com/admin/lms</code> — lead should appear
          </li>
          <li className={styles.guideStepItem}>
            Try submitting the same phone number again — should show "Already Registered"
          </li>
        </ol>
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
              <td className={styles.guideTableCell}>Form submits but Pabbly shows nothing</td>
              <td className={styles.guideTableCell}>
                Verify <code className={styles.guideInlineCode}>USE_PABBLY = true</code> and{' '}
                <code className={styles.guideInlineCode}>DUMMY_MODE = false</code> in{' '}
                <code className={styles.guideInlineCode}>webhookSubmit.js</code>. Check the webhook URL
                is correct.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                Pabbly receives data but Google Sheets is empty
              </td>
              <td className={styles.guideTableCell}>
                Re-authorize your Google account in Pabbly. Make sure the spreadsheet and sheet name
                are correct.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Getting CORS error in browser console</td>
              <td className={styles.guideTableCell}>
                Pabbly webhooks accept cross-origin POST by default. Double-check the URL for typos.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Leads appearing twice in admin panel</td>
              <td className={styles.guideTableCell}>
                This was a bug that has been fixed. Make sure you're running the latest code.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>UTM data is empty</td>
              <td className={styles.guideTableCell}>
                UTM parameters must be in the landing page URL (e.g.,{' '}
                <code className={styles.guideInlineCode}>
                  landing.monjoven.com/?utm_source=google&utm_medium=cpc
                </code>).
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                Admin Panel is empty even though Pabbly receives leads
              </td>
              <td className={styles.guideTableCell}>
                (1) Verify <code className={styles.guideInlineCode}>config.php</code> exists in{' '}
                <code className={styles.guideInlineCode}>api/</code> with{' '}
                <code className={styles.guideInlineCode}>ADMIN_API_KEY</code> set. (2) Verify{' '}
                <code className={styles.guideInlineCode}>REACT_APP_LEADS_ADMIN_KEY</code> in{' '}
                <code className={styles.guideInlineCode}>.env</code> EXACTLY matches{' '}
                <code className={styles.guideInlineCode}>ADMIN_API_KEY</code>. (3) Rebuild and
                redeploy after any <code className={styles.guideInlineCode}>.env</code> change. (4)
                Make sure <code className={styles.guideInlineCode}>api/data/</code> is writable by
                PHP.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                Admin Panel shows "Unauthorized" in the console
              </td>
              <td className={styles.guideTableCell}>
                The two keys don't match. Copy{' '}
                <code className={styles.guideInlineCode}>ADMIN_API_KEY</code> from{' '}
                <code className={styles.guideInlineCode}>config.php</code> into{' '}
                <code className={styles.guideInlineCode}>REACT_APP_LEADS_ADMIN_KEY</code> in{' '}
                <code className={styles.guideInlineCode}>.env</code>, then rebuild.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                Lead submissions don't reach the server
              </td>
              <td className={styles.guideTableCell}>
                Open DevTools → Network tab → submit a form. Look for a POST to{' '}
                <code className={styles.guideInlineCode}>/api/leads.php?action=create</code>. If
                you see a 500 error, the <code className={styles.guideInlineCode}>data/</code>{' '}
                folder probably isn't writable. On cPanel, set permissions to{' '}
                <code className={styles.guideInlineCode}>755</code>.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PabblySetupGuide;
