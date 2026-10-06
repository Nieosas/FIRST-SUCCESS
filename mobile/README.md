# PhoneDeck — Mobile App (Expo / React Native)

A native iOS/Android app that talks to the **same Supabase backend** as the
`PhoneDeck` web shop. Sign in with the same Google account, and your cart stays
in sync across the website and this app.

## What it does

- **Same account** — Google sign-in via Supabase Auth (identical user pool as the web app).
- **Shared cart** — the cart lives in a Supabase `cart_items` table, so items added
  on the website appear here and vice-versa.
- **Instant sync** — the app subscribes to Supabase Realtime (`postgres_changes` on
  `cart_items`); cart changes from any device show up immediately. Pull-to-refresh on
  the home screen is a manual fallback.
- Product catalog, product detail, order history, and a checkout screen that POSTs to
  the web app's `/api/checkout` endpoint.

## Prerequisites

- Node.js 18+
- The web app's Supabase project, with `supabase/schema.sql` run (it now includes the
  `cart_items` table, its RLS policies, RPC helpers, and the Realtime publication).
- Expo Go on your phone, or a simulator.

## Setup

1. Install dependencies:

   ```bash
   cd mobile
   npm install
   ```

   > If npm resolves a peer-dependency conflict, run `npx expo install` to align
   > package versions with the installed Expo SDK.

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (same values
   as the web app's `NEXT_PUBLIC_*` keys), and `EXPO_PUBLIC_SITE_URL` (the web app's
   origin, e.g. `http://localhost:3000`).

3. Run it:

   ```bash
   npx expo start
   ```

   Scan the QR code with Expo Go, or press `a` / `i` for an emulator.

## Google sign-in (deep link)

The app uses Supabase's Google OAuth flow with an in-app browser and a deep-link
redirect. The scheme is `phoendeck` (see `app.json`).

1. In Supabase **Authentication → URL Configuration**, add the redirect URL:
   - Expo Go (development): `exp://YOUR-EXPO-GO-URL/--/auth/callback`
   - Dev/production build: `phoendeck://auth/callback`
2. The Google provider itself is the same one the web app already uses — no new
   Google client IDs are required, because Google redirects to Supabase's callback
   and Supabase forwards to your app via the redirect URL above.

## Notes

- Guests (not signed in) keep their cart on-device in AsyncStorage. When they sign in,
  the guest cart is merged into their server cart automatically.
- The checkout endpoint lives on the web app (`/api/checkout`); it performs
  server-side price calculation, so mobile-supplied prices are ignored — same as web.
