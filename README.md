# Project-Shukriya
Patreon Website For Creators
# Shukriya

A tipping page for Indian creators. Fans leave a short note and a small payment; the money goes straight to the creator's own Razorpay account — the platform never holds it.

**Stack:** Next.js 14 (App Router, Server Actions, Middleware) · React 18 · Tailwind CSS · NextAuth.js (GitHub/Google OAuth, JWT sessions) · MongoDB + Mongoose · Razorpay Orders API + HMAC signature verification · Zod validation · AES-256-GCM encryption for stored credentials · Framer Motion · react-hot-toast · lucide-react.

## Features

- Creator pages at `/<username>` with cover, bio, running total, supporter count and a "notes wall" (recent / top).
- One-click OAuth login; a profile and unique username are created automatically on first sign-in.
- Dashboard to edit profile, change username (existing tips move with you) and connect Razorpay keys.
- Tipping flow: validated form → Razorpay order created on the **creator's** account → Checkout (UPI/cards/netbanking) → server-side signature verification → note appears on the page.
- Razorpay key secret encrypted at rest; never returned to the browser.
- `/explore` directory of creators, Open Graph metadata per creator page, mobile-first UI.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the values (see comments in the file)
npm run dev                  # http://localhost:3000
```

Required environment variables: `MONGODB_URI`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`, `NEXT_PUBLIC_URL`, `CREDENTIALS_KEY`. Optional: `GOOGLE_ID`, `GOOGLE_SECRET`.

Generate keys:

```bash
openssl rand -base64 32                                                  # NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" # CREDENTIALS_KEY
```

GitHub OAuth app callback URL: `http://localhost:3000/api/auth/callback/github`.

To test payments, use Razorpay **test** keys (`rzp_test_…`) in the dashboard and Razorpay's test UPI/cards.

## Project structure

```
app/                     Routes (App Router)
  page.js                Home
  explore/               Creator directory
  about/                 How it works + FAQ
  login/                 OAuth login (server-redirects if already signed in)
  dashboard/             Creator settings (protected by middleware + server check)
  [username]/            Public creator page + tip form
  api/auth/[...nextauth] NextAuth handler
  api/razorpay/          Payment callback: verifies HMAC signature, marks tip paid
actions/                 Server Actions (creator.js, payments.js)
components/              UI components
db/connectDb.js          Cached Mongoose connection
lib/auth.js              NextAuth options + callbacks (user bootstrap, JWT)
lib/crypto.js            AES-256-GCM encrypt/decrypt
lib/validation.js        Zod schemas shared by client and server
middleware.js            Route protection
models/                  User, Payment schemas
```

## Deploy

Works on Vercel out of the box. Set the same environment variables in the project settings and point `NEXTAUTH_URL` / `NEXT_PUBLIC_URL` to the production domain; update the OAuth callback URL accordingly.
