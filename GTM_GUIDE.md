# Google Tag Manager (GTM) Setup Guide

## 1. Overview

This codebase uses Google Tag Manager as the central hub for all tracking tags — GA4, Google Ads conversions, and Meta Pixel. Instead of hardcoding tracking scripts, all user interaction events are pushed to `window.dataLayer`, which GTM picks up and routes to the appropriate platform.

Key files involved:
- **`public/index.html`** — GTM container snippet (head + noscript fallback)
- **`src/utils/gtm.js`** — Helper functions that push events to `dataLayer`
- **`src/hooks/useGTMTracking.js`** — React hook for automatic engagement tracking (scroll, time, section views)

All tracking is gated behind `REACT_APP_ENABLE_ANALYTICS=true` in `.env`.

---

## 2. GTM Setup

1. Create a GTM account and container at [tagmanager.google.com](https://tagmanager.google.com)
2. Copy your container ID (format: `GTM-XXXXXXX`)
3. Open `public/index.html` and replace `GTM-XXXXXXX` with your container ID in two places:
   - **Line ~7** — `<script>` tag in `<head>`
   - **Line ~635** — `<noscript>` iframe in `<body>`
4. Set in `.env`:
   ```
   REACT_APP_ENABLE_ANALYTICS=true
   REACT_APP_GTM_ID=GTM-XXXXXXX
   ```
5. Deploy and verify using **GTM Preview mode** (click "Preview" in GTM workspace, enter your site URL)
6. Confirm `dataLayer` is populated by running `window.dataLayer` in browser console

---

## 3. DataLayer Events Reference

Every event the codebase pushes to `window.dataLayer`:

| Event Name | When It Fires | Key Parameters | File & Line |
|---|---|---|---|
| `virtual_pageview` | Route change | `page_path`, `page_title` | `src/utils/gtm.js:59` |
| `lead_form_submission` | Form submitted | `formSource`, `serviceInterest` | `src/utils/gtm.js:71` |
| `generate_lead` | Form submitted (GA4 format) | `currency`, `value`, `lead_source`, `method` | `src/utils/gtm.js:77` |
| `cta_click` | CTA button clicked | `cta_name`, `cta_location`, `cta_text` | `src/utils/gtm.js:92` |
| `phone_click` | Phone number clicked | `phone_number`, `click_location` | `src/utils/gtm.js:105` |
| `whatsapp_click` | WhatsApp link clicked | `click_location` | `src/utils/gtm.js:116` |
| `scroll_depth` | User scrolls past milestone | `scroll_percentage` (25, 50, 75, 100) | `src/utils/gtm.js:126` |
| `time_on_page` | Time milestone reached | `time_seconds` (30, 60, 120, 300), `time_label` | `src/utils/gtm.js:136` |
| `section_view` | Section enters viewport (30%) | `section_id` | `src/utils/gtm.js:147` |
| `navigation` | Nav interaction | `nav_type`, `nav_action`, `nav_label` | `src/utils/gtm.js:159` |
| `page_visibility` | Tab focus/blur | `visibility_state` | `src/utils/gtm.js:171` |
| `form_field_focus` | Form field focused | `form_id`, `field_name` | `src/utils/gtm.js:182` |
| `enhanced_conversion_data` | Form submitted (hashed PII) | `email`, `phone_number`, `first_name`, `last_name` | `src/utils/enhancedConversions.js:112` |

**Auto-tracked by `useGTMTracking` hook** (`src/hooks/useGTMTracking.js`):
- `virtual_pageview` — on route change (line 45)
- `scroll_depth` — at 25/50/75/100% milestones (line 51)
- `time_on_page` — at 30/60/120/300s (line 74)
- `section_view` — via IntersectionObserver on 9 sections (line 91)

Tracked sections: `home`, `about`, `services`, `highlights`, `features`, `location`, `cta`, `contact`, `secondary-cta`

---

## 4. GA4 Setup via GTM

### Config Tag
1. In GTM, create a new tag: **Google Analytics: GA4 Configuration**
2. Set Measurement ID: your `G-XXXXXXXXXX` (also set `REACT_APP_GA4_MEASUREMENT_ID` in `.env`)
3. Trigger: **All Pages**
4. Save and publish

### Event Tag for Lead Conversions
1. Create tag: **Google Analytics: GA4 Event**
2. Configuration Tag: select your GA4 Config tag
3. Event Name: `generate_lead`
4. Event Parameters (map from dataLayer):
   | Parameter Name | Value |
   |---|---|
   | `currency` | `{{dlv - currency}}` |
   | `value` | `{{dlv - value}}` |
   | `lead_source` | `{{dlv - lead_source}}` |
   | `method` | `{{dlv - method}}` |
5. Create **Data Layer Variables** in GTM for each parameter above (Variable Type: Data Layer Variable)
6. Trigger: **Custom Event** where Event Name equals `generate_lead`

### Optional Event Tags
Create additional GA4 Event tags for: `cta_click`, `phone_click`, `whatsapp_click`, `scroll_depth`, `section_view` using the same pattern — Custom Event trigger matching the event name.

---

## 5. Google Ads Conversion Setup

### Step 1: Create Conversion Action
1. In Google Ads, go to **Tools > Conversions > New conversion action**
2. Choose **Website**, set category to **Submit lead form**
3. Copy the **Conversion ID** (`AW-XXXXXXXXXX`) and **Conversion Label**

### Step 2: Configure Environment
```env
REACT_APP_GOOGLE_ADS_ID=AW-XXXXXXXXXX
REACT_APP_GOOGLE_ADS_CONVERSION_LABEL=AbCdEfGhIjKlMn
REACT_APP_GOOGLE_ADS_CONVERSION_VALUE=0
```

### Method A: Via GTM (Recommended)
1. Create tag: **Google Ads Conversion Tracking**
2. Conversion ID: `AW-XXXXXXXXXX`
3. Conversion Label: your label
4. Trigger: **Custom Event** where Event Name equals `generate_lead`

### Method B: Direct (Built-in)
The codebase fires conversions directly via `src/utils/googleAds.js`:
- `initGoogleAds()` (line 15) — loads `gtag.js` and configures the Ads ID
- `trackConversion()` (line 49) — fires `window.gtag('event', 'conversion', {...})`
- `trackFormSubmission()` (line 90) — fires conversion with callback on form submit
- `trackPhoneConversion()` (line 72) — fires on phone link clicks

### Enhanced Conversions
Sends hashed (SHA-256) user data for better conversion matching.

1. Enable in `.env`:
   ```
   REACT_APP_GOOGLE_ADS_ENHANCED_CONVERSIONS=true
   ```
2. Flow (`src/utils/enhancedConversions.js`):
   - `hashUserData()` (line 32) — hashes email, phone, name via `crypto.subtle`
   - `sendEnhancedConversion()` (line 57) — pushes hashed data via `gtag('set', ...)`
   - `sendEnhancedConversionData()` (line 102) — orchestrates hash + push to dataLayer
3. GTM receives `enhanced_conversion_data` event with `sha256_email_address`, `sha256_phone_number`, etc.
4. In GTM, enable Enhanced Conversions on your Google Ads Conversion tag and map the variables

---

## 6. Google Ads Offline Conversions

Offline conversions let you report back to Google Ads when a lead actually converts (e.g., becomes a paying customer), improving Smart Bidding optimization.

### How GCLID is Captured
`src/utils/gclidManager.js` handles the full lifecycle:
- `captureGclid()` (line 16) — extracts `gclid` from URL params on page load, stores in `localStorage`
- `getStoredGclid()` (line 37) — retrieves stored gclid, validates 90-day expiry
- `associateGclidWithLead()` (line 68) — links gclid to a specific lead ID in localStorage

### Uploading Conversions
1. Export leads from your Admin LMS as CSV
2. CSV format required by Google Ads:

   | Google Click ID | Conversion Name | Conversion Time | Conversion Value | Currency |
   |---|---|---|---|---|
   | `EAIaIQob...` | `Lead Converted` | `2024-01-15 14:30:00` | `5000` | `INR` |

3. Upload via **Google Ads > Tools > Conversions > Uploads**
4. Alternatively, use the API endpoint at `public/api/google-offline-conversions.php` (requires OAuth2 credentials — see lines 29-37 for config)

---

## 7. Meta Pixel Setup

### Configuration
Set in `.env`:
```env
REACT_APP_META_PIXEL_ID=123456789012345
```

### How It Works
`src/utils/metaPixel.js` manages all browser-side pixel events:

| Function | Pixel Event | When | Line |
|---|---|---|---|
| `initPixel()` | Pixel init | App startup | 20 |
| `trackPageView()` | `PageView` | Route change | 60 |
| `trackLead()` | `Lead` | Form submission | 72 |
| `trackViewContent()` | `ViewContent` | Section/content view | 105 |
| `trackContact()` | `Contact` | Phone/WhatsApp click | 128 |
| `trackCustom()` | Custom event | Manual trigger | 146 |

### Alternative: Via GTM
1. Create a **Custom HTML** tag in GTM
2. Paste Meta Pixel base code (from Meta Events Manager)
3. Trigger: **All Pages**
4. Create additional Custom HTML tags for `Lead`, `Contact` events triggered on respective Custom Events

### Testing
Set `REACT_APP_META_TEST_EVENT_CODE` in `.env` to your test code from **Meta Events Manager > Test Events** tab. Remove before production.

---

## 8. Meta Conversions API (CAPI)

Server-side event tracking that sends events directly from your server to Meta, improving data reliability and bypassing browser ad blockers.

### Configuration
1. Copy `public/api/config.example.php` to `public/api/config.php`
2. Fill in your credentials:
   ```php
   define('META_PIXEL_ID', '123456789012345');
   define('META_ACCESS_TOKEN', 'your_token_from_events_manager');
   define('META_API_VERSION', 'v19.0');
   define('META_TEST_EVENT_CODE', '');  // Remove in production
   ```
3. Get your access token from **Meta Events Manager > Settings > Conversions API > Generate Access Token**

### Deduplication
Both browser pixel and CAPI send events with the same `event_id`:
- `src/utils/eventDedup.js` generates unique IDs (`evt_[timestamp]_[random]`) at line 14
- `storeSentEventId()` (line 25) records IDs in `sessionStorage` for dedup tracking
- `metaPixel.js` passes `eventID` with each `fbq()` call (lines 83, 117, 134, 153)
- `meta-capi.php` forwards the same `event_id` to Meta's Graph API (line 155)
- Meta automatically deduplicates matching `event_id` values

### Supported Events
`public/api/meta-capi.php` accepts: `Lead`, `Purchase`, `PageView`, `ViewContent`, `Contact`, `LeadConverted` (line 65)

### Sending Conversions from Admin LMS
When marking a lead as "Converted" in your admin panel, POST to `/api/meta-capi.php`:
```json
{
  "event_name": "LeadConverted",
  "event_id": "unique_id",
  "user_data": { "em": "email@example.com", "ph": "9876543210" },
  "custom_data": { "value": 5000, "currency": "INR" }
}
```
The server hashes PII (line 76-83) and enriches with client IP (line 88) before forwarding to Meta.

### Testing
1. Set `META_TEST_EVENT_CODE` in `config.php` (from **Meta Events Manager > Test Events**)
2. Set `REACT_APP_META_TEST_EVENT_CODE` in `.env` (same code)
3. Submit a test form and verify events appear in **Test Events** tab
4. Check both browser pixel and server events show with matching `event_id`
5. Remove test codes before going to production

---

## 9. Consent Mode v2

Google Consent Mode v2 controls which tags fire based on user cookie consent, required for GDPR/ePrivacy compliance.

### Configuration
```env
REACT_APP_ENABLE_CONSENT_MODE=true
```

### How It Works
`src/utils/consentMode.js`:

1. **`initConsentMode()`** (line 13) — must run BEFORE GTM loads. Sets defaults:
   ```javascript
   gtag('consent', 'default', {
     ad_storage: 'denied',
     ad_user_data: 'denied',
     ad_personalization: 'denied',
     analytics_storage: 'denied',
     functionality_storage: 'granted',
     personalization_storage: 'denied',
     security_storage: 'granted',
     wait_for_update: 500
   });
   ```

2. **When user accepts cookies**, call `updateConsent()` (line 44):
   ```javascript
   import { updateConsent, grantAllConsent } from './utils/consentMode';

   // Granular:
   updateConsent({ analytics: true, ads: true, personalization: false });

   // Or grant all:
   grantAllConsent();
   ```

3. GTM tags configured with Consent Mode will only fire after consent is granted

### Helper Functions
- `grantAllConsent()` (line 66) — grants all consent types
- `denyAllConsent()` (line 74) — revokes all consent types

---

## 10. Testing Checklist

### GTM & DataLayer
- [ ] GTM Preview mode shows container loaded
- [ ] All configured tags fire on expected triggers
- [ ] `window.dataLayer` in browser console contains expected events
- [ ] No duplicate events in dataLayer

### GA4
- [ ] GA4 **DebugView** (Admin > DebugView) shows `page_view` events
- [ ] `generate_lead` event appears in DebugView on form submit
- [ ] Custom parameters (`lead_source`, `method`) are populated
- [ ] Real-time report shows active users

### Google Ads
- [ ] Conversion tag fires in GTM Preview on form submit
- [ ] Google Ads > Tools > Conversions shows "Recording" status
- [ ] Enhanced conversions data visible (if enabled)
- [ ] GCLID captured: visit site with `?gclid=test123`, check `localStorage.getItem('gads_gclid')`

### Meta Pixel
- [ ] **Meta Pixel Helper** browser extension shows `PageView` on load
- [ ] `Lead` event fires on form submit
- [ ] `Contact` event fires on phone/WhatsApp click
- [ ] Test Events tab in Events Manager shows events with correct parameters

### Meta CAPI
- [ ] Server events appear in **Meta Events Manager > Test Events**
- [ ] Browser and server events share the same `event_id` (deduplication working)
- [ ] Event match quality score is acceptable in Events Manager

### Security & Privacy
- [ ] No PII (plain text email, phone, name) in `dataLayer` — only hashed values
- [ ] Consent Mode defaults to denied before user interaction
- [ ] Tags respect consent state (blocked when denied)

### End-to-End
- [ ] Form submission triggers: `generate_lead` (GTM) + Google Ads conversion + Meta `Lead` + CAPI `Lead`
- [ ] Phone click triggers: `phone_click` (GTM) + Meta `Contact`
- [ ] WhatsApp click triggers: `whatsapp_click` (GTM)
- [ ] Scroll and time events appear in GA4 after browsing
