import React from 'react';

const LeadStorageGuide = ({ styles }) => {
  return (
    <div>
      {/* Section 1: How leads are stored */}
      <h2 className={styles.guideTitle}>How Leads Are Stored & Synced</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Every admission enquiry submitted on the landing page is saved to a{' '}
          <strong>single shared store on your server</strong> —{' '}
          <code className={styles.guideInlineCode}>/api/leads.php</code>, which keeps all
          leads in one JSON file (<code className={styles.guideInlineCode}>api/data/leads.json</code>).
          That server store is the <strong>single source of truth</strong>.
        </p>
        <p className={styles.guideParagraph}>
          Because the data lives on the server (not in any one browser), the Admin Panel shows
          the <strong>same leads on every device and every browser</strong> — your phone, your
          laptop, and a colleague's computer all read from the same place.
        </p>
        <div className={styles.guideNote}>
          <strong>How it works:</strong> UnifiedLeadForm submit → webhookSubmit.js →{' '}
          <code className={styles.guideInlineCode}>POST /api/leads.php?action=create</code> →
          shared JSON store → Admin Panel reads it on every device.
        </div>
      </div>

      {/* The flow */}
      <h2 className={styles.guideTitle}>The Big Picture</h2>
      <div className={styles.guideSection}>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Step</th>
              <th>What happens</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}><strong>1. Visitor submits</strong></td>
              <td className={styles.guideTableCell}>
                The form POSTs the lead (with UTM + GCLID attribution) to{' '}
                <code className={styles.guideInlineCode}>/api/leads.php?action=create</code>.
                The server dedupes by mobile number so the same applicant can't create two leads.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><strong>2. Server stores it</strong></td>
              <td className={styles.guideTableCell}>
                The lead is appended to the shared JSON file. This is the only copy that matters.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><strong>3. Admin reads it</strong></td>
              <td className={styles.guideTableCell}>
                The Admin Panel pulls the full list from the server on load, then auto-refreshes
                every 15 seconds (and when you click Refresh), so new leads appear on every device.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><strong>4. Admin edits sync back</strong></td>
              <td className={styles.guideTableCell}>
                Status changes, notes, and conversions are written straight back to the server, so
                an edit made on one device shows up on all the others.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Configuration */}
      <h2 className={styles.guideTitle}>Configuration (Required)</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Two settings keep the landing page, the server, and the Admin Panel in sync:
        </p>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Setting</th>
              <th>Where</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>REACT_APP_LEADS_API_URL</code>
              </td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>.env</code></td>
              <td className={styles.guideTableCell}>
                URL of the leads endpoint. Default <code className={styles.guideInlineCode}>/api/leads.php</code>.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>REACT_APP_LEADS_ADMIN_KEY</code>
              </td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>.env</code></td>
              <td className={styles.guideTableCell}>
                Shared key the Admin Panel uses to list/update/delete leads. Must match{' '}
                <code className={styles.guideInlineCode}>ADMIN_API_KEY</code> on the server.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>ADMIN_API_KEY</code>
              </td>
              <td className={styles.guideTableCell}>
                <code className={styles.guideInlineCode}>public/api/config.php</code>
              </td>
              <td className={styles.guideTableCell}>
                Server-side copy of the same key. Generate a long random string and set both to it.
              </td>
            </tr>
          </tbody>
        </table>
        <div className={styles.guideNote}>
          <strong>Hosting note:</strong> <code className={styles.guideInlineCode}>leads.php</code>{' '}
          needs PHP. Your build's <code className={styles.guideInlineCode}>public/api/</code> folder
          is deployed alongside the React app, and the <code className={styles.guideInlineCode}>api/data/</code>{' '}
          folder is created automatically and protected with a deny-all rule.
        </div>
      </div>
    </div>
  );
};

export default LeadStorageGuide;
