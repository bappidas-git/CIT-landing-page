# Changelog

All notable changes to the Landing Page Boilerplate project.

## [Unreleased]

### Server-side leads as the single source of truth (cross-device sync fix)

**Fixed**
- Leads now sync correctly across every browser and device. The public form
  writes each submission directly to the shared server store
  (`public/api/leads.php`), and the admin panel reads/writes only the server
  (auto-refreshing every 15s). Previously leads were kept in per-browser
  `localStorage` and never reliably reached the server, so the admin panel
  showed different data on different devices.
- `webhookSubmit.js` now `POST`s straight to `/api/leads.php?action=create`
  and reports honest success/failure; the lead is no longer stored only in the
  submitting browser.
- Duplicate prevention is now server-side (by mobile number), so it works
  across devices instead of per-browser.

**Removed**
- **Pabbly Connect** integration entirely — webhook URL, `USE_PABBLY` /
  `DUMMY_MODE` flags, the admin Pabbly mirror (`REACT_APP_ADMIN_PABBLY_WEBHOOK_URL`),
  `adminConfig.js`, the Pabbly setup guide tab, and `PABBLY_GUIDE.md`.
- All `localStorage` use for lead data (`lp_submitted_leads` / `lp_test_leads`).
  Per-device essentials (admin login session, theme preference, Google Ads
  gclid attribution) still use `localStorage` by design.

**Notes**
- Meta Pixel / CAPI and Google Ads tracking are kept (env-driven, IDs blank —
  ready for CIT's own Pixel/Ads IDs). No third-party/other-client IDs remain.
- Added a "Lead Storage" tab to the admin Guideline page documenting the new
  architecture.

## [1.0.0] - 2026-04-01

### Converted from Brand-Specific to Generic Boilerplate

**Content & Branding**
- Replaced all brand-specific text (company names, taglines, descriptions) with generic placeholder content
- Replaced all product images with `placehold.co` placeholder images
- Replaced all logo references with placeholder logo URLs
- Updated all contact info to generic `+91-XXXXXXXXXX` / `info@yourbusiness.com` patterns
- Updated all social media links to empty/placeholder values

**Data Files Renamed & Genericized**
- `servicesData.js` — Generic service/plan card data
- `serviceDetailsData.js` — Generic detailed service information
- `featuresData.js` — Generic feature categories and items
- `statsData.js` — Generic statistics/highlights
- `locationData.js` — Generic location and contact data

**Admin Panel (New)**
- Built admin authentication system with login page at `/admin/login`
- Created admin dashboard at `/admin/dashboard` with lead analytics
- Created admin layout with sidebar navigation and topbar
- Protected routes require authentication via `ProtectedRoute` component
- Admin credentials configurable via `.env` variables

**Lead Management System — LMS (New)**
- Built full-featured Lead Management page at `/admin/lms`
- Lead table with search, filter by status, sort, and pagination
- Status management (New, Contacted, Qualified, Converted, Lost)
- Notes system for adding per-lead notes
- CSV export functionality for offline use
- Google Ads offline conversion export format
- Conversion tracking data (mark as converted with value)
- Leads stored in localStorage (easily replaceable with backend API)

**GTM Integration (New)**
- Integrated Google Tag Manager with `initGTM()` utility
- Created `useGTMTracking` hook for automatic page-level tracking
- DataLayer events: `page_view`, `cta_click`, `generate_lead`, `scroll_depth`, `section_view`
- Engagement tracking via `EngagementTracker` component
- Google Consent Mode v2 support via `consentMode.js`
- Created `GTM_GUIDE.md` documentation

**Meta Conversions API — CAPI (New)**
- Browser-side Meta Pixel tracking via `metaPixel.js`
- Server-side CAPI endpoint at `public/api/meta-capi.php`
- Event deduplication via `eventDedup.js` (shared event IDs between browser & server)
- Test Event Code support for debugging in Meta Events Manager

**Google Ads Conversion Tracking (New)**
- Browser-side gtag.js conversion tracking via `googleAds.js`
- GCLID capture and persistent storage via `gclidManager.js`
- Enhanced conversions support via `enhancedConversions.js`
- Offline conversion import CSV export via `googleAdsExport.js`

**SEO System (New)**
- Dynamic SEO head management via `SEOHead` component
- Configurable schemas in `src/config/seo.js`
- JSON-LD structured data: Organization, LocalBusiness, FAQPage, BreadcrumbList, WebPage
- Proper meta tags, Open Graph, Twitter Cards in `index.html`
- `robots.txt` with admin route exclusions
- `sitemap.xml` template
- Created `SEO_GUIDE.md` documentation

**Webhook & Form System**
- Pabbly Connect webhook integration in `webhookSubmit.js`
- Dummy mode for local testing without webhook
- Lead duplicate prevention
- Multiple form sources tracked (hero, contact, drawer, secondary CTA)
- UTM parameter capture and GCLID enrichment
- Created `PABBLY_GUIDE.md` documentation

**Infrastructure & Performance**
- React 18 with concurrent features and lazy loading
- Idle-time section preloading via `requestIdleCallback`
- Error boundaries per section
- Web Vitals monitoring
- CSS Modules for component-scoped styles
- CSS custom properties in `variables.css`
- Responsive design with mobile-first approach
- PWA manifest and service worker support

**Files Added**
- `src/admin/` — Complete admin panel (components, pages, context, utils)
- `src/components/common/SEO/SEOHead.jsx` — Dynamic SEO management
- `src/components/common/EngagementTracker/EngagementTracker.jsx` — Analytics tracker
- `src/components/common/LeadFormDrawer/` — Slide-in lead form drawer
- `src/config/seo.js` — SEO configuration
- `src/hooks/useGTMTracking.js` — GTM tracking hook
- `src/utils/gtm.js` — GTM initialization
- `src/utils/consentMode.js` — Google Consent Mode
- `src/utils/metaPixel.js` — Meta Pixel helpers
- `src/utils/metaCAPI.js` — Meta CAPI client
- `src/utils/googleAds.js` — Google Ads tracking
- `src/utils/gclidManager.js` — GCLID persistence
- `src/utils/enhancedConversions.js` — Enhanced conversions
- `src/utils/eventDedup.js` — Event deduplication
- `public/api/meta-capi.php` — Server-side CAPI endpoint
- `public/api/google-offline-conversions.php` — Offline conversions endpoint
- `public/api/config.example.php` — API config template
- `PABBLY_GUIDE.md` — Pabbly webhook setup guide
- `GTM_GUIDE.md` — Google Tag Manager setup guide
- `SEO_GUIDE.md` — SEO configuration guide
- `CUSTOMIZATION_GUIDE.md` — Quick-start customization guide
- `CHANGELOG.md` — This file

**Dependencies Added**
- `canvas-confetti` — Thank You page confetti animation
- `react-router-dom` v7 — Client-side routing
- `react-intersection-observer` — Scroll-triggered animations
- `sweetalert2` + `sweetalert2-react-content` — Success/error modals
- `swiper` — Mobile carousels
- `@iconify/react` — MDI icon system
- `@mui/lab` — MUI experimental components
- `web-vitals` — Performance monitoring
