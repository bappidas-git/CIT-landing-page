# Pabbly Connect + Lead Management Setup Guide

> **Who is this for?** Anyone — even if you've never touched code before. Just follow each step in order.

---

## 1. The Big Picture (in plain English)

When a visitor fills the form on your landing page, their details need to reach **three** places:

| Where | Why it matters | Who reads it |
|-------|----------------|--------------|
| 📮 **Pabbly Connect** | Forwards the lead to Google Sheets, Email, WhatsApp, or CRM | Your sales team |
| 🗄️ **Your web server's `leads.json` file** | A shared filing cabinet every admin can read from | The Admin Panel |
| 💾 **Visitor's browser** | Prevents duplicate submissions from the same phone | The landing page itself |

```
Visitor submits form
        │
        ├──▶ Pabbly webhook      ──▶  Google Sheet / Email / CRM
        │
        ├──▶ Your server         ──▶  Admin Panel (all devices)
        │    (/api/leads.php)         (/admin/lms)
        │
        └──▶ Visitor's browser   ──▶  "Duplicate" check
```

All of this happens in **under 2 seconds** — the visitor just sees a "Thank You" page.

---

## 2. What You Need Before You Start

| Thing | Where to get it | Cost |
|-------|----------------|------|
| A Pabbly Connect account | https://www.pabbly.com/connect/ | Free tier available |
| A Google account (for Sheets) | https://accounts.google.com | Free |
| Your landing page hosted on a PHP-capable server (cPanel, VPS, etc.) | — | Your existing hosting |
| Access to the `.env` file of your project | Your code editor / hosting file manager | — |

> **⚠️ Important:** The Lead Management system uses a small PHP file (`public/api/leads.php`) to store leads. Your hosting must support PHP (most shared hosting does — Netlify / Vercel static hosting do NOT). If you use Netlify/Vercel, put the PHP file on any cheap PHP host (Hostinger, cPanel) and point `REACT_APP_LEADS_API_URL` to that full URL.

---

## 3. Part A — Set Up the Main Pabbly Webhook (for Google Sheets / Email / CRM)

### Step 1: Create a Pabbly Workflow

1. Log in at https://www.pabbly.com/connect/
2. Click **"Create Workflow"**
3. Name it: `Landing Page - Lead Capture`
4. For the **Trigger**, choose **Webhook**
5. Pabbly shows a webhook URL like:
   `https://connect.pabbly.com/webhook-listener/webhook/IjU3NjIwNTZ...`
6. Click **Copy URL** — you'll paste it in the next step.

### Step 2: Paste the URL into Your Code

Open the file **`src/utils/webhookSubmit.js`** and find these lines near the top:

```js
const WEBHOOK_URL = "PASTE_YOUR_PABBLY_URL_HERE";
const USE_PABBLY = true;   // must be true for production
const DUMMY_MODE = false;  // must be false for production
```

- Paste your Pabbly URL where it says `PASTE_YOUR_PABBLY_URL_HERE`.
- Save the file.

> **Tip:** While testing on your own computer, you can set `DUMMY_MODE = true` — then submissions are saved only in your browser and never sent anywhere.

### Step 3: Add a Google Sheets Action in Pabbly

1. In your Pabbly workflow, click the **+** under the webhook trigger.
2. Choose **Google Sheets** → Action: **Add Row**.
3. Click **Connect** and sign in with the Google account that owns the sheet.
4. Select your spreadsheet and worksheet (e.g., "Sheet1").
5. Map the columns (see table below).
6. Click **Save & Send Test Request**.

#### Column Mapping Template

Create these headers in Row 1 of your sheet first:

| Column | Header           | Pabbly Field           |
|--------|------------------|------------------------|
| A      | Name             | `{{name}}`             |
| B      | Mobile           | `{{mobile}}`           |
| C      | Email            | `{{email}}`            |
| D      | Service Interest | `{{service_interest}}` |
| E      | Message          | `{{message}}`          |
| F      | Source           | `{{source}}`           |
| G      | Lead ID          | `{{lead_id}}`          |
| H      | Status           | `{{status}}`           |
| I      | Submitted At     | `{{submitted_at}}`     |
| J      | Page URL         | `{{page_url}}`         |
| K      | UTM Source       | `{{utm_source}}`       |
| L      | UTM Medium       | `{{utm_medium}}`       |
| M      | UTM Campaign     | `{{utm_campaign}}`     |
| N      | UTM Term         | `{{utm_term}}`         |
| O      | UTM Content      | `{{utm_content}}`      |
| P      | GCLID            | `{{gclid}}`            |
| Q      | User Agent       | `{{user_agent}}`       |

### Step 4 (Optional): Add Email Notification

1. Add another action after Google Sheets.
2. Choose **Email by Pabbly** (free, built-in) or **Gmail**.
3. Subject: `New Consultation: {{name}} - {{service_interest}}`
4. Body:
   ```
   New consultation request from {{source}}

   Name: {{name}}
   Mobile: {{mobile}}
   Email: {{email}}
   Service Interest: {{service_interest}}
   Message: {{message}}

   Submitted: {{submitted_at}}
   Page: {{page_url}}
   UTM Source: {{utm_source}} | Campaign: {{utm_campaign}}
   ```

### Step 5: Test It

1. Open your landing page.
2. Fill the consultation form with fake data and submit.
3. Inside Pabbly, open your workflow → **History** tab. A new entry should appear within 30 seconds.
4. Open your Google Sheet — a new row should be there.

✅ **Main webhook done.** Leads are now reaching Google Sheets.

---

## 4. Part B — Set Up Lead Management (Admin Panel)

The Admin Panel (`landing.yourdomain.com/admin`) lets you see, search, filter, and manage leads — from **any device**. For this to work across devices, leads need to be stored on your **server**, not just in one browser. Here's how to enable it.

### Step 1: Upload the PHP Files

When you build and deploy the site, the folder **`public/api/`** gets copied to your server. Make sure these files end up in your server's `api/` folder:

- `api/leads.php` ← the storage endpoint (already in the project)
- `api/config.example.php` ← the template you'll copy

### Step 2: Create `config.php` on Your Server

On your server (via cPanel File Manager, FTP, or SSH):

1. Navigate to the `api/` folder.
2. Copy **`config.example.php`** → rename the copy to **`config.php`**.
3. Open `config.php` in the editor and find this line near the bottom:
   ```php
   define('ADMIN_API_KEY', 'CHANGE_ME_TO_A_LONG_RANDOM_STRING');
   ```
4. Replace `CHANGE_ME_TO_A_LONG_RANDOM_STRING` with a **long random string** — e.g., run https://www.random.org/strings/ and paste something like:
   ```php
   define('ADMIN_API_KEY', 'Zk8pQ3mX9yL2wN7bV5rT1jH6cD4fG0aE');
   ```
5. Save the file.

> **⚠️ Keep `config.php` private.** Never commit it to GitHub. It contains your secret key.

### Step 3: Put the Same Key in Your `.env` File

Open the `.env` file in your project and set:

```env
REACT_APP_LEADS_API_URL="/api/leads.php"
REACT_APP_LEADS_ADMIN_KEY="Zk8pQ3mX9yL2wN7bV5rT1jH6cD4fG0aE"
```

**The value of `REACT_APP_LEADS_ADMIN_KEY` must EXACTLY match `ADMIN_API_KEY` in `config.php`.** If they don't match, the admin panel will say "Unauthorized".

If your PHP endpoint lives on a different domain than your landing page, use the full URL:
```env
REACT_APP_LEADS_API_URL="https://api.yourdomain.com/api/leads.php"
```

### Step 4: Rebuild & Redeploy

```bash
npm run build
```

Upload the fresh `build/` folder to your server. The env values get baked into the JavaScript during build — that's why a rebuild is required after changing `.env`.

### Step 5: Make Sure the `data/` Folder Is Writable

The first time a lead is submitted, `leads.php` creates a folder at `api/data/` to store `leads.json`. Your PHP process needs write permission.

- On cPanel/shared hosting: usually works out of the box.
- On a VPS: run `chmod 755 public_html/api && chown www-data:www-data public_html/api`.
- If submissions fail silently, manually create `api/data/` and set permissions to `755`.

### Step 6: Test the Admin Panel

1. Open `https://yourdomain.com/admin/login`
2. Log in with the credentials from `.env` (`REACT_APP_ADMIN_USERNAME` / `REACT_APP_ADMIN_PASSWORD`).
3. Submit a new test lead from the landing page on a **different browser or phone**.
4. Refresh the Admin Panel — the lead should appear in the Lead Management table.
5. If it doesn't, see the Troubleshooting section at the end.

✅ **Lead Management is live.** Every admin sees every lead, from every device.

---

## 5. Part C — The Admin Panel Pabbly Webhook (OPTIONAL — skip unless you need it)

> **Short answer: You do NOT need this for Lead Management to work.** The setup above (Part B) already handles everything across all admin devices via your server.

The Admin Panel Pabbly Webhook is only useful if you want admin actions — status changes, notes, deletions — to **also** land in a **second** Pabbly workflow (e.g., to update a separate Google Sheet or notify your team on Slack).

### When to set it up

Set `REACT_APP_ADMIN_PABBLY_WEBHOOK_URL` only if you answer **YES** to any of these:

- "I want my Google Sheet to update the status column when an admin marks a lead as Contacted / Converted / Lost."
- "I want to get a Slack/Email ping when any admin adds a note to a lead."
- "I want a full audit log of admin actions inside Pabbly."

### When to skip it

Skip it (leave the value blank, or remove the line) if:

- You manage lead statuses only inside the Admin Panel itself.
- You don't need external tools to know about admin-side changes.

### Setup (if you need it)

1. Create a **second** Pabbly workflow with a Webhook trigger.
2. Copy its URL.
3. In `.env`:
   ```env
   REACT_APP_ADMIN_PABBLY_WEBHOOK_URL="https://connect.pabbly.com/webhook-listener/webhook/YOUR_SECOND_WORKFLOW_URL"
   ```
4. Rebuild and redeploy.

### Payload Examples

```json
// status_update
{ "action": "status_update", "lead_id": "...", "new_status": "contacted", "old_status": "new", "timestamp": "..." }

// note_added
{ "action": "note_added", "lead_id": "...", "note_text": "Called and left voicemail", "timestamp": "..." }

// lead_deleted
{ "action": "lead_deleted", "lead_id": "...", "timestamp": "..." }
```

Use Pabbly **Router/Filter** steps to branch each `action` to the right destination.

---

## 6. Environment Variables Cheat Sheet

Put these in your project's `.env` file:

| Variable | Required? | What it does |
|----------|-----------|--------------|
| *(none — set `WEBHOOK_URL` directly in `webhookSubmit.js`)* | **Yes** | The main Pabbly webhook for lead capture |
| `REACT_APP_LEADS_API_URL` | **Yes** (for Admin Panel) | Path to your `leads.php` endpoint. Default: `/api/leads.php` |
| `REACT_APP_LEADS_ADMIN_KEY` | **Yes** (for Admin Panel) | Secret that must match `ADMIN_API_KEY` in `config.php` |
| `REACT_APP_ADMIN_PABBLY_WEBHOOK_URL` | **No (Optional)** | Second Pabbly webhook for admin-side actions only |
| `REACT_APP_ADMIN_USERNAME` | **Yes** | Admin login username |
| `REACT_APP_ADMIN_PASSWORD` | **Yes** | Admin login password |

On your server, inside `public/api/config.php`:

| Constant | Required? | What it does |
|----------|-----------|--------------|
| `ADMIN_API_KEY` | **Yes** (for Admin Panel) | Secret that must match `REACT_APP_LEADS_ADMIN_KEY` |

---

## 7. Fields Sent to the Webhook

Every form submission sends these fields:

| Field | Example | Description |
|-------|---------|-------------|
| `name` | `Rahul Sharma` | Visitor's full name |
| `mobile` | `9876543210` | 10-digit mobile |
| `email` | `rahul@example.com` | Email (optional) |
| `service_interest` | `Hair Transplant` | Selected service |
| `message` | `Interested in FUE` | Optional message |
| `source` | `hero-form` | Which form was used (see below) |
| `lead_id` | `a1b2-c3d4-...` | Auto-generated unique ID |
| `status` | `new` | Always "new" at capture |
| `submitted_at` | `2026-04-12T10:30:00.000Z` | Submission timestamp |
| `page_url` | `https://landing.yourdomain.com/?utm_source=google` | Full page URL |
| `user_agent` | `Mozilla/5.0 ...` | Browser info |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_term` / `utm_content` | `google` / `cpc` / `spring_sale` / ... | Ad tracking parameters |
| `gclid` | `EAIaIQobChMI...` | Google Ads click ID |

### Form Source Values

| Source | Where it came from |
|--------|-------------------|
| `hero-form` | Main form at the top of the page |
| `contact-form` | Form in the Contact section |
| `drawer-form-apply-now` | Sliding drawer — "Book Consultation" |
| `drawer-form-request-callback` | Sliding drawer — "Request Callback" |
| `drawer-form-get-details` | Sliding drawer — "Get Details" |
| `drawer-form-download-brochure` | Sliding drawer — "Download Brochure" |
| `unified-lead-form` | Default (fallback) |

---

## 8. Troubleshooting

| Problem | Fix |
|---------|-----|
| Form submits but Pabbly shows nothing | In `webhookSubmit.js`: confirm `USE_PABBLY = true`, `DUMMY_MODE = false`, and the `WEBHOOK_URL` is correct. Rebuild + redeploy after changes. |
| Admin Panel is empty even though Pabbly receives leads | (1) Verify `config.php` exists in `api/` with `ADMIN_API_KEY`. (2) Verify `REACT_APP_LEADS_ADMIN_KEY` in `.env` **exactly** matches `ADMIN_API_KEY`. (3) Verify `api/data/` folder is writable by the PHP process. (4) Open browser DevTools → Network tab → look for `/api/leads.php?action=list` and check its status code. |
| Admin Panel says "Unauthorized" | The two keys don't match. Copy `ADMIN_API_KEY` from `config.php`, paste into `.env` as `REACT_APP_LEADS_ADMIN_KEY`, run `npm run build`, redeploy. |
| 404 or 400 from Pabbly webhook | Regenerate the URL in Pabbly — the old one may have expired or been deleted. |
| Leads missing UTM fields | UTMs must be in the landing page URL (e.g. `?utm_source=google&utm_medium=cpc`). |
| GCLID not captured | Check that Google Ads auto-tagging is enabled in your Google Ads account. |
| CORS error in console | Pabbly webhooks accept cross-origin POST; double-check the URL. For the leads API — make sure it's on the same domain or that CORS headers are set (already handled by `leads.php`). |
| Duplicate leads appearing | `isDuplicateLead()` checks by mobile number — clear browser localStorage to reset. |
| "leads.json permission denied" in server logs | `chmod 755 api/` and make sure PHP user can write. On cPanel, use File Manager → right-click `api/` → Change Permissions → set to `755`. |

---

## 9. Testing Modes Reference

| Mode | `USE_PABBLY` | `DUMMY_MODE` | Behavior |
|------|--------------|--------------|----------|
| Local testing | `false` | `true` | Leads saved only in your browser. No network requests. Great for development. |
| Production | `true` | `false` | Leads sent to Pabbly + stored on server. Admin panel shows all leads. |

To inspect test leads in the browser, open DevTools → Console and run:
```js
JSON.parse(localStorage.getItem("lp_test_leads"))   // dummy mode leads
JSON.parse(localStorage.getItem("lp_submitted_leads")) // real leads captured on this device
```
