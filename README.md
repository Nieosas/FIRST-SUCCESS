# PhoneDeck — Phone Accessories Shop

A full-stack phone accessories shop built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS**, backed by **Supabase** (Postgres + Auth) with **Google OAuth** sign-in and **Mailgun** order-confirmation emails.

## Features

- Product catalog, product detail pages, and a cart
- **Shared, cross-device cart** — signed-in users' carts are stored in a Supabase
  `cart_items` table and sync instantly (Supabase Realtime) between the website and
  the mobile app. Guests fall back to `localStorage`.
- Checkout page that persists orders + order items to Supabase (server-side price calculation, service-role writes)
- Order history for signed-in users (row-level security)
- Google sign-in via Supabase Auth (Google Cloud Console OAuth credentials)
- Order-confirmation emails sent through Mailgun
- **Mobile app** (Expo / React Native) in [`mobile/`](mobile/) sharing the same backend,
  auth, and cart

## Stack

| Concern        | Tech                                                          |
| -------------- | ------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Database/Auth  | Supabase (`@supabase/supabase-js`, `@supabase/ssr`)           |
| Email          | Mailgun (REST API via `fetch`)                                |
| Payments       | Demo/mock (no real money moves)                               |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Open the **SQL editor** and run the contents of `supabase/schema.sql`. This creates the `products`, `orders`, `order_items`, and `cart_items` tables (plus cart RPC helpers and the Realtime publication), enables row-level security, and seeds the product catalog.
3. In **Project Settings → API**, copy:
   - `Project URL`
   - `anon` public key
   - `service_role` key (keep this secret / server-only)

### 3. Set up Google sign-in (Google Cloud Console)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**.
2. Create an **OAuth 2.0 Client ID** (application type: **Web application**).
3. Add **Authorized redirect URIs**:
   - `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback` (replace with your Supabase URL)
4. Copy the **Client ID** and **Client secret**.
5. In Supabase → **Authentication → Providers → Google**, enable Google and paste the Client ID and Client secret.

> Note: the app's own `https://YOUR-SITE/auth/callback` route is *not* the OAuth redirect; Supabase handles the Google OAuth flow and redirects back through its own callback, which then lands on our `/auth/callback` route via `redirectTo`.

### 4. Set up Mailgun

1. Create a [Mailgun](https://www.mailgun.com) account and add a domain.
2. Copy your **API key** and **sending domain** (e.g. `mg.yourdomain.com`).
3. (For production) verify a sender address or use your verified domain in the `from` field.

### 5. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=YOUR_DOMAIN.mailgun.org
MAILGUN_FROM=PhoneDeck <orders@YOUR_DOMAIN.mailgun.org>

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    api/checkout/route.ts   # creates order + sends email (server)
    auth/callback/route.ts  # exchanges OAuth code for session
    checkout/               # checkout + success pages
    cart/                   # cart page
    orders/                 # order history (signed-in users)
    products/[id]/          # product detail page
    page.tsx                # home / catalog
  components/               # Header, ProductCard, cart context, etc.
  lib/
    supabase/               # browser, server, and admin clients
    mailgun.ts              # Mailgun email sender
    types.ts                # DB + domain types
  middleware.ts             # Supabase session refresh
mobile/                     # Expo/React Native app (same backend, shared cart)
supabase/schema.sql         # schema + RLS + cart helpers + seed data
```

### How the shared cart works

- `supabase/schema.sql` creates `cart_items` (`user_id`, `product_id`, `quantity`) with
  row-level security and four RPC helpers (`add_cart_item`, `set_cart_quantity`,
  `remove_cart_item`, `clear_cart`), and adds the table to the `supabase_realtime`
  publication.
- The web `CartProvider` (`src/components/cart-context.tsx`) and the mobile
  `CartProvider` (`mobile/src/context/CartContext.tsx`) both:
  1. use `localStorage` / AsyncStorage while signed out,
  2. load the server cart and subscribe to `postgres_changes` while signed in,
  3. merge any guest cart into the server cart on sign-in.
- Because every mutation goes through the database and Realtime fans the change out,
  the two apps stay in sync instantly.

## Security notes

- Public (`anon`) access can only read products. Orders are written server-side with the `service_role` key, which is never exposed to the browser.
- Row-level security ensures users can only read their own orders/order items.
- Prices are recalculated on the server during checkout — client-supplied prices are ignored.
