<?php
/* ============================================
   Meta Conversions API Configuration
   Copy this file to config.php and fill in
   your credentials from Meta Business Manager.

   To get your credentials:
   1. Go to Meta Events Manager
   2. Select your Pixel
   3. Go to Settings > Conversions API
   4. Generate an Access Token
   ============================================ */

// Meta Pixel ID (found in Events Manager > Data Sources)
define('META_PIXEL_ID', 'YOUR_PIXEL_ID');

// Conversions API Access Token (generated in Events Manager > Settings)
define('META_ACCESS_TOKEN', 'YOUR_ACCESS_TOKEN');

// Meta Graph API Version
define('META_API_VERSION', 'v19.0');

// Test Event Code (from Events Manager > Test Events tab)
// Remove or leave empty in production
define('META_TEST_EVENT_CODE', '');

// ============================================
// Lead Storage API (leads.php)
// Shared secret that gates admin-only endpoints
// (list / update / delete) and marks create
// requests from the admin panel (CSV import) as
// trusted, so they skip the public anti-bot
// checks.
//
// REQUIRED — leads.php ships with NO fallback
// key: until this is set (or provided via the
// LEADS_ADMIN_KEY / ADMIN_API_KEY environment
// variable), admin endpoints answer 503.
//
// Setup: generate a long random string (e.g.
// `openssl rand -hex 32`) and set the SAME value
// here AND as REACT_APP_LEADS_ADMIN_KEY in .env,
// then rebuild the React app. If this deployment
// ever ran with the old committed default key,
// treat it as compromised and rotate both sides.
// ============================================
define('ADMIN_API_KEY', 'CHANGE_ME_TO_A_LONG_RANDOM_STRING');

// ============================================
// Lead API anti-bot tuning (optional)
// Defaults shown below apply when a constant is
// not defined. Public create requests over the
// rate limit are silently discarded (the client
// still receives {"success":true}); submissions
// faster than the time-trap threshold are stored
// with lead_tier "spam".
// ============================================
// Max public creates allowed per IP per window.
// define('LEADS_RATE_LIMIT_MAX', 5);

// Rate-limit window in seconds.
// define('LEADS_RATE_LIMIT_WINDOW', 3600);

// Minimum seconds between form_started_at and
// submitted_at before a submission counts as
// human (the time-trap).
// define('LEADS_MIN_FORM_SECONDS', 15);
