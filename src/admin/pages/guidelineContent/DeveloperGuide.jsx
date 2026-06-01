import React from 'react';

const DeveloperGuide = ({ styles }) => {
  return (
    <div>
      {/* Section 1: Tech Stack Overview */}
      <h2 className={styles.guideTitle}>1. Tech Stack Overview</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          This project uses the following technologies:
        </p>

        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Technology</th>
              <th>Version</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}>React</td>
              <td className={styles.guideTableCell}>18.2</td>
              <td className={styles.guideTableCell}>UI framework with concurrent features</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Material UI (MUI)</td>
              <td className={styles.guideTableCell}>v5.15</td>
              <td className={styles.guideTableCell}>Component library</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Framer Motion</td>
              <td className={styles.guideTableCell}>v11</td>
              <td className={styles.guideTableCell}>Animations and transitions</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>React Router</td>
              <td className={styles.guideTableCell}>v7</td>
              <td className={styles.guideTableCell}>Client-side routing</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>CSS Modules</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>Scoped component styles</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Iconify (MDI)</td>
              <td className={styles.guideTableCell}>v4</td>
              <td className={styles.guideTableCell}>Icon system (Material Design Icons)</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>SweetAlert2</td>
              <td className={styles.guideTableCell}>v11</td>
              <td className={styles.guideTableCell}>Success/error alert modals</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Swiper</td>
              <td className={styles.guideTableCell}>v11</td>
              <td className={styles.guideTableCell}>Mobile carousels</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Canvas Confetti</td>
              <td className={styles.guideTableCell}>v1.9</td>
              <td className={styles.guideTableCell}>Thank You page confetti</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Web Vitals</td>
              <td className={styles.guideTableCell}>v3.5</td>
              <td className={styles.guideTableCell}>Performance monitoring</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2: Project Structure */}
      <h2 className={styles.guideTitle}>2. Project Structure</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          The complete folder structure with descriptions:
        </p>

        <pre className={styles.guideCode}>
{`├── public/
│   ├── api/                  # Server-side PHP endpoints (Meta CAPI, offline conversions)
│   ├── index.html            # Main HTML with SEO meta tags, GTM snippet, JSON-LD schemas
│   ├── manifest.json         # PWA manifest
│   ├── robots.txt            # Search engine crawl directives
│   └── sitemap.xml           # Sitemap for Google
├── src/
│   ├── admin/                # === ADMIN PANEL ===
│   │   ├── components/       # AdminLayout, AdminTopbar, AdminLogin, ProtectedRoute
│   │   ├── context/          # AdminAuthContext (login state management)
│   │   ├── pages/            # Dashboard, LeadManagement, LeadDetail, Guideline
│   │   │   └── guidelineContent/  # Tab content components for Guideline page
│   │   └── utils/            # adminAuth, leadService, googleAdsExport, leadStatus
│   ├── components/
│   │   ├── common/           # Reusable: Header, Footer, LeadForm, Button, Card, Modal, etc.
│   │   └── sections/         # Page sections: Hero, About, Services, Features, CTA, etc.
│   ├── config/               # seo.js (SEO configuration)
│   ├── context/              # ModalContext (drawer/modal state), ThemeContext
│   ├── data/                 # Content data: services, features, stats, locations
│   ├── hooks/                # Custom hooks: useGTMTracking, useInView, useMediaQuery
│   ├── pages/                # Full pages: ThankYou
│   ├── styles/               # Global CSS: variables.css, global.css, animations.css, responsive.css
│   ├── theme/                # MUI theme configuration (muiTheme.js)
│   └── utils/                # Utilities: webhookSubmit, gtm, metaPixel, googleAds, validators, etc.
├── .env                      # Environment variables (not committed to git)
├── .env.example              # Environment variable template
├── CLAUDE.md                 # AI assistant instructions
├── CUSTOMIZATION_GUIDE.md    # Step-by-step setup guide
├── GTM_GUIDE.md              # Google Tag Manager guide
├── SEO_GUIDE.md              # SEO configuration guide
└── CHANGELOG.md              # Version history`}
        </pre>
      </div>

      {/* Section 3: Local Development Setup */}
      <h2 className={styles.guideTitle}>3. Local Development Setup</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Follow these steps to get the project running locally:
        </p>

        <pre className={styles.guideCode}>
{`# 1. Clone the repository
git clone https://github.com/your-org/landing-page-boilerplate.git
cd landing-page-boilerplate

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Start development server
npm start
# Opens at http://localhost:3000

# 5. Access admin panel
# Go to http://localhost:3000/admin
# Credentials: citadmin / cit@admissions2026`}
        </pre>

        <div className={styles.guideNote}>
          <strong>Note:</strong> Make sure you have Node.js (v16+) and npm installed before starting. Edit the <code className={styles.guideInlineCode}>.env</code> file with your business details before deploying.
        </div>
      </div>

      {/* Section 4: Key Files to Modify for a New Landing Page */}
      <h2 className={styles.guideTitle}>4. Key Files to Modify for a New Landing Page</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          When creating a new landing page from this boilerplate, these are the files you need to update:
        </p>

        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>File</th>
              <th>What to Change</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>.env</code></td>
              <td className={styles.guideTableCell}>Institution name, phone, email, admin credentials</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_NAME="CIT Admissions 2026"</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/data/servicesData.js</code></td>
              <td className={styles.guideTableCell}>B.E. course cards (legacy filename — holds the 7 CIT B.E. branches)</td>
              <td className={styles.guideTableCell}>Branch name, badge, description, features</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/data/featuresData.js</code></td>
              <td className={styles.guideTableCell}>Infrastructure / "Why CIT" highlight items</td>
              <td className={styles.guideTableCell}>Labs, accreditations, campus features</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/data/statsData.js</code></td>
              <td className={styles.guideTableCell}>Placement &amp; outcome stats</td>
              <td className={styles.guideTableCell}>"25 Years", "85%+ Placement", "15 LPA"</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/data/locationData.js</code></td>
              <td className={styles.guideTableCell}>Campus address, phone, WhatsApp, nearby cities</td>
              <td className={styles.guideTableCell}>Tumakuru campus + admission office contact</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/styles/variables.css</code></td>
              <td className={styles.guideTableCell}>Brand colors (landing page only)</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>--color-primary: #0C2D48</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/theme/muiTheme.js</code></td>
              <td className={styles.guideTableCell}>MUI component colors</td>
              <td className={styles.guideTableCell}>Match with CSS variables</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/utils/webhookSubmit.js</code></td>
              <td className={styles.guideTableCell}>Leads API endpoint (server store)</td>
              <td className={styles.guideTableCell}>Usually leave default</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/config/seo.js</code></td>
              <td className={styles.guideTableCell}>SEO metadata, schemas, FAQs</td>
              <td className={styles.guideTableCell}>Your business details</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>public/index.html</code></td>
              <td className={styles.guideTableCell}>Title, meta tags, JSON-LD, GTM ID</td>
              <td className={styles.guideTableCell}>Your SEO content</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/components/sections/*</code></td>
              <td className={styles.guideTableCell}>Section content text (hardcoded in JSX)</td>
              <td className={styles.guideTableCell}>Your headlines, descriptions</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/components/common/Header/Header.jsx</code></td>
              <td className={styles.guideTableCell}>Logo URL</td>
              <td className={styles.guideTableCell}>Your logo image URL</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/components/common/Footer/Footer.jsx</code></td>
              <td className={styles.guideTableCell}>Footer links, contact, logo</td>
              <td className={styles.guideTableCell}>Your footer content</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 5: Color System */}
      <h2 className={styles.guideTitle}>5. Color System</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          This project uses a dual color system — one for the landing page (customizable per brand) and one for the admin panel (constant).
        </p>

        <h3 className={styles.guideSubtitle}>Landing Page Colors (in src/styles/variables.css)</h3>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Variable</th>
              <th>Default</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>--color-primary</code></td>
              <td className={styles.guideTableCell}>#0C2D48 (CIT Blue)</td>
              <td className={styles.guideTableCell}>Headers, primary surfaces</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>--color-secondary</code></td>
              <td className={styles.guideTableCell}>#D82618 (CIT Red)</td>
              <td className={styles.guideTableCell}>Accents, section labels, badges</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>--color-accent</code></td>
              <td className={styles.guideTableCell}>#E0301E (CTA Red)</td>
              <td className={styles.guideTableCell}>Primary CTA buttons only</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.guideParagraph}>
          Change these for each landing page's brand.
        </p>

        <h3 className={styles.guideSubtitle}>Admin Panel Colors (also in variables.css, under --admin-*)</h3>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Variable</th>
              <th>Default</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>--admin-primary</code></td>
              <td className={styles.guideTableCell}>#1A3A6B (Assam Digital deep blue)</td>
              <td className={styles.guideTableCell}>Admin panel primary</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>--admin-accent</code></td>
              <td className={styles.guideTableCell}>#2B7BD5 (Assam Digital blue)</td>
              <td className={styles.guideTableCell}>Admin panel accent</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.guideNoteWarning}>
          <strong>IMPORTANT:</strong> Admin panel colors are CONSTANT across all landing pages — do NOT change them. They represent the Assam Digital brand.
        </div>
      </div>

      {/* Section 6: Form Submission Flow */}
      <h2 className={styles.guideTitle}>6. Form Submission Flow</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          The complete flow from user form submission to tracking and redirect:
        </p>

        <pre className={styles.guideCode}>
{`Applicant fills UnifiedLeadForm → handleSubmit()
  ↓
Form validation (validators.js)
  Fields: name, mobile, email, service_interest (course), state, message
  ↓
submitLeadToWebhook() in webhookSubmit.js
  └── POST /api/leads.php?action=create  (shared server store = single source of truth)
       Server dedupes by mobile → duplicate response shown as "Already Registered"
  ↓
Tracking fires (in parallel):
  ├── GTM: trackFormSubmission() → dataLayer push (course interest, state)
  ├── Google Ads: trackFormSubmission() → gtag conversion
  ├── Meta Pixel: trackLead() → fbq('track', 'Lead')
  ├── Meta CAPI: sendLeadEvent() → POST to /api/meta-capi.php
  └── Enhanced Conversions: sendEnhancedConversionData() → hashed PII to gtag
  ↓
sessionStorage.setItem('lead_submitted', 'true')
  ↓
SweetAlert success message
  ↓
Navigate to /thank-you`}
        </pre>

        <div className={styles.guideNote}>
          <strong>Key files:</strong>{' '}
          <code className={styles.guideInlineCode}>src/components/common/UnifiedLeadForm/UnifiedLeadForm.jsx</code>,{' '}
          <code className={styles.guideInlineCode}>src/utils/webhookSubmit.js</code>,{' '}
          <code className={styles.guideInlineCode}>src/utils/validators.js</code>
        </div>
      </div>

      {/* Section 7: Admin Panel Architecture */}
      <h2 className={styles.guideTitle}>7. Admin Panel Architecture</h2>
      <div className={styles.guideSection}>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Component</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}><strong>Authentication</strong></td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>AdminAuthContext</code> with localStorage session (24hr expiry)</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><strong>Routing</strong></td>
              <td className={styles.guideTableCell}>Nested routes under <code className={styles.guideInlineCode}>/admin/*</code> via <code className={styles.guideInlineCode}>AdminLayout</code></td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><strong>Data Layer</strong></td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>leadService.js</code> — reads/writes the shared server store (<code className={styles.guideInlineCode}>/api/leads.php</code>); in-memory cache hydrated by a 15s poll</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><strong>Cross-device Sync</strong></td>
              <td className={styles.guideTableCell}>All CRUD goes to the server, so status changes, notes and deletes made on one device appear on every other device</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><strong>Guideline Page</strong></td>
              <td className={styles.guideTableCell}>Password-protected with <code className={styles.guideInlineCode}>sessionStorage</code> flag</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 8: Environment Variables Reference */}
      <h2 className={styles.guideTitle}>8. Environment Variables Reference</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Complete list of all <code className={styles.guideInlineCode}>.env</code> variables used in this project:
        </p>

        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Variable</th>
              <th>Required</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_NAME</code></td>
              <td className={styles.guideTableCell}>Yes</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>Business name displayed on the page</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_ADMIN_USERNAME</code></td>
              <td className={styles.guideTableCell}>Yes</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>citadmin</code></td>
              <td className={styles.guideTableCell}>Admin login username</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_ADMIN_PASSWORD</code></td>
              <td className={styles.guideTableCell}>Yes</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>cit@admissions2026</code></td>
              <td className={styles.guideTableCell}>Admin login password</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_SALES_PHONE</code></td>
              <td className={styles.guideTableCell}>Yes</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>Sales phone number</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_WHATSAPP_NUMBER</code></td>
              <td className={styles.guideTableCell}>Yes</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>WhatsApp number (no dashes)</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_SALES_EMAIL</code></td>
              <td className={styles.guideTableCell}>Yes</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>Sales email</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_GTM_ID</code></td>
              <td className={styles.guideTableCell}>No</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>Google Tag Manager container ID</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_GA4_MEASUREMENT_ID</code></td>
              <td className={styles.guideTableCell}>No</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>Google Analytics 4 measurement ID</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_GOOGLE_ADS_ID</code></td>
              <td className={styles.guideTableCell}>No</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>Google Ads conversion ID (AW-XXX)</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_GOOGLE_ADS_CONVERSION_LABEL</code></td>
              <td className={styles.guideTableCell}>No</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>Google Ads conversion label</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_GOOGLE_ADS_ENHANCED_CONVERSIONS</code></td>
              <td className={styles.guideTableCell}>No</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>false</code></td>
              <td className={styles.guideTableCell}>Enable enhanced conversions</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_META_PIXEL_ID</code></td>
              <td className={styles.guideTableCell}>No</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>Meta (Facebook) Pixel ID</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_META_CAPI_ENDPOINT</code></td>
              <td className={styles.guideTableCell}>No</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>/api/meta-capi.php</code></td>
              <td className={styles.guideTableCell}>Server-side CAPI endpoint</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_ENABLE_ANALYTICS</code></td>
              <td className={styles.guideTableCell}>No</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>false</code></td>
              <td className={styles.guideTableCell}>Master switch for all analytics</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_ENABLE_CONSENT_MODE</code></td>
              <td className={styles.guideTableCell}>No</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>false</code></td>
              <td className={styles.guideTableCell}>Google Consent Mode v2</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_HERO_VIDEO_URL</code></td>
              <td className={styles.guideTableCell}>No</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>Hero background video URL</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_LEADS_API_URL</code></td>
              <td className={styles.guideTableCell}>Yes (for Admin Panel)</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>/api/leads.php</code></td>
              <td className={styles.guideTableCell}>Path/URL to the shared leads storage endpoint</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>REACT_APP_LEADS_ADMIN_KEY</code></td>
              <td className={styles.guideTableCell}>Yes (for Admin Panel)</td>
              <td className={styles.guideTableCell}>—</td>
              <td className={styles.guideTableCell}>
                Shared secret that must match <code className={styles.guideInlineCode}>ADMIN_API_KEY</code> in <code className={styles.guideInlineCode}>public/api/config.php</code>. Protects list/update/delete endpoints.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 9: DO NOT MODIFY List */}
      <h2 className={styles.guideTitle}>9. DO NOT MODIFY List</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          These files and features should not be changed when customizing for a new landing page:
        </p>

        <ul className={styles.guideList}>
          <li className={styles.guideListItem}>Component structure and layout patterns</li>
          <li className={styles.guideListItem}>Animation system (Framer Motion variants)</li>
          <li className={styles.guideListItem}>Form validation logic (<code className={styles.guideInlineCode}>validators.js</code>)</li>
          <li className={styles.guideListItem}>Lead submission flow (<code className={styles.guideInlineCode}>webhookSubmit.js</code> — posts to the server store; usually leave as-is)</li>
          <li className={styles.guideListItem}>SweetAlert configuration (<code className={styles.guideInlineCode}>swalHelper.js</code>)</li>
          <li className={styles.guideListItem}>Mobile navigation mechanics (<code className={styles.guideInlineCode}>MobileNavigation</code>, <code className={styles.guideInlineCode}>MobileDrawer</code>)</li>
          <li className={styles.guideListItem}>Drawer/modal behavior (<code className={styles.guideInlineCode}>ModalContext</code>)</li>
          <li className={styles.guideListItem}>Video background system</li>
          <li className={styles.guideListItem}>Admin panel theme (Assam Digital branding is constant)</li>
          <li className={styles.guideListItem}>Guideline page content (constant across all landing pages)</li>
        </ul>

        <div className={styles.guideNoteWarning}>
          <strong>Warning:</strong> Modifying these core files may break functionality across all landing pages built from this boilerplate. If changes are needed, create new components instead of modifying existing ones.
        </div>
      </div>

      {/* Section 10: Useful Commands */}
      <h2 className={styles.guideTitle}>10. Useful Commands</h2>
      <div className={styles.guideSection}>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Command</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>npm start</code></td>
              <td className={styles.guideTableCell}>Start dev server (localhost:3000)</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>npm run build</code></td>
              <td className={styles.guideTableCell}>Production build → build/ folder</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>npm run test</code></td>
              <td className={styles.guideTableCell}>Run tests</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>npm run analyze</code></td>
              <td className={styles.guideTableCell}>Bundle size analysis (run after build)</td>
            </tr>
          </tbody>
        </table>

        <pre className={styles.guideCode}>
{`npm start          # Start dev server (localhost:3000)
npm run build      # Production build → build/ folder
npm run test       # Run tests
npm run analyze    # Bundle size analysis (run after build)`}
        </pre>
      </div>
    </div>
  );
};

export default DeveloperGuide;
