# HN PMD - WooCommerce Sync Dashboard

Minimal, clean, modern, and mobile-responsive admin workspace for syncing catalog products, categories, and attributes to edge database structures (D1 database and R2 cloud storage).

## Key Features

- **Slate Light Theme**: Harmonious, high-contrast cool slate gray palette, flat off-white widgets, solid headers, clean gray borders, and custom shadow tokens. No distracting color gradients or purple borders.
- **Store Overview**: Real-time overview of synced records, system log history sheets, and sync health stats.
- **Category Manager**: Add, upload banners (R2 storage), list active categories, and remove categories.
- **Product Catalog & Editing (CRUD)**: Multi-step creation & edit pipeline for product details, pricing, descriptions (HTML tags parsed to plain text for visual clarity), media gallery sorting, category tagging, and attribute configurations. Equips double-click submit debounces and SEO slug safety locks.
- **Mobile Responsive Layout**: Compact catalog views, responsive mobile overlays, smooth sidebars, sticky headers, and responsive drawers.

## Core Technologies

- **React** + **Vite** + **TypeScript**
- **Tailwind CSS v4** (Solid styling using tailwind tokens)
- **Lucide React** (Minimalistic clean icons)
- **WooCommerce Rest API Mapping**
- **Edge Storage**: Cloudflare D1/R2.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env` file templates and configure backend endpoints and credentials.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```
