import React from 'react';

const SEOSetupGuide = ({ styles }) => {
  return (
    <div>
      {/* Section 1: What is SEO? */}
      <h2 className={styles.guideTitle}>1. What is SEO?</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          SEO (Search Engine Optimization) helps your landing page appear in Google search results when people search for your services. Good SEO means more free traffic without paying for ads.
        </p>
        <p className={styles.guideParagraph}>
          For a landing page, the most important SEO tasks are: setting the right title/description, adding structured data (JSON-LD), and submitting your sitemap to Google.
        </p>
      </div>

      {/* Section 2: Update Page Title & Description */}
      <h2 className={styles.guideTitle}>2. Update Page Title & Description</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          <strong>Where:</strong> <code className={styles.guideInlineCode}>public/index.html</code>
        </p>

        <h3 className={styles.guideSubtitle}>Update the Title Tag</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Find line ~171: <code className={styles.guideInlineCode}>{`<title>Your Business Name | Landing Page</title>`}</code>
          </li>
          <li className={styles.guideStepItem}>
            Replace with your actual title (keep under 60 characters)
          </li>
          <li className={styles.guideStepItem}>
            Example:
            <pre className={styles.guideCode}>
{`<title>Best Hair Transplant in Guwahati | Monjoven</title>`}
            </pre>
          </li>
        </ol>

        <h3 className={styles.guideSubtitle}>Update the Meta Description</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Find line ~51: <code className={styles.guideInlineCode}>{`<meta name="description" content="...">`}</code>
          </li>
          <li className={styles.guideStepItem}>
            Replace with your actual description (keep under 160 characters)
          </li>
          <li className={styles.guideStepItem}>
            Example:
            <pre className={styles.guideCode}>
{`<meta name="description" content="Advanced hair transplant & cosmetic surgery in Guwahati by Dr. Porag Neog. FUE technique, natural results. Book consultation!">`}
            </pre>
          </li>
        </ol>

        <div className={styles.guideTip}>
          <strong>Tips:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '4px' }}>Title should include your primary keyword + brand name</li>
            <li style={{ marginBottom: '4px' }}>Description should include a call-to-action ("Apply now", "Contact us")</li>
            <li>Don't stuff keywords — write naturally</li>
          </ul>
        </div>
      </div>

      {/* Section 3: Update Open Graph Image */}
      <h2 className={styles.guideTitle}>3. Update Open Graph Image</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          <strong>What it is:</strong> The image that appears when your page is shared on Facebook, LinkedIn, WhatsApp, or Google Discover.
        </p>

        <h3 className={styles.guideSubtitle}>Requirements</h3>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li className={styles.guideStepItem}>Size: 1200×630 pixels</li>
          <li className={styles.guideStepItem}>File size: Less than 1MB</li>
          <li className={styles.guideStepItem}>Format: JPG or PNG</li>
        </ul>

        <h3 className={styles.guideSubtitle}>Steps</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Save the image in the <code className={styles.guideInlineCode}>public/</code> folder (e.g., <code className={styles.guideInlineCode}>public/og-image.jpg</code>)
          </li>
          <li className={styles.guideStepItem}>
            Update in <code className={styles.guideInlineCode}>public/index.html</code>:
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '4px' }}>
                Line ~76: <code className={styles.guideInlineCode}>{`<meta property="og:image" content="https://landing.monjoven.com/og-image.jpg">`}</code>
              </li>
              <li style={{ marginBottom: '4px' }}>
                Line ~99: <code className={styles.guideInlineCode}>{`<meta name="twitter:image" content="https://landing.monjoven.com/og-image.jpg">`}</code>
              </li>
            </ul>
          </li>
          <li className={styles.guideStepItem}>
            Also update <code className={styles.guideInlineCode}>defaultImage</code> in <code className={styles.guideInlineCode}>src/config/seo.js</code>
          </li>
        </ol>

        <div className={styles.guideTip}>
          <strong>Tip:</strong> Use Canva (free) to create your OG image. Template size: 1200×630px. Include your logo, tagline, and a compelling image.
        </div>
      </div>

      {/* Section 4: Update JSON-LD Schemas */}
      <h2 className={styles.guideTitle}>4. Update JSON-LD Schemas</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          <strong>What it is:</strong> Structured data that helps Google understand what your page is about. It can enable rich results in search (like FAQ dropdowns, business info panels).
        </p>
        <p className={styles.guideParagraph}>
          <strong>Where to update:</strong> <code className={styles.guideInlineCode}>src/config/seo.js</code> — this is the main configuration file.
        </p>

        <h3 className={styles.guideSubtitle}>Key Things to Update in seo.js</h3>
        <pre className={styles.guideCode}>
{`// Organization details
organization.name       → Your company's legal name
organization.url        → https://landing.monjoven.com
organization.logo       → URL to your logo image
organization.phone      → +91-9181956562
organization.email      → dr@monjoven.com
organization.address    → Guwahati, Assam, India

// FAQ section
faqs                    → Replace with your actual FAQs (5-8 questions)

// Local business
localBusiness.type      → "MedicalBusiness" or "Physician"
localBusiness.priceRange → "$$", "$$$", etc.
localBusiness.openingHours → Your actual hours
localBusiness.geo       → Your latitude and longitude (get from Google Maps)`}
        </pre>

        <h3 className={styles.guideSubtitle}>How to Get Latitude & Longitude from Google Maps</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>Go to Google Maps</li>
          <li className={styles.guideStepItem}>Right-click on your location</li>
          <li className={styles.guideStepItem}>Click the coordinates that appear — they're copied to clipboard</li>
          <li className={styles.guideStepItem}>First number is latitude, second is longitude</li>
        </ol>
      </div>

      {/* Section 5: Submit Sitemap to Google Search Console */}
      <h2 className={styles.guideTitle}>5. Submit Sitemap to Google Search Console</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Before submitting, update <code className={styles.guideInlineCode}>public/sitemap.xml</code>:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li className={styles.guideStepItem}>
            Replace <code className={styles.guideInlineCode}>https://landing.monjoven.com/</code> with your actual domain
          </li>
          <li className={styles.guideStepItem}>
            Update the <code className={styles.guideInlineCode}>{`<lastmod>`}</code> date to today's date
          </li>
        </ul>

        <h3 className={styles.guideSubtitle}>Steps to Submit</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Go to <strong>https://search.google.com/search-console</strong>
          </li>
          <li className={styles.guideStepItem}>
            Click <strong>"Add Property"</strong> → <strong>"URL prefix"</strong> → enter your domain
          </li>
          <li className={styles.guideStepItem}>
            Verify ownership (easiest: upload the HTML verification file to your <code className={styles.guideInlineCode}>public/</code> folder)
          </li>
          <li className={styles.guideStepItem}>
            After verification, go to <strong>"Sitemaps"</strong> in the left menu
          </li>
          <li className={styles.guideStepItem}>
            Enter <code className={styles.guideInlineCode}>sitemap.xml</code> and click <strong>"Submit"</strong>
          </li>
          <li className={styles.guideStepItem}>
            Google will now know about your page and start indexing it
          </li>
        </ol>
      </div>

      {/* Section 6: Update robots.txt */}
      <h2 className={styles.guideTitle}>6. Update robots.txt</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Open <code className={styles.guideInlineCode}>public/robots.txt</code>
          </li>
          <li className={styles.guideStepItem}>
            Replace <code className={styles.guideInlineCode}>https://landing.monjoven.com/sitemap.xml</code> with your actual domain
          </li>
          <li className={styles.guideStepItem}>
            The file already blocks <code className={styles.guideInlineCode}>/admin/</code> and <code className={styles.guideInlineCode}>/thank-you</code> from being indexed — don't change these
          </li>
        </ol>
      </div>

      {/* Section 7: Performance SEO (Already Handled) */}
      <h2 className={styles.guideTitle}>7. Performance SEO (Already Handled)</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          The landing page boilerplate already includes these performance optimizations — no action needed:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li className={styles.guideStepItem}>Lazy loading of below-the-fold sections</li>
          <li className={styles.guideStepItem}>Font preloading</li>
          <li className={styles.guideStepItem}>Image lazy loading</li>
          <li className={styles.guideStepItem}>Core Web Vitals monitoring</li>
          <li className={styles.guideStepItem}>Preconnect hints for external resources</li>
          <li className={styles.guideStepItem}>Code splitting for smaller bundle sizes</li>
        </ul>

        <div className={styles.guideNote}>
          <strong>Note:</strong> After deployment, test your page with Google Lighthouse (Chrome DevTools → Lighthouse tab). Aim for a 90+ SEO score.
        </div>
      </div>

      {/* Section 8: Quick SEO Checklist */}
      <h2 className={styles.guideTitle}>8. Quick SEO Checklist</h2>
      <div className={styles.guideSection}>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Item</th>
              <th>File</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}>Title tag updated (&lt; 60 chars)</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>index.html</code> line ~171</td>
              <td className={styles.guideTableCell}>☐</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Meta description (&lt; 160 chars)</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>index.html</code> line ~51</td>
              <td className={styles.guideTableCell}>☐</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>OG image created (1200×630)</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>public/og-image.jpg</code></td>
              <td className={styles.guideTableCell}>☐</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>OG tags updated</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>index.html</code> lines ~65-84</td>
              <td className={styles.guideTableCell}>☐</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>JSON-LD schemas updated</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>src/config/seo.js</code></td>
              <td className={styles.guideTableCell}>☐</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Canonical URL set</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>index.html</code> line ~105</td>
              <td className={styles.guideTableCell}>☐</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>robots.txt</code> domain updated</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>public/robots.txt</code></td>
              <td className={styles.guideTableCell}>☐</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>sitemap.xml</code> domain updated</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>public/sitemap.xml</code></td>
              <td className={styles.guideTableCell}>☐</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Submitted to Google Search Console</td>
              <td className={styles.guideTableCell}>Online</td>
              <td className={styles.guideTableCell}>☐</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Lighthouse SEO score &gt; 90</td>
              <td className={styles.guideTableCell}>Chrome DevTools</td>
              <td className={styles.guideTableCell}>☐</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SEOSetupGuide;
