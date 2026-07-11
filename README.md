# CarKhana Rent A Car — frontend

Peer-to-peer car listing page. Renters browse, owners list, and WhatsApp is the
only "checkout" — nothing is booked or paid on-site. Wired directly to your
`cms-backend` `/api/cars` endpoint (search, filters, sort, pagination).

## Files

```
app/
  layout.tsx      # fonts (Sora / Inter / JetBrains Mono) + metadata
  globals.css      # tailwind + slider styling
  page.tsx         # the page itself (client component)
components/
  Header.tsx
  HeroSearch.tsx
  FilterSidebar.tsx
  CarCard.tsx
lib/
  api.ts           # types + fetchCars() + whatsappLink() matching your controller
tailwind.config.ts  # brand color/type tokens
```

Drop these into an existing Next.js 13+ App Router project (or `create-next-app`
with `--typescript --tailwind --app`), keeping the same paths.

## 1. Install the one extra dependency

```bash
npm install lucide-react
```

## 2. Point it at your backend

Add to `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

(swap for your deployed `cms-backend` URL in production)

## 3. Confirm the `@/` import alias

Your `tsconfig.json` needs:

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}
```

(`create-next-app` sets this up by default.)

## 4. CORS

Since the frontend calls `GET /api/cars` directly from the browser, make sure
`cms-backend` has CORS enabled for your frontend's origin.

## Notes on the API mapping

- `GET /api/cars?search=&city=&carType=&transmission=&fuelType=&condition=&driverOption=&seatingCapacity=&priceMin=&priceMax=&sort=&page=&limit=`
  — every filter in the sidebar/hero maps 1:1 to a query param your
  `buildCarFilters` already supports.
- The owner's `whatsapp`/`phone` comes back populated on the list endpoint
  itself (`.populate("owner", "username email phone whatsapp city")`), so
  `CarCard` builds the `wa.me` link straight from the listing — no extra
  detail-page fetch needed.
- `whatsappContact` on the `Car` document is used as the actual number dialed
  (it's the number the owner chose to publish for that specific listing).

## What I didn't build yet

- The car detail page (`GET /api/cars/:id`) — this is the search/browse page
  only, matching what you asked for.
- The "List your car" flow (`POST /api/cars`, multipart image upload) — the
  header button is wired to `#list-your-car` as a placeholder anchor. Happy to
  build that form next if useful — it'll need file inputs for 2–3 images and
  matches `CreateBlog` in your controller.
# CarKhana
