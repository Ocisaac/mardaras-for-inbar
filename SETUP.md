# Madrasa Mobile PWA — Setup Guide

## What this is

A mobile-first PWA that wraps madrasafree.com through a Cloudflare Worker proxy.
The Worker strips tracking scripts (which cause slow loading) and injects mobile CSS.
The PWA installs on your iPhone from Safari — no App Store needed.

---

## Step 1 — Create a Cloudflare account

Go to https://dash.cloudflare.com/sign-up (free, no credit card needed).

---

## Step 2 — Deploy the Worker (proxy)

```bash
cd worker
npm install
npx wrangler login        # opens browser to authenticate with Cloudflare
npx wrangler deploy
```

After deploying, you'll see a URL like:
```
https://madrasa-proxy.YOUR_NAME.workers.dev
```

Copy that URL.

---

## Step 3 — Configure the PWA

```bash
cd pwa
cp .env.local.example .env.local
```

Edit `.env.local` and paste your Worker URL:
```
VITE_WORKER_URL=https://madrasa-proxy.YOUR_NAME.workers.dev
```

---

## Step 4 — Deploy the PWA

```bash
cd pwa
npm run build
npx wrangler pages deploy dist --project-name madrasa-pwa
```

You'll get a URL like:
```
https://madrasa-pwa.pages.dev
```

---

## Step 5 — Install on iPhone

1. Open the Pages URL in **Safari** on your iPhone
2. Sign in with your madrasafree.com credentials
3. Tap the **Share** button (box with arrow)
4. Tap **Add to Home Screen**
5. Tap **Add**

The app now lives on your home screen like a native app.

---

## Local development

Run both locally at once:

**Terminal 1 — Worker:**
```bash
cd worker
npx wrangler dev
# Runs at http://localhost:8787
```

**Terminal 2 — PWA:**
```bash
cd pwa
# .env.local should have VITE_WORKER_URL=http://localhost:8787
npm run dev
# Opens at http://localhost:5173
```

---

## Architecture

```
iPhone Safari (PWA at pages.dev)
    ↓
Cloudflare Worker (workers.dev)
  • Strips GTM, Facebook Pixel, GA4, WhatsApp scripts
  • Injects mobile CSS overrides
  • Caches lesson HTML (1 hour)
    ↓
madrasafree.com / courses.madrasafree.com
```
