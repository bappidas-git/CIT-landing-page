# Customization Guide

A step-by-step guide to create a new landing page from this boilerplate.

## 1. Clone & Install

```bash
git clone <your-repo-url> my-landing-page
cd my-landing-page
npm install
```

## 2. Configure Environment Variables

Copy the example and fill in your business details:

```bash
cp .env.example .env
```

Key variables to update:

| Variable | Description |
|----------|-------------|
| `REACT_APP_NAME` | Your business name |
| `REACT_APP_PROJECT_NAME` | Project/product name |
| `REACT_APP_SALES_PHONE` | Sales phone number |
| `REACT_APP_WHATSAPP_NUMBER` | WhatsApp number (no dashes) |
| `REACT_APP_SALES_EMAIL` | Sales email address |
| `REACT_APP_OFFICE_ADDRESS` | Full office address |
| `REACT_APP_ADMIN_USERNAME` | Admin panel username (default: `monjoven`) |
| `REACT_APP_ADMIN_PASSWORD` | Admin panel password (default: `monjoven@2026vip`) |
| `REACT_APP_LEADS_API_URL` | Path to `leads.php` (default: `/api/leads.php`). Required for Admin Panel. |
| `REACT_APP_LEADS_ADMIN_KEY` | Secret shared with `ADMIN_API_KEY` in `public/api/config.php`. Required for Admin Panel. |
| `REACT_APP_ADMIN_PABBLY_WEBHOOK_URL` | Optional — only for mirroring admin actions to a second Pabbly workflow. Leave blank otherwise. |

## 3. Update Brand Colors

Edit `src/styles/variables.css`:

```css
:root {
  --primary-color: #2D3561;      /* Your primary brand color */
  --secondary-color: #2EC4B6;    /* Your secondary/accent color */
  --accent-warm: #FF6B35;        /* CTA button color */
  --light-bg: #E0F7F5;           /* Light background tint */
  --text-color: #1B2A4A;         /* Main text color */
}
```

Also update `src/theme/muiTheme.js` to match:

```js
primary: { main: '#2D3561' },
secondary: { main: '#2EC4B6' },
```

## 4. Update Content Data Files

Edit the files in `src/data/`:

### `servicesData.js`
Define your service/plan cards with titles, descriptions, prices, and features.

### `serviceDetailsData.js`
Add detailed information for each service (used in expanded views).

### `featuresData.js`
Define feature categories and individual feature items with icons.

### `statsData.js`
Set key statistics (e.g., "500+ Clients", "10 Years Experience").

### `locationData.js`
Update your office location, contact details, and map coordinates.

## 5. Update Section Content

Edit hardcoded text in `src/components/sections/`:

- **HeroSection** — Main headline, subheadline, CTA text
- **AboutSection** — About your business
- **ServicesSection** — Section title, subtitle
- **FeaturesSection** — Section title, subtitle
- **CTASection** — Call-to-action messaging
- **ContactSection** — Contact form heading, address
- **SecondaryCTASection** — Secondary CTA messaging

## 6. Replace Placeholder Images

Search for `placehold.co` across the codebase and replace with your actual images:

```bash
grep -r "placehold.co" src/ public/
```

Key images to replace:
- **Logo**: `Header.jsx`, `Footer.jsx`, `MobileDrawer.jsx`, `public/index.html`
- **Hero background**: `HeroSection.jsx` or `HeroSection.module.css`
- **OG image**: `public/index.html` (og:image meta tag)
- **Favicon**: `public/favicon.png`, `public/favicon.ico`
- **PWA icons**: `public/apple-touch-icon.png`, update `public/manifest.json`

## 7. Update SEO & Schemas

### `public/index.html`
- Update `<title>` tag
- Update `<meta name="description">` 
- Update Open Graph tags (`og:title`, `og:description`, `og:image`)
- Update Twitter Card tags
- Update `<link rel="canonical">` with your domain
- Update all JSON-LD schemas (Organization, LocalBusiness, FAQPage, etc.)

### `src/config/seo.js`
Update the SEO configuration object with your business details. This drives the dynamic `SEOHead` component.

### `public/robots.txt`
Replace `yourbusiness.com` with your actual domain.

### `public/sitemap.xml`
Replace `yourbusiness.com` with your actual domain. Add additional pages as needed.

### `public/manifest.json`
Update `name`, `short_name`, and theme colors.

See `SEO_GUIDE.md` for detailed SEO configuration.

## 8. Configure Pabbly Webhook (Lead Capture)

This sends each form submission to Google Sheets / Email / your CRM.

1. Create a Pabbly Connect account — https://www.pabbly.com/connect/
2. Set up a workflow with a **Webhook** trigger and copy the webhook URL.
3. Open `src/utils/webhookSubmit.js` and set:
   - `WEBHOOK_URL` = your Pabbly webhook URL
   - `USE_PABBLY = true`
   - `DUMMY_MODE = false`
4. Save and rebuild.

See `PABBLY_GUIDE.md` Part A for a full, step-by-step walkthrough (including Google Sheets column mapping and email notifications).

## 8b. Configure Lead Management (Admin Panel)

The Admin Panel (`/admin`) must be able to see leads submitted from **any** device. To do this, the project stores every lead on your server in a small JSON file via `public/api/leads.php`. Set it up once:

1. On your server, copy **`public/api/config.example.php`** to **`public/api/config.php`**.
2. Open `config.php` and set `ADMIN_API_KEY` to a long random string:
   ```php
   define('ADMIN_API_KEY', 'Zk8pQ3mX9yL2wN7bV5rT1jH6cD4fG0aE');
   ```
3. Put the **same value** in your project's `.env` file:
   ```env
   REACT_APP_LEADS_API_URL="/api/leads.php"
   REACT_APP_LEADS_ADMIN_KEY="Zk8pQ3mX9yL2wN7bV5rT1jH6cD4fG0aE"
   ```
4. Run `npm run build` and redeploy (env values are baked in at build time).
5. Make sure the `public/api/data/` folder is writable by the PHP process (usually automatic on cPanel).

> **Requirement:** Your hosting must support PHP. If you're on Netlify/Vercel (static only), host `leads.php` on any cheap PHP host (Hostinger, cPanel, etc.) and use the full URL in `REACT_APP_LEADS_API_URL`.

> **Optional — skip by default:** `REACT_APP_ADMIN_PABBLY_WEBHOOK_URL` is only needed if you want admin actions (status changes, notes, deletions) to also flow into a **second** Pabbly workflow. Lead Management works perfectly without it.

See `PABBLY_GUIDE.md` Part B for full details.

## 9. Set Up Google Tag Manager

1. Create a GTM container at [tagmanager.google.com](https://tagmanager.google.com/)
2. Add your GTM ID to `.env`:
   ```
   REACT_APP_GTM_ID="GTM-XXXXXXX"
   ```
3. Replace `GTM-XXXXXXX` in `public/index.html` (two places: `<head>` script and `<body>` noscript)
4. Configure tags, triggers, and variables in GTM

See `GTM_GUIDE.md` for detailed setup including dataLayer events.

### Optional: Meta Pixel

```
REACT_APP_META_PIXEL_ID="XXXXXXXXXXXXXXX"
```

### Optional: Google Ads Conversion Tracking

```
REACT_APP_GOOGLE_ADS_ID="AW-XXXXXXXXXX"
REACT_APP_GOOGLE_ADS_CONVERSION_LABEL="XXXXXXXXXX"
```

## 10. Deploy

```bash
# Build production bundle
npm run build

# The build/ folder is ready to deploy
```

Deploy to any static hosting:
- **Netlify**: Drag and drop `build/` folder or connect Git repo
- **Vercel**: Connect Git repo, set build command to `npm run build`
- **AWS S3**: Upload `build/` contents to S3 bucket with static hosting
- **cPanel**: Upload `build/` contents to `public_html/`

### Important: SPA Routing

Since this is a single-page app with client-side routing, configure your hosting to redirect all requests to `index.html`. Without this, direct URL access to `/thank-you` or `/admin` will return 404.

- **Netlify**: Add `public/_redirects` with `/* /index.html 200`
- **Vercel**: Handled automatically
- **Apache**: Add `.htaccess` with `RewriteRule` to `index.html`
- **Nginx**: Add `try_files $uri /index.html`

## 11. Post-Deploy Verification

After deployment, verify:

- [ ] Landing page loads at your domain
- [ ] All sections render correctly
- [ ] UnifiedLeadForm submissions work (check Pabbly webhook logs)
- [ ] Thank You page shows after form submission
- [ ] Admin panel accessible at `/admin`
- [ ] GTM fires events (check browser console for `dataLayer`)
- [ ] Meta Pixel fires (check Meta Events Manager)
- [ ] SEO schemas validate (use [Google Rich Results Test](https://search.google.com/test/rich-results))
- [ ] Mobile layout works correctly
- [ ] No console errors in production

## Quick Reference: File Locations

| What to change | Where |
|---------------|-------|
| Business name / text | `src/data/*.js`, section components |
| Brand colors | `src/styles/variables.css`, `src/theme/muiTheme.js` |
| Logo | `Header.jsx`, `Footer.jsx`, `MobileDrawer.jsx`, `index.html` |
| Contact info | `.env`, `src/data/locationData.js` |
| SEO meta tags | `public/index.html`, `src/config/seo.js` |
| Webhook URL | `src/utils/webhookSubmit.js` |
| Lead Management API key | `public/api/config.php` (server) + `.env` (`REACT_APP_LEADS_ADMIN_KEY`) |
| GTM container ID | `.env`, `public/index.html` |
| Admin credentials | `.env` |
| Favicon / icons | `public/` directory |
