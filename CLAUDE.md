# Landing Page Boilerplate

## Overview

A high-converting, mobile-first landing page boilerplate built with React 18, Material UI, and Framer Motion. Designed for lead generation via Google Ads or any paid traffic source. Includes an admin panel with lead management, GTM integration, Meta CAPI, and Google Ads conversion tracking.

## Project Structure

- `src/components/sections/` — Page sections (Hero, About, Services, Features, etc.)
- `src/components/common/` — Reusable components (Header, Footer, LeadForm, SEOHead, etc.)
- `src/data/` — Content data files (services, features, stats, locations)
- `src/config/` — SEO configuration
- `src/context/` — React context providers (Modal, Theme)
- `src/hooks/` — Custom hooks (useGTMTracking, useInView, useMediaQuery, etc.)
- `src/utils/` — Utility functions (webhook, GTM, Meta Pixel, Google Ads, validators)
- `src/admin/` — Admin panel (components, pages, context, utils)
- `src/pages/` — Full pages (ThankYou)
- `public/` — Static assets, index.html, manifest, robots.txt, sitemap.xml
- `public/api/` — Server-side endpoints (Meta CAPI, offline conversions)

## Brand Color System (Defaults)

- Primary: #2D3561 (Deep Navy)
- Secondary/Accent: #2EC4B6 (Teal Green)
- Accent Warm: #FF6B35 (Orange — CTAs only)
- Light Teal: #E0F7F5 (Card backgrounds)
- White: #FFFFFF
- Text: #1B2A4A

To customize colors, update `src/styles/variables.css`, `src/theme/muiTheme.js`, and CSS variables in `.module.css` files.

## Customization Guide

1. **Content**: Update data files in `src/data/` and hardcoded text in section components
2. **Branding**: Replace logo URL in `Header.jsx`, `Footer.jsx`, `MobileDrawer.jsx`, and `public/index.html`
3. **Contact Info**: Update `.env` file and `src/data/locationData.js`
4. **SEO**: Update meta tags, JSON-LD schemas, `src/config/seo.js`, and `public/sitemap.xml`
5. **Forms**: Configure webhook URL in `src/utils/webhookSubmit.js`
6. **Analytics**: Set `REACT_APP_GTM_ID` in `.env` and update GTM ID in `public/index.html`
7. **Admin**: Update `REACT_APP_ADMIN_USERNAME` and `REACT_APP_ADMIN_PASSWORD` in `.env`

See `CUSTOMIZATION_GUIDE.md` for a complete step-by-step walkthrough.

## Documentation

- `CUSTOMIZATION_GUIDE.md` — Quick-start guide for new landing pages
- `PABBLY_GUIDE.md` — Webhook integration setup
- `GTM_GUIDE.md` — Google Tag Manager setup
- `SEO_GUIDE.md` — SEO and schema configuration
- `CHANGELOG.md` — Detailed changelog

## DO NOT MODIFY

- Component structure, layout, animations, form logic, webhookSubmit.js, swalHelper.js, mobile navigation mechanics, drawer/modal behavior, video background system
