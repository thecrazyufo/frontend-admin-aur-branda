# 🏗️ Multi-Tenant Software Selling Platform — System Architecture

This document serves as the master architectural reference for the multi-tenant, highly scalable software selling platform. The platform is designed to effortlessly scale to dozens of unique brands from a single consolidated codebase with absolute tenant isolation.

---

## 1. High-Level Architecture Overview

The system is composed of three primary layers:
1. **Tenant Backend (`Tenant_Backend/`)**: A Java Spring Boot REST API backed by Liquibase & H2/PostgreSQL, managing central data, tenant configurations, licensing, and security.
2. **Admin Portal (`Tenant_Frontend_Admin/`)**: A Next.js (App Router) React application serving as the administrative dashboard for Owners, Brand Managers, and Content Creators.
3. **Storefront Engine (`storefront-core/`)**: An Astro + React application that dynamically generates entirely isolated public-facing websites based on the requested brand context.

### The Multiplexing Paradigm
Unlike traditional architectures that duplicate codebases per client, this platform utilizes **Container-Level Multiplexing**. 
- The `docker-compose.yml` mounts the exact same `./storefront-core` directory to multiple isolated Node.js containers (e.g., `brandA` on Port 3001, `brandB` on Port 3002).
- Each container receives a unique `PUBLIC_SITE_ID` environment variable.
- The Astro engine reads this variable at runtime, hits the Backend API to fetch its specific colors, layout templates, and products, and boots up as a visually distinct website without sharing a single byte of memory with its siblings.

---

## 2. Core Entities & Database Design

Database versioning is managed via **Liquibase** (`src/main/resources/db/changelog/`). 
Key configurations are driven by the `brand_configs` and `site_settings` tables.

### The `brand_configs` Table (The Tenant Registry)
This is the master switchboard for the platform.
* `id` (String): The tenant identifier (e.g., `brandA`, `brandLuxury`).
* `dev_port` (String): The local port assigned for development (e.g., `3001`).
* `layout_template` (String): Dictates the DOM structure the Astro engine should render (e.g., `classic`, `modern`, `minimal`).
* `theme_colors` (JSON): Stores hex codes for dynamic CSS repainting (`primaryColor`, `primaryDark`, `primaryLight`, `accentColor`).
* `logo_url` (String): The absolute URL to the brand's logo.

---

## 3. The Storefront Engine (`storefront-core`)

The storefront relies on Astro's **Server-Side Rendering (SSR)** to guarantee lightning-fast performance and flawless SEO.

### Dynamic Rendering (`BaseLayout.astro`)
1. **API Call**: On every request, Astro fetches `BrandAPI.getCurrentBrand()`.
2. **CSS Variables**: It dynamically extracts the brand's colors and injects them into a `<style>` block in the HTML `<head>`.
3. **Layout Switching**: It evaluates `brandConfig.layoutTemplate` to conditionally render entirely different React component trees (e.g., swapping a `<ClassicHero />` for an `<EcommDarkHero />`). 
4. **Client Delivery**: Because Astro isolates JavaScript into "Islands," unused layout components are completely stripped from the final client bundle.

### Ultra-SEO Compliance
* **Sitemaps**: `sitemap.xml.ts` dynamically evaluates the `PUBLIC_SITE_ID` and queries the backend for the tenant's specific products and blogs, generating a pristine, isolated XML sitemap.
* **Robots.txt & Meta**: Managed natively per brand via `robots.txt.ts` and `<BaseLayout>`.
* **Canonical Headers**: Automatically reconstructs the pristine URL, stripping tracking parameters to prevent duplicate indexing.

---

## 4. The Admin Experience (`Tenant_Frontend_Admin`)

The Next.js Admin Panel acts like a traditional multi-tenant SaaS application but introduces aggressive frontend UI isolation.

### Dynamic Tailwind Theming
The UI uses Tailwind CSS v4. Instead of hardcoding hex values in the `@theme` block, the `globals.css` maps tokens to CSS custom variables:
```css
@theme {
  --color-primary: var(--dynamic-primary, #1a56db);
  --color-primary-dark: var(--dynamic-primary-dark, #1342b5);
}
```
The root Next.js layout (`layout.tsx`) dynamically injects these variables based on the active brand, instantly repainting the entire dashboard (buttons, focus rings, borders) to match the brand.

### Strict Role-Based UI Isolation
* **`SUPER_ADMIN`**: Can see the "Active Storefront" dropdown and multiplex across any brand on the server.
* **`BRAND_MANAGER` / `ADMIN`**: The dropdown is physically removed from the DOM. They see a locked badge with their brand name and logo, ensuring they have no awareness of sibling tenants on the platform.

---

## 5. Security & Tenant Validation

### Backend Interceptor (`TenantFilter.java`)
Every single request hitting the Spring Boot backend must pass the Tenant Guard.
1. The frontend (`api.ts`) automatically appends `?siteId=brandA` or a `X-Tenant-ID` header to all outgoing requests.
2. If the endpoint requires authentication, Spring Boot compares the incoming `siteId` against the JWT token's `AuthService.getBrandId()`.
3. If a user assigned to Brand A attempts to fetch or modify data for Brand B, the system immediately throws a `403 Forbidden`.
4. `SUPER_ADMIN` roles bypass this check.

---

## 6. How to Deploy a New Brand (Brand F Workflow)

Scaling the business requires **zero duplicated code**.
1. **Database**: Insert a new row into `brand_configs` (e.g., `id: brandF`, `layout_template: minimal`).
2. **Docker Orchestration**: Add a block to `docker-compose.yml`:
   ```yaml
     brandF:
       build:
         context: ./storefront-core
       image: brandf
       ports:
         - "3006:4321"
       environment:
         - PUBLIC_SITE_ID=brandF
   ```
3. **Execution**: Run `docker compose up -d brandF`. The brand is instantly live, fully isolated, visually distinct, and SEO-compliant.
