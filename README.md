# Atelier — Inventory & Marketplace

Atelier is a two-part web application (Next.js frontend + Django REST API) that connects verified artisans ("Maalems") with clients. Maalems publish handcrafted items (title, description, photo, pricing, stock) and manage their inventory. Clients browse products, like and comment on items, make offers, and convert accepted offers into orders. Admins can review platform activity and send notifications to Maalems and clients.

**Key features**
- Public product listing with search and category filters
- Maalem product CRUD (create, edit, delete) and portfolio pages
- Client phone-based authentication and profile pages
- Make offers on items, view offers, convert offers to orders
- Like and comment on items
- Notifications targeted to Maalems and Clients
- Admin dashboard slices (analysis, offers)

**User roles & flows**
- Maalem: sign up → create/manage masterpieces → view offers and notifications
- Client: sign up/login → browse products → like/comment → make offers → convert accepted offers to orders
- Admin: review offers/orders and create/send notifications

**Representative client pages**
- [client/app/(public)/products/page.tsx](client/app/(public)/products/page.tsx) — public product listing
- [client/app/(public)/products/[id]/page.tsx](client/app/(public)/products/[id]/page.tsx) — product detail
- [client/app/(auth)/login/page.tsx](client/app/(auth)/login/page.tsx) — phone-based login UI
- [client/app/(dashboard)/maalem/products/new/page.tsx](client/app/(dashboard)/maalem/products/new/page.tsx) — Maalem create product
- Dashboard and other slices: [client/app/(dashboard)](client/app/(dashboard))

**API surface (high level)**
Top-level API includes are configured in [server/api/urls.py](server/api/urls.py).

Inventory (examples):
- GET `/inventory/item/` — list all items ([server/inventory/views.py](server/inventory/views.py))
- GET `/inventory/item/<id>/` — item details
- POST `/inventory/item/post/` — create item
- Maalem-scoped endpoints: `/inventory/maalem/items/<maalem_id>/` and related POST/PUT/DELETE
- Likes/comments endpoints: `/inventory/item/like/<client_id>/`, `/inventory/item/comment/<client_id>/`, `/inventory/item/comments/<item_id>/`

Sales (examples):
- GET `/sales/offers/`, POST `/sales/offers/create/`, GET/PUT/DELETE `/sales/offers/<offer_id>/`
- Orders endpoints and convert offer→order: `/sales/orders/create-order/` ([server/sales/views.py](server/sales/views.py))

Notifications:
- Notification CRUD and recipient-specific lists: `/notify/` endpoints ([server/notify/views.py](server/notify/views.py))

Users:
- Client and Maalem login by phone: `/users/client/login/<phoneNumber>/`, `/users/maalem/login/<phoneNumber>/` (phone-based login implemented via GET in current code) ([server/users/urls.py](server/users/urls.py)).

**Tech stack**
- Frontend: Next.js 16 (React 19), TypeScript, Tailwind CSS, axios, framer-motion, recharts — see [client/package.json](client/package.json)
- Backend: Django 6, Django REST Framework, sqlite3 — see [server/requirements.txt](server/requirements.txt) and [server/manage.py](server/manage.py)

**Local development (quick start)**
1. Start backend (recommended in a Python virtualenv):
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r server/requirements.txt
cd server
python manage.py migrate
python manage.py runserver 8000
```

2. Start frontend:
```bash
cd client
npm install
npm run dev
# open http://localhost:3000
```

Note: client source files currently call the backend at a local address. For local development this README uses `http://localhost:8000`.

**Quick verification**
- Visit `http://localhost:3000/products` to see the inventory listing.
- Create a Maalem and add an item via `/maalem/products/new`, then confirm it appears in the public listing.
- Make an offer as a client and check `/sales/offers/` on the API to verify it was created.

**Notes & caveats**
- Authentication is phone-based and currently implemented as a GET request with phone number in the URL — this is insecure for production and should be replaced with a proper auth flow.
- Some backend URLs are hardcoded in client code to a specific IP; consider centralizing the backend URL into an environment variable (e.g., `BACKEND_URL`).
- A hidden admin login path and other sensitive endpoints exist; keep those secured.

**References (important files)**
- [server/api/urls.py](server/api/urls.py)
- [server/inventory/views.py](server/inventory/views.py)
- [server/sales/views.py](server/sales/views.py)
- [server/notify/views.py](server/notify/views.py)
- [server/users/urls.py](server/users/urls.py)
- [client/package.json](client/package.json)
- [client/app/(public)/products/page.tsx](client/app/(public)/products/page.tsx)

If you'd like, I can: (1) add a short contribution guide, (2) centralize backend URLs in the client to use an env var, or (3) create a separate `server/README.md` and `client/README.md` with more granular instructions — tell me which and I'll implement it next.
