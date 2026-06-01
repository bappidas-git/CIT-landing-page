# CIT — Direct B.E. Engineering Admissions 2026

## Overview

A high-converting, mobile-first landing page for **Channabasaveshwara Institute of Technology (CIT), Tumakuru** — built to capture quality leads for **Direct B.E. (Engineering) Admissions, 2026 intake**, targeted at students and parents across North East India and run by Assam Digital. Built with React 18, Material UI, and Framer Motion. Includes an admin panel with lead management, a tele-calling lead module, GTM integration, Meta CAPI, and Google Ads conversion tracking.

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
- `public/api/` — Server-side endpoints (`leads.php` shared lead store, Meta CAPI, offline conversions)

## Lead Storage & Sync

Leads are stored server-side in `public/api/leads.php` (a shared JSON store) — this is the **single source of truth**. The public form POSTs each submission there, and the admin panel reads/writes only the server (auto-refreshing every 15s), so every browser and device sees the same leads. There is no localStorage copy of leads. Configure with `REACT_APP_LEADS_API_URL` + `REACT_APP_LEADS_ADMIN_KEY` in `.env` (the key must match `ADMIN_API_KEY` in `public/api/config.php`).

## Tele-Calling Module

The **Tele-Calling** admin module (`/admin/tele-calling`) mirrors Lead Management but its records are entered manually by telecallers (not the public form). It has its own server store `public/api/telecalls.php` (`data/telecalls.json`), service `src/admin/utils/telecallService.js`, status config `src/admin/utils/telecallStatus.js`, list page `TeleCalling.jsx`, detail page `TeleCallDetail.jsx`, and shared add/edit form `src/admin/components/TelecallFormDialog.jsx`. It uses the same cross-device sync pattern as leads (in-memory cache hydrated from the server, 15s poll, BroadcastChannel for same-browser tabs) and reuses `REACT_APP_LEADS_ADMIN_KEY` for auth (configure the endpoint with `REACT_APP_TELECALLS_API_URL`). Tele-calling statuses: Hot · Warm · Cold · Need More Follow Ups · Seat Booked · Not Interested.

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
5. **Forms**: Leads POST to the server store (`/api/leads.php`) via `src/utils/webhookSubmit.js` — usually leave the default endpoint
6. **Analytics**: Set `REACT_APP_GTM_ID` in `.env` and update GTM ID in `public/index.html`
7. **Admin**: Update `REACT_APP_ADMIN_USERNAME` and `REACT_APP_ADMIN_PASSWORD` in `.env`

See `CUSTOMIZATION_GUIDE.md` for a complete step-by-step walkthrough.

## Documentation

- `CUSTOMIZATION_GUIDE.md` — Quick-start guide for new landing pages
- `GTM_GUIDE.md` — Google Tag Manager setup
- `SEO_GUIDE.md` — SEO and schema configuration
- `CHANGELOG.md` — Detailed changelog

## DO NOT MODIFY

- Component structure, layout, animations, form logic, webhookSubmit.js, swalHelper.js, mobile navigation mechanics, drawer/modal behavior, video background system
