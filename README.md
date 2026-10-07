# Whiteheart

E-commerce storefront for the Whiteheart cap brand — built with Next.js 15 (App Router), React 19, Tailwind CSS v4 and TypeScript, backed by Supabase (auth, Postgres, storage) with Paystack for payments.

## Getting started

Install dependencies and create your environment file:

```bash
npm install
```

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
PAYSTACK_SECRET_KEY=<sk_test_... or sk_live_...>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` and `PAYSTACK_SECRET_KEY` are server-only — they bypass Row Level Security and can charge cards, so they must never be imported into a client component or prefixed with `NEXT_PUBLIC_`.

Then run the dev server:

```bash
npm run dev
```

The app is served at http://localhost:3000.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

## Project layout

```
app/
  admin/            Admin dashboard — product CRUD, order management
  api/
    payments/       Paystack initialize + verify route handlers
    webhooks/       Paystack webhook (HMAC-verified)
  auth/             Email OTP sign-in and the Supabase auth callback
  checkout/         Checkout form and order creation
  orders/           Customer order history and detail
  payment/callback/ Post-Paystack redirect landing + server verification
  product/, shop/   Storefront catalogue
  contexts/         Cart (localStorage-backed) and notification providers
  components/       Shared UI
lib/
  supabase/         Browser, server, middleware and service-role clients
  paystack.ts       Paystack API wrapper (server-only)
  orders.ts         Idempotent order/payment reconciliation
  errors.ts         Typed helpers for reading caught unknowns
middleware.ts       Refreshes the Supabase session on each request
```

## Payments

Checkout persists the order, then `POST /api/payments/initialize` creates the Paystack transaction server-side and returns an `authorization_url` the browser is redirected to. The Paystack `reference` is the order's `order_number`, which is what lets both confirmation paths reconcile back to the order.

Payment is confirmed by the server in two independent places — the browser never marks an order paid:

1. **`POST /api/payments/verify`** — called by `/payment/callback` after Paystack redirects the customer back. Asks Paystack for the authoritative transaction status.
2. **`POST /api/webhooks/paystack`** — the reliable path, which fires even if the customer closes the tab before the redirect. Every request is authenticated against the `x-paystack-signature` HMAC.

Both funnel into `markOrderPaidByReference`, which is idempotent and refuses to mark an order paid if the charged amount doesn't match the order total.

Point the Paystack dashboard webhook (Settings → API Keys & Webhooks) at `https://<your-domain>/api/webhooks/paystack`.

## Database

Run the SQL files in the Supabase SQL editor:

- `setup_admin_access.sql` — grant/revoke `user_profiles.is_admin`
- `payment_schema_update.sql` — optional payment audit columns on `orders` (`payment_reference`, `paid_at`, `payment_details`); the payment flow works without them

Admin routes check `is_admin` client-side for UI gating only — actual access control lives in Supabase Row Level Security policies.

## Further docs

`AUTHENTICATION_SETUP.md`, `SUPABASE_SETUP_GUIDE.md`, `PAYSTACK_SETUP.md`, `ADMIN_SETUP_GUIDE.md`, `ADMIN_IMPLEMENTATION_SUMMARY.md`, `ECOMMERCE_PRODUCT_SUMMARY.md`, `PRODUCT_SUMMARY.md`.
