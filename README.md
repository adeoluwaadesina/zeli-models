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

