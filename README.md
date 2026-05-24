# Landing Page Boilerplate

A high-converting, mobile-first landing page boilerplate for lead generation via Google Ads or any paid traffic source. Built with React 18, Material UI v5, and Framer Motion.

## Features

### Landing Page
- Responsive, mobile-first design with bottom navigation
- Animated sections with scroll-triggered transitions (Framer Motion)
- Lead capture forms with validation and duplicate prevention
- Multiple form entry points (hero, contact, drawer, secondary CTA)
- SweetAlert2 success/error modals
- Thank You page with confetti animation
- Legal modals (Privacy Policy, Terms, Disclaimer)
- PWA-ready with manifest and service worker

### Admin Panel (`/admin`)
- Secure login with environment-variable credentials
- Dashboard with lead analytics and charts
- Lead Management System (LMS) with search, filter, sort, pagination
- Lead status tracking (New, Contacted, Qualified, Converted, Lost)
- Per-lead notes and activity log
- CSV export for offline use
- Google Ads offline conversion import format

### Tracking & Analytics
- Google Tag Manager integration with dataLayer events
- Google Ads conversion tracking (browser-side + offline import)
- Meta Pixel + Conversions API (CAPI) for server-side tracking
- Google Consent Mode v2 support
- Enhanced conversions support
- GCLID capture and persistence
- Event deduplication (browser + server)

### SEO
- JSON-LD structured data (Organization, LocalBusiness, FAQPage, BreadcrumbList, WebPage)
- Dynamic SEO head management via `SEOHead` component
- Open Graph and Twitter Card meta tags
- Canonical URLs, robots.txt, sitemap.xml
- Configurable via `src/config/seo.js`

## Tech Stack

- React 18 (concurrent features, lazy loading)
- Material UI v5
- Framer Motion
- CSS Modules + CSS Custom Properties
- React Router v6
- Swiper (mobile carousels)
- SweetAlert2
- Iconify (MDI icons)
- Web Vitals monitoring

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm start

# Build for production
npm run build
```

Admin credentials: `monjoven` / `monjoven@2026vip` (configured in `.env`).

## Folder Structure

```
├── public/
│   ├── api/                # Server-side endpoints (CAPI, conversions)
│   ├── index.html          # HTML template with SEO meta, JSON-LD schemas
│   ├── manifest.json       # PWA manifest
│   ├── robots.txt          # Search engine directives
│   └── sitemap.xml         # Sitemap template
├── src/
│   ├── admin/
│   │   ├── components/     # AdminLayout, AdminLogin, Sidebar, Topbar
│   │   ├── context/        # AdminAuthContext
│   │   ├── pages/          # Dashboard, LeadManagement
│   │   └── utils/          # adminAuth, leadService, googleAdsExport
│   ├── components/
│   │   ├── common/         # Header, Footer, LeadForm, MobileNav, SEO, etc.
│   │   └── sections/       # Hero, About, Services, Features, CTA, etc.
│   ├── config/             # SEO configuration
│   ├── context/            # ModalContext, ThemeContext
│   ├── data/               # Content data files (edit these first!)
│   ├── hooks/              # useGTMTracking, useInView, useMediaQuery, etc.
│   ├── pages/              # ThankYou page
│   ├── styles/             # Global CSS, variables, animations, responsive
│   ├── theme/              # MUI theme configuration
│   └── utils/              # Webhook, GTM, Meta, Google Ads, validators, etc.
├── .env.example            # Environment variables template
├── CHANGELOG.md            # What changed from the original codebase
├── CLAUDE.md               # AI assistant instructions
├── CUSTOMIZATION_GUIDE.md  # Step-by-step setup for a new landing page
├── GTM_GUIDE.md            # Google Tag Manager setup guide
├── PABBLY_GUIDE.md         # Pabbly Connect webhook setup guide
└── SEO_GUIDE.md            # SEO configuration guide
```

## Customization

See **[CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md)** for a complete step-by-step walkthrough.

### Quick Summary

1. **Environment** — Copy `.env.example` to `.env`, fill in your business details
2. **Content** — Edit data files in `src/data/` and section text in `src/components/sections/`
3. **Branding** — Update colors in `src/styles/variables.css` and `src/theme/muiTheme.js`
4. **Images** — Replace `placehold.co` URLs with your actual images
5. **SEO** — Update meta tags and schemas in `public/index.html` and `src/config/seo.js`
6. **Webhook** — Configure Pabbly URL in `src/utils/webhookSubmit.js` (see [PABBLY_GUIDE.md](PABBLY_GUIDE.md))
7. **Lead Management** — Copy `public/api/config.example.php` → `config.php`, set `ADMIN_API_KEY`, and set the matching `REACT_APP_LEADS_ADMIN_KEY` in `.env` (see [PABBLY_GUIDE.md](PABBLY_GUIDE.md) Part B)
8. **Analytics** — Set up GTM container (see [GTM_GUIDE.md](GTM_GUIDE.md))
9. **Deploy** — Run `npm run build` and deploy the `build/` folder

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with all sections |
| `/thank-you` | Post-submission thank you page (requires session flag) |
| `/admin` | Redirects to `/admin/login` |
| `/admin/login` | Admin authentication |
| `/admin/dashboard` | Lead analytics dashboard |
| `/admin/lms` | Lead Management System |

## Documentation

- **[CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md)** — Quick-start guide for creating a new landing page
- **[PABBLY_GUIDE.md](PABBLY_GUIDE.md)** — Pabbly Connect webhook integration
- **[GTM_GUIDE.md](GTM_GUIDE.md)** — Google Tag Manager setup and dataLayer events
- **[SEO_GUIDE.md](SEO_GUIDE.md)** — SEO configuration and schema setup
- **[CHANGELOG.md](CHANGELOG.md)** — Detailed changelog

## License

MIT
