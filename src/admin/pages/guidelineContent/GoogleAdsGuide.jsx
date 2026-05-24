import React from 'react';

const GoogleAdsGuide = ({ styles }) => {
  return (
    <div>
      {/* Section 1: What is Google Ads? */}
      <h2 className={styles.guideTitle}>What is Google Ads?</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Google Ads is Google's online advertising platform that lets you show ads to people who are
          actively searching for your products or services. When someone searches for your service on
          Google, your ad appears at the top of the results. You only pay when someone clicks on your
          ad and visits your landing page.
        </p>
        <p className={styles.guideParagraph}>
          There are several types of Google Ads campaigns (Search, Display, Video, Shopping, etc.),
          but Search campaigns are the most relevant for lead generation landing pages. With Search
          campaigns, your ads appear when people type specific keywords into Google — meaning they
          already have intent and are actively looking for what you offer.
        </p>
      </div>

      {/* Section 2: Create Your Google Ads Account */}
      <h2 className={styles.guideTitle}>Create Your Google Ads Account</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Go to <code className={styles.guideInlineCode}>https://ads.google.com</code>
          </li>
          <li className={styles.guideStepItem}>
            Click "Start Now" and sign in with your Google account
          </li>
          <li className={styles.guideStepItem}>
            Google will try to guide you through a "Smart Campaign" — skip this by clicking
            "Switch to Expert Mode" at the bottom
          </li>
          <li className={styles.guideStepItem}>
            Select "Create an account without a campaign" (bottom-left link)
          </li>
          <li className={styles.guideStepItem}>
            Set your billing country (India), time zone, and currency (INR). Click Submit.
          </li>
        </ol>
        <div className={styles.guideNote}>
          <strong>Note:</strong> Always choose Expert Mode. Smart Campaigns give you very little
          control over targeting and budget.
        </div>
      </div>

      {/* Section 3: Create a Search Campaign */}
      <h2 className={styles.guideTitle}>Create a Search Campaign</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            In your Google Ads dashboard, click "+ New Campaign"
          </li>
          <li className={styles.guideStepItem}>Select goal: "Leads"</li>
          <li className={styles.guideStepItem}>Select campaign type: "Search"</li>
          <li className={styles.guideStepItem}>
            Campaign name: something descriptive like{' '}
            <code className={styles.guideInlineCode}>Monjoven - Hair Transplant - Guwahati</code>
          </li>
          <li className={styles.guideStepItem}>
            Networks: Uncheck "Display Network" and "Search Partners" (focus budget on Google
            Search only)
          </li>
          <li className={styles.guideStepItem}>
            Locations: Set to your target city or region. Use "Presence: People in or regularly in
            your targeted locations"
          </li>
          <li className={styles.guideStepItem}>Language: English (or your target language)</li>
          <li className={styles.guideStepItem}>
            Budget: Start with ₹500-1000/day for testing. You can always increase later.
          </li>
        </ol>
        <div className={styles.guideTip}>
          <strong>Tip:</strong> Don't set your budget too low (below ₹300/day). Google needs enough
          budget to show your ads and collect data for optimization.
        </div>
      </div>

      {/* Section 4: Keywords & Ad Groups */}
      <h2 className={styles.guideTitle}>Keywords & Ad Groups</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Keywords are the words and phrases that trigger your ad to show up. When someone types a
          keyword into Google that matches one of your keywords, your ad is eligible to appear. Choosing
          the right keywords is one of the most important parts of running Google Ads.
        </p>

        <h3 className={styles.guideSubtitle}>How to Research Keywords</h3>
        <p className={styles.guideParagraph}>
          Use Google Keyword Planner (free with your Google Ads account) to find relevant keywords.
          To access it: go to your Google Ads dashboard → click "Tools" in the top menu → select
          "Keyword Planner" under Planning. Enter a few words related to your service and it will
          suggest keywords along with their monthly search volume and competition level.
        </p>

        <h3 className={styles.guideSubtitle}>Example Keywords</h3>
        <p className={styles.guideParagraph}>
          For Monjoven Hair Transplant & Cosmetic Surgery, your keywords might look like:
        </p>
        <pre className={styles.guideCode}>
{`"best hair transplant in guwahati"
"hair transplant near me"
"hair transplant cost guwahati"
"fue hair transplant assam"
"rhinoplasty guwahati"
"cosmetic surgery guwahati"
"prp hair treatment guwahati"`}
        </pre>

        <h3 className={styles.guideSubtitle}>Match Types</h3>
        <p className={styles.guideParagraph}>
          Google Ads has three keyword match types that control how closely a user's search query
          must match your keyword:
        </p>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Match Type</th>
              <th>Syntax</th>
              <th>Example</th>
              <th>What It Matches</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}>Broad Match</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>plumber delhi</code></td>
              <td className={styles.guideTableCell}>plumber delhi</td>
              <td className={styles.guideTableCell}>Related searches, synonyms, misspellings — widest reach but least control</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Phrase Match</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>"plumber delhi"</code></td>
              <td className={styles.guideTableCell}>"plumber delhi"</td>
              <td className={styles.guideTableCell}>Searches that include the meaning of your keyword — good balance</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Exact Match</td>
              <td className={styles.guideTableCell}><code className={styles.guideInlineCode}>[plumber delhi]</code></td>
              <td className={styles.guideTableCell}>[plumber delhi]</td>
              <td className={styles.guideTableCell}>Searches that match the exact meaning — most control but lowest reach</td>
            </tr>
          </tbody>
        </table>
        <div className={styles.guideTip}>
          <strong>Recommendation:</strong> Start with Phrase Match for the best balance between reach
          and relevance. Once you have data, add Exact Match for your best-performing keywords.
        </div>

        <h3 className={styles.guideSubtitle}>Negative Keywords</h3>
        <p className={styles.guideParagraph}>
          Negative keywords prevent your ad from showing for irrelevant searches. For example, if you
          offer paid services, you don't want your ad showing when someone searches "free plumber."
          Common negative keywords to add:
        </p>
        <pre className={styles.guideCode}>
{`free
jobs
salary
recruitment
hiring
course
training
how to
DIY
Wikipedia`}
        </pre>
      </div>

      {/* Section 5: Writing Effective Ads */}
      <h2 className={styles.guideTitle}>Writing Effective Ads</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Google Ads uses Responsive Search Ads (RSA). You provide multiple headlines and descriptions,
          and Google automatically tests different combinations to find what works best. You can add up
          to 15 headlines (30 characters each) and up to 4 descriptions (90 characters each).
        </p>

        <h3 className={styles.guideSubtitle}>Example Headlines</h3>
        <pre className={styles.guideCode}>
{`Best Hair Transplant in Guwahati
FUE Hair Transplant by Dr. Neog
Book Consultation Today
Hair Transplant Starting at ₹40,000
#1 Cosmetic Surgery in Assam
Natural-Looking Hair Restoration`}
        </pre>

        <h3 className={styles.guideSubtitle}>Example Descriptions</h3>
        <pre className={styles.guideCode}>
{`Looking for hair transplant in Guwahati? Get a consultation with Dr. Porag Neog. Advanced FUE technique. Book now!
Professional hair transplant & cosmetic surgery at Monjoven. Natural results guaranteed. Limited consultation slots available.`}
        </pre>

        <h3 className={styles.guideSubtitle}>Tips for Better Ads</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>Include your unique selling points (Dr. Neog's expertise, FUE technique, natural results)</li>
          <li className={styles.guideStepItem}>Use numbers and statistics ("1000+ procedures", "10+ years experience")</li>
          <li className={styles.guideStepItem}>Include a clear call-to-action ("Book Consultation", "Call Now", "Get Expert Advice")</li>
          <li className={styles.guideStepItem}>Include your target keyword in at least 2-3 headlines</li>
          <li className={styles.guideStepItem}>Write at least 10 headlines and 4 descriptions for best results</li>
        </ol>

        <h3 className={styles.guideSubtitle}>Ad Extensions</h3>
        <p className={styles.guideParagraph}>
          Ad extensions add extra information below your ad and improve click-through rates:
        </p>
        <table className={styles.guideTable}>
          <thead className={styles.guideTableHead}>
            <tr>
              <th>Extension</th>
              <th>What It Does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.guideTableCell}>Sitelinks</td>
              <td className={styles.guideTableCell}>Additional links below your ad (e.g., "Hair Transplant", "Rhinoplasty", "Contact Us")</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Callouts</td>
              <td className={styles.guideTableCell}>Short highlight phrases (e.g., "Consultation", "Advanced FUE", "Natural Results")</td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Structured Snippets</td>
              <td className={styles.guideTableCell}>List of services under a category header (e.g., "Services: Hair Transplant, Rhinoplasty, PRP Therapy, Liposuction")</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 6: Set Up Conversion Tracking */}
      <h2 className={styles.guideTitle}>Set Up Conversion Tracking</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Conversion tracking tells Google Ads when someone submits a form on your landing page after
          clicking your ad. This is essential for measuring ROI and letting Google optimize your
          campaigns.
        </p>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            In Google Ads, go to "Goals" → "Conversions" → "Summary"
          </li>
          <li className={styles.guideStepItem}>Click "+ New conversion action"</li>
          <li className={styles.guideStepItem}>Select "Website"</li>
          <li className={styles.guideStepItem}>Category: "Submit lead form"</li>
          <li className={styles.guideStepItem}>
            Conversion name: <code className={styles.guideInlineCode}>Lead Form Submission</code>
          </li>
          <li className={styles.guideStepItem}>
            Value: "Don't use a value" (or set a fixed value like ₹500 if you know your average lead
            value)
          </li>
          <li className={styles.guideStepItem}>Count: "One" (count one conversion per click)</li>
          <li className={styles.guideStepItem}>Click-through window: 30 days</li>
          <li className={styles.guideStepItem}>Click "Create and Continue"</li>
          <li className={styles.guideStepItem}>
            You'll see a Conversion ID (format:{' '}
            <code className={styles.guideInlineCode}>AW-XXXXXXXXXX</code>) and Conversion Label —
            copy both
          </li>
        </ol>

        <h3 className={styles.guideSubtitle}>Where to Put These Values</h3>
        <p className={styles.guideParagraph}>
          Open the <code className={styles.guideInlineCode}>.env</code> file in your project root and set
          the following values:
        </p>
        <pre className={styles.guideCode}>
{`REACT_APP_GOOGLE_ADS_ID=AW-XXXXXXXXXX
REACT_APP_GOOGLE_ADS_CONVERSION_LABEL=YourLabel
REACT_APP_ENABLE_ANALYTICS=true`}
        </pre>
        <div className={styles.guideNote}>
          <strong>Note:</strong> The landing page code already has built-in conversion tracking. Once
          you set these values in <code className={styles.guideInlineCode}>.env</code>, conversions
          will be tracked automatically when someone submits a form.
        </div>
      </div>

      {/* Section 7: Enhanced Conversions (Optional) */}
      <h2 className={styles.guideTitle}>Enhanced Conversions (Optional)</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Enhanced Conversions sends hashed (encrypted) user data to Google for better conversion
          matching. This is especially useful when cookies are blocked by browsers, as it helps Google
          accurately attribute conversions even without cookie data.
        </p>
        <p className={styles.guideParagraph}>
          To enable Enhanced Conversions, set the following in your{' '}
          <code className={styles.guideInlineCode}>.env</code> file:
        </p>
        <pre className={styles.guideCode}>
{`REACT_APP_GOOGLE_ADS_ENHANCED_CONVERSIONS=true`}
        </pre>
        <p className={styles.guideParagraph}>
          When a user submits a form, their data (email, phone number) is SHA-256 hashed before being
          sent to Google. Google never sees the plain text — only the encrypted hash. This ensures
          user privacy while still allowing Google to match conversions accurately.
        </p>
      </div>

      {/* Section 8: Offline Conversion Import */}
      <h2 className={styles.guideTitle}>Offline Conversion Import</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          When a lead actually becomes a customer, you can tell Google Ads about it so it can find
          more customers like them. This is called "offline conversion import" and it significantly
          improves Google's ability to optimize your campaigns for quality leads.
        </p>

        <h3 className={styles.guideSubtitle}>How It Works</h3>
        <p className={styles.guideParagraph}>
          A GCLID (Google Click ID) is automatically captured when someone clicks your ad. This unique
          ID links each lead back to the specific ad click that generated it. When you mark a lead as
          "converted" in the admin panel, the GCLID is included in the export file.
        </p>

        <h3 className={styles.guideSubtitle}>Steps to Export</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Go to Admin Panel → Lead Management
          </li>
          <li className={styles.guideStepItem}>Mark the lead as "Converted"</li>
          <li className={styles.guideStepItem}>Click "Export for Google Ads" to download the CSV file</li>
        </ol>

        <h3 className={styles.guideSubtitle}>Steps to Upload</h3>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>Go to Google Ads → Tools → Conversions → Uploads</li>
          <li className={styles.guideStepItem}>Upload the CSV file</li>
        </ol>
        <div className={styles.guideNote}>
          <strong>Note:</strong> Only leads that have a GCLID (i.e., leads that came from a Google Ads
          click) can be uploaded. Leads from organic traffic or other sources won't have a GCLID.
        </div>
      </div>

      {/* Section 9: Verifying Conversions Work */}
      <h2 className={styles.guideTitle}>Verifying Conversions Work</h2>
      <div className={styles.guideSection}>
        <p className={styles.guideParagraph}>
          Follow this checklist to verify that conversion tracking is working correctly:
        </p>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Enable Google Ads in <code className={styles.guideInlineCode}>.env</code> (set ID and Label)
          </li>
          <li className={styles.guideStepItem}>Deploy or run locally</li>
          <li className={styles.guideStepItem}>
            Click your ad (or add{' '}
            <code className={styles.guideInlineCode}>?gclid=test123</code> to the URL for testing)
          </li>
          <li className={styles.guideStepItem}>Fill and submit a form</li>
          <li className={styles.guideStepItem}>
            Check Google Ads → Conversions → should show "Recording" status within 24 hours
          </li>
          <li className={styles.guideStepItem}>
            Check browser console → look for{' '}
            <code className={styles.guideInlineCode}>gtag</code> conversion event
          </li>
          <li className={styles.guideStepItem}>
            Check localStorage:{' '}
            <code className={styles.guideInlineCode}>localStorage.getItem('gads_gclid')</code> should
            show your test gclid
          </li>
        </ol>
      </div>

      {/* Section 10: Tips for Better Performance */}
      <h2 className={styles.guideTitle}>Tips for Better Performance</h2>
      <div className={styles.guideSection}>
        <ol className={styles.guideStepList}>
          <li className={styles.guideStepItem}>
            Start with a small budget (₹500-1000/day) and increase after 2 weeks of data
          </li>
          <li className={styles.guideStepItem}>
            Use phrase match keywords initially, then add exact match for best performers
          </li>
          <li className={styles.guideStepItem}>
            Write at least 10 headlines and 4 descriptions for RSA ads
          </li>
          <li className={styles.guideStepItem}>
            Check search terms report weekly — add irrelevant terms as negative keywords
          </li>
          <li className={styles.guideStepItem}>
            Set up ad scheduling if your sales team only works certain hours
          </li>
          <li className={styles.guideStepItem}>
            Use location targeting to focus on your service area
          </li>
          <li className={styles.guideStepItem}>
            Don't change too many things at once — make one change, wait a week, evaluate
          </li>
        </ol>
      </div>

      {/* Section 11: Troubleshooting */}
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
              <td className={styles.guideTableCell}>Conversions not showing in Google Ads</td>
              <td className={styles.guideTableCell}>
                Wait 24-48 hours. Verify AW-ID and label in{' '}
                <code className={styles.guideInlineCode}>.env</code>. Check that{' '}
                <code className={styles.guideInlineCode}>REACT_APP_ENABLE_ANALYTICS=true</code>.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>GCLID not being captured</td>
              <td className={styles.guideTableCell}>
                Make sure auto-tagging is ON in Google Ads (Settings → Account Settings →
                Auto-tagging).
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Low click-through rate (CTR)</td>
              <td className={styles.guideTableCell}>
                Improve ad headlines. Include specific numbers and benefits. Test different
                descriptions.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>High cost per lead</td>
              <td className={styles.guideTableCell}>
                Add negative keywords. Narrow location targeting. Improve ad relevance with better
                keywords.
              </td>
            </tr>
            <tr>
              <td className={styles.guideTableCell}>Ads not showing</td>
              <td className={styles.guideTableCell}>
                Check budget, bids, and approval status. New accounts may take 24 hours for review.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GoogleAdsGuide;
