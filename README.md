# Zeli Models (Portfolio)

Recreation of the Zeli Models public portfolio site (layout/colors/feel), with:

- Responsive hero + portfolio grid
- Model cards with 5-image carousel
- Contact section for inquiries
- Floating “Chat on WhatsApp” button
- Admin scaffold (reorder UI + JSON export) at `/admin`

## Run locally

```bash
cd zeli-models
npm install
npm run dev
```

Open `http://localhost:3000`.

## Update content

- **Models (names / height / bio / images)**: `src/data/models.ts`
  - Add images to `public/` and reference them like `"/models/alexandra/1.jpg"`
- **Contact email/phone**: `src/components/ContactSection.tsx`
- **WhatsApp number + default message**: `src/components/WhatsappButton.tsx`

## Admin (for later)

The route `http://localhost:3000/admin` is a simple scaffold to help with model ordering.
Next step is wiring this to authentication + persistence (database) so the business owner can:

- Add/edit/delete models
- Upload 5 images per model
- Reorder the grid (what shows at the top)

### Admin login

Admin access is protected.

- Set credentials in `.env.local`:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`

See `.env.example` for the keys.

## Supabase (recommended for production / Vercel)

Vercel serverless doesn’t persist file writes, so for production you should use:

- **Supabase Postgres** for models (name/height/bio/order/images)
- **Supabase Storage** for model images

### Setup

1. Create a Supabase project
2. Run the SQL migration in `supabase/migrations/001_models.sql` in the Supabase SQL editor
3. Create a **public** Storage bucket named `model-images` (or set `SUPABASE_STORAGE_BUCKET`)
4. Add these env vars to Vercel (Project → Settings → Environment Variables):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET` (optional)

Once set, the app will automatically read/write models from Supabase and upload images to the bucket.

