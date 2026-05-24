# 01 — Brand Identity & Environment Configuration

**Prerequisite:** Read `prompts/00-cit-master-reference.md` first.

## Goal
Rebrand the project's identity, environment variables, and app manifest from
"Monjoven" to "CIT — Direct Engineering Admissions 2026". This is the foundation;
no UI/section copy yet.

## Files to edit
- `.env` and `.env.example`
- `package.json` (name, description, author, keywords, homepage)
- `public/manifest.json`
- `README.md` (top-level project readme — light touch: rename title/intro to CIT)
- `CLAUDE.md` "Overview" line only (rename product to CIT admissions page; keep
  the structural guidance intact)

## Requirements
1. **`.env` / `.env.example`** — update every human-readable value to CIT. Use
   canonical data from §2 of the master reference:
   - `REACT_APP_NAME="CIT Admissions 2026"`
   - `REACT_APP_PROJECT_NAME="CIT — Direct B.E. Engineering Admissions 2026"`
   - `REACT_APP_DEVELOPER_NAME="Channabasaveshwara Institute of Technology"`
   - `REACT_APP_PROJECT_LOCATION="Tumakuru, Karnataka"`
   - `REACT_APP_ADMIN_USERNAME="citadmin"` and a strong `REACT_APP_ADMIN_PASSWORD`
     (e.g. `cit@admissions2026`)
   - `REACT_APP_SALES_PHONE="+91-8867354168"`,
     `REACT_APP_WHATSAPP_NUMBER="+918867354168"`
   - `REACT_APP_SALES_EMAIL="admin@cittumkur.org"`,
     `REACT_APP_SUPPORT_EMAIL="hr@cittumkur.org"`
   - `REACT_APP_OFFICE_ADDRESS="NH 206, B.H. Road, Gubbi, Tumakuru – 572 216, Karnataka"`
   - Social URLs: blank them out (set `""`) unless a real CIT URL is known —
     do NOT keep the Monjoven facebook/instagram links.
   - **Leave all analytics/tracking IDs, webhook URLs, and API keys exactly as
     they are** (GTM, Meta Pixel, Google Ads, Pabbly, leads admin key). Those are
     infra and will be reconfigured by the user separately.
2. **`package.json`** — `name: "cit-landing-page"`, update `description`,
   `author` ("Assam Digital"), and `keywords` to admissions/education terms
   (`engineering-admission`, `landing-page`, `lead-generation`, `cit`, `vtu`).
3. **`public/manifest.json`** — `short_name: "CIT 2026"`,
   `name: "CIT — Direct B.E. Admissions 2026"`, theme/background colours to the
   CIT blue `#0B3D91` / white, update any description.
4. **`README.md`** — replace the Monjoven product framing with a short CIT
   admissions-page description. Keep setup instructions.

## Constraints
- Do not touch tracking IDs, keys, or webhook URLs.
- No medical wording anywhere.

## Acceptance criteria
- `grep -ri "monjoven" .env .env.example package.json public/manifest.json README.md`
  returns nothing.
- App still boots (`npm start`) with the new env values.
