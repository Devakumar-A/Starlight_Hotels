# Starlight Hotels — Official Web Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-gold.svg)](#)

The modern, high-performance direct booking and discovery platform for **Starlight Hotels & Resorts**, featuring overnight luxury stays, **flexible hourly stays**, beachside villas, and boutique accommodations across **Pondicherry**, **Chennai**, and **Kodaikanal**.

---

## 🌟 Key Features

- **Overnight & Flexible Hourly Stays**:
  - Book by the day or choose **flexible hourly stay / short-stay packages** for transit travelers, business stopovers, or quick refreshes.
  - Transparent pricing breakdowns with automated 5% GST calculation.
- **Direct Booking Engine**: Real-time room category availability, multi-guest selection, transparent rates, and direct checkouts.
- **Dynamic Property Directory**: 17+ active properties spanning boutique hotels, city transit rooms, and private beachside villas.
- **SEO & Search Dominance**:
  - Semantic, search-engine-friendly URLs (`/hotels/:city/:slug`).
  - High-intent destination and thematic hubs (`/hotels-in-pondicherry`, `/hotels-in-chennai`, `/hotels-in-kodaikanal`, `/villas-in-pondicherry`, `/pondicherry-hotels-with-swimming-pool`, etc.).
  - Complete Schema.org JSON-LD microdata (`Hotel`, `ItemList`, `FAQPage`, `BreadcrumbList`, `Organization`).
  - Dynamic OpenGraph and Twitter card metadata powered by `react-helmet-async`.
  - Automated XML sitemap generation for dynamic property inventory.
- **Pre-rendering Pipeline**: Post-build snapshot engine via headless Puppeteer delivering fully pre-rendered static HTML for hub pages and hotel routes, ensuring instant indexing by search engine crawlers without client-side JavaScript execution.
- **Responsive Luxury Design**: Built with Tailwind CSS v4 and Motion animations, optimized for mobile-first speed, fluid browsing, and accessibility.
- **Guest Experience**: WhatsApp direct booking concierge, interactive photo galleries, property amenities breakdown, FAQ accordions, and customer reviews.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations & Icons**: [Motion](https://motion.dev/) & [Lucide React](https://lucide.dev/)
- **State & Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Metadata Management**: [react-helmet-async](https://github.com/staylor/react-helmet-async)
- **Pre-rendering & SEO Automation**: [Puppeteer](https://pptr.dev/) & custom Node.js automation scripts

---

## 📁 Project Structure

```text
Starlight_website-main/
├── public/                     # Static assets, sitemaps, icons, _redirects
├── scripts/
│   ├── generate-sitemap.mjs    # Dynamic XML sitemap generator
│   └── prerender.js            # Post-build snapshot prerenderer (Puppeteer)
├── src/
│   ├── components/             # Reusable UI components (Navbar, Footer, Modals)
│   ├── data/                   # Hub route data and static configurations
│   ├── lib/                    # Supabase client and SEO utility helpers
│   ├── pages/                  # Route views (Home, Availability, HotelDetails, etc.)
│   ├── services/               # Data fetching layer (hotels, pricing, amenities)
│   ├── App.jsx                 # Client-side router & route definition
│   └── main.jsx                # Application root with HelmetProvider
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- `npm` or `pnpm`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/starlight-hotels-frontend.git
   cd starlight-hotels-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Development

Run the local development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Build & Pre-rendering

The build pipeline automates sitemap regeneration, Vite bundling, and static snapshot pre-rendering:

```bash
# Standard production build (sitemap + bundle + prerender snapshot)
npm run build

# Generate XML sitemap independently
npm run sitemap

# Run post-build prerender independently
npm run prerender

# Run prerender in strict mode (fails with non-zero exit code if any route fails)
npm run prerender:strict

# Preview the production build locally
npm run preview
```

---

## 🌐 Deployment

Configured for continuous deployment on modern CDN hosts (such as **Netlify** or **Vercel**):
- Evaluates static prerendered files (`dist/<route>/index.html`) first for instant SEO delivery.
- Uses standard fallback rewrites (`/* /index.html 200`) in `public/_redirects` to maintain full client-side SPA routing.

---

## 📄 License

Proprietary — All rights reserved © Starlight Hotels & Resorts.
