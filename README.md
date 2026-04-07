# Zeli Models

Public agency site with portfolio, forms, and admin:

- **Home** (`/`) - hero, category marquee, featured models, services carousel, values; hero links to **Become a model**
- **Female** (`/women`) and **Male** (`/men`) - grids → **Model profile** (`/models/[id]`)
- **Book a model** (`/book-a-model`) - client inquiry form (nav); **Become a model** (`/become-a-model`) - application form (hero CTA only)
- **WhatsApp** floating CTA - shown only on **home** and **become a model** (not on portfolio grids)
- **Admin** (`/admin`) - models, site copy, inbox

## Run locally

```bash
cd zeli-models
npm install
npm run dev
```

Open `http://localhost:3000`.

## Public assets (`public/`)

| Asset | Purpose |
|--------|--------|
| **`logo.jpg`** | Header logo (`AppHeader`). Use PNG/SVG with transparency if you prefer; update `src` in `src/components/AppHeader.tsx`. |
| **`work/work-1.svg` … `work-5.svg`** | Placeholder images for local/demo model data (`data/models.json` defaults). Replace with real URLs via Admin when using Supabase. |

The hero section is styled with CSS (see `src/components/Hero.module.css` and color tokens in `src/app/globals.css`), not a full-bleed background image file.

## Update content

- **Models & site copy**: use **Admin** when Supabase (or local `data/models.json` + `data/site-settings.json`) is in use.
- **WhatsApp / phone display**: `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local` (see `src/lib/contact.ts`).
- **Instagram (optional)**: `NEXT_PUBLIC_INSTAGRAM_URL` or Admin → Site content.

### Admin login

Admin access is protected.

- Set credentials in `.env.local`:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`

See `.env.example` for the keys.

## Supabase (recommended for production / Vercel)

Vercel serverless doesn’t persist file writes, so for production you should use:

- **Supabase Postgres** for models
- **Supabase Storage** for model images

### Setup

1. Create a Supabase project
2. Run SQL migrations **in order** in the Supabase SQL editor:
   - `supabase/migrations/001_models.sql`
   - `supabase/migrations/002_site_and_submissions.sql`
   - `supabase/migrations/003_featured_image.sql` (`featured_image_url` for featured-card images)
   - `supabase/migrations/004_inbox_archive.sql` (`archived_at` on submissions; auto-purge after 30 days in admin API)
   - `supabase/migrations/005_forms_and_booking.sql` (simplified applications: age + address; book-a-model fields on contact submissions)
   - `supabase/migrations/006_site_social_urls.sql` (`tiktok_url`, `twitter_url` on `site_settings` for admin-editable social links)
3. Create a **public** Storage bucket named `model-images` (or set `SUPABASE_STORAGE_BUCKET`)
4. Add these env vars to Vercel (Project → Settings → Environment Variables):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET` (optional)

Once set, the app will read/write models from Supabase and upload images to the bucket.

### About the migration files

Keep the **`supabase/migrations/`** SQL files in the repo. They are **not** redundant after you run them once: they document the schema, let new environments apply the same changes in order, and are the source of truth for what the app expects. **Do not delete them** after running on production; new clones and databases still need `001` through `006` (as applicable).

**Contact and “Become a model” submissions** require Supabase with migration `002` applied (tables `contact_submissions` and `model_applications`). Without the service role key, those APIs return 503.

**Local preview without Supabase:** models and site settings fall back to `data/models.json` and `data/site-settings.json`; submission forms need Supabase.
