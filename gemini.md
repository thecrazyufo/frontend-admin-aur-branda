# Gemini Developer Guide (Antigravity Assistant)

This file contains crucial instructions, standard commands, and architectural context for the Multi-Tenant Software Selling Platform. Refer to this to save tokens and maintain consistency across sessions.

---

## 🚀 Common Commands

### Spring Boot Backend (`Tenant_Backend/`)
* **Compile Backend:** `mvn clean compile`
* **Run Local (H2 In-Memory DB):** `mvn spring-boot:run` (runs on Port `8080`)
* **Run with Specific Profile:** `mvn spring-boot:run -Dspring-boot.run.profiles=prod`

### Next.js Admin Frontend (`Tenant_Frontend_Admin/`)
* **Run Local Dev Server:** `npm run dev` (runs on Port `3000`)
* **Build Next.js App:** `npm run build`
* **Start Production Server:** `npm run start`

### Docker & Services
* **Start All Services (Docker):** `docker compose up --build`
* **Stop Docker Services:** `docker compose down`
* **Start Services Script:** `./start.sh` (gracefully stops existing local ports first)
* **Stop Services Script:** `./stop.sh` (stops docker containers and terminates ports 3000, 3001, 8080)

---

## 🎨 UI/UX Design System & Component Library

The admin panel frontend utilizes **Tailwind CSS v4** with a custom theme defined in `globals.css`. All admin subpages are designed to be dark-first, clean, minimal, and highly spacious (inspired by Stripe, Vercel, and Linear).

* **Strict Design Reference:** Always read and follow the typography, colors, and design patterns specified in [DESIGN.md](file:///Users/akashsahu.blue/Documents/Akas/software-selling-platform/DESIGN.md) before creating, modifying, or planning any user interfaces.

### 1. Central Primitives (`components/ui/`)
All pages must utilize these centralized component wrappers instead of custom styles or raw HTML elements:
* **Button** ([Button.tsx](file:///Users/akashsahu.blue/Documents/Akas/software-selling-platform/Tenant_Frontend_Admin/components/ui/Button.tsx)): Standardized variants (`default`, `outline`, `secondary`, `destructive`, `ghost`, `link`) with smooth active scale transitions.
* **Card** ([Card.tsx](file:///Users/akashsahu.blue/Documents/Akas/software-selling-platform/Tenant_Frontend_Admin/components/ui/Card.tsx)): Outer box wrappers with hairline borders (`border-zinc-200` / `border-zinc-800`), header layouts, titles, descriptions, and content areas.
* **Table** ([Table.tsx](file:///Users/akashsahu.blue/Documents/Akas/software-selling-platform/Tenant_Frontend_Admin/components/ui/Table.tsx)): Standardized grid layouts supporting responsive wrappers, alignment, and hover overlays.
* **Input / Select** ([Input.tsx](file:///Users/akashsahu.blue/Documents/Akas/software-selling-platform/Tenant_Frontend_Admin/components/ui/Input.tsx) / [Select.tsx](file:///Users/akashsahu.blue/Documents/Akas/software-selling-platform/Tenant_Frontend_Admin/components/ui/Select.tsx)): Form input controllers supporting default margins, focus rings (`focus-visible:ring-indigo-500/20`), and placeholder properties.
* **Badge** ([Badge.tsx](file:///Users/akashsahu.blue/Documents/Akas/software-selling-platform/Tenant_Frontend_Admin/components/ui/Badge.tsx)): Status tags supporting `default`, `secondary`, `destructive`, `outline`, `success`, and `warning` variants.

---

## 🔒 Tenant & Security Architecture

### 1. Brand & Port Schemes
* **Admin Frontend:** Port `3000`
* **Tenant Backend:** Port `8080`
* **Storefront Sites:**
  * `brandA` $\rightarrow$ Port `3001` (Default Site ID: `brandA`)
  * `brandB` $\rightarrow$ Port `3002` (Default Site ID: `brandB`)
  * `brandC` $\rightarrow$ Port `3003` (Default Site ID: `brandC`)
  * `brandD` $\rightarrow$ Port `3004` (Default Site ID: `brandD`)
  * `brandE` $\rightarrow$ Port `3005` (Default Site ID: `brandE`)

### 2. Administrative Credentials (Database Store)
Stored in the `admin_users` table in the system database (changeset `002-admin-users` in Liquibase master).
* Format: database row containing `username`, `password` (BCrypt-hashed), `role`, `brandId`, `fullName`, and `email`.
* Default administrative profiles are seeded automatically at start in [DatabaseSeeder.java](file:///Users/akashsahu.blue/Documents/Akas/software-selling-platform/Tenant_Backend/src/main/java/com/datamigratepro/seeder/DatabaseSeeder.java).
* Roles: `SUPER_ADMIN` (global access / owner level), `ADMIN`, `SEO_CW_PRODUCT_MANAGER`
* Brand Scope: `brandA`–`brandE` (or `all` for super admins)
* **Security Guard**:
  * Passwords must be securely hashed with BCrypt.
  * Backend endpoints on `OwnerController` encrypt passwords on-the-fly when saving and strip passwords from returned list payloads.
  * Frontend admin screens hide password displays using mask tags and treat password entry as optional on profile updates.

### 3. Tenant Isolation Guard
Check access programmatically in controllers or services using:
```java
SecurityUtils.checkAccess(String siteId);
```
* Bypasses checks for unauthenticated public storefront GET requests.
* Bypasses checks for the `SUPER_ADMIN` (or legacy `OWNER`) role.
* Checks that the administrator's assigned `brandId` matches the request's `siteId` (throws `403 Forbidden` if they differ).

### 4. Admin Routing Registry (`app/(dashboard)/layout.tsx`)
Administrators land on the **Dashboard Overview & Analytics** screen (`/[brandId]`) which queries products, licenses, and metadata dynamically for the selected brand storefront. Access is restricted using standard Next.js path guards in the layout wrapper shell.

---

## 🌐 Production Infrastructure & Deployment Layout

The live system uses a hybrid hosting model across Vercel and DigitalOcean VPS:

```
                  ┌──────────────────────────────────────────────┐
                  │                 Vercel                       │
                  │   - admin.thecrazyufo.in (Admin Dashboard)   │
                  │   - branda.thecrazyufo.in (Storefront)       │
                  └──────────────────────┬───────────────────────┘
                                         │
                                  Public API Calls
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          DigitalOcean VPS (64.227.150.88)    │
                  │   - api.thecrazyufo.in (Backend REST API)    │
                  │   - PostgreSQL Database (Port 5432)          │
                  └──────────────────────────────────────────────┘
```

### 1. Frontend Hosting (Vercel)
* **Domains:** `admin.thecrazyufo.in`, `branda.thecrazyufo.in`
* **DNS Settings:** CNAME records are pointed to Vercel's edge network: `cname.vercel-dns.com`.
* **Deployment Workflow:** Auto-deploys on every commit/push to the `main` branch of the GitHub repository `thecrazyufo/frontend-admin-aur-branda`.

### 2. Backend & Database Hosting (DigitalOcean VPS)
* **Domain:** `api.thecrazyufo.in`
* **IP Address:** `64.227.150.88`
* **Orchestration:** Managed via Docker Compose under the `/root/deploy_vps` directory on the VPS (composed of `db_postgres`, `software_tenant_backend`, and `software_caddy`).
* **Deployment Workflow:**
  1. Build the production backend Docker image locally for the target VPS Linux CPU architecture (`linux/amd64`) instead of local Mac architecture (`arm64`) using cross-compilation (`--platform linux/amd64`).
  2. Package it as a `.tar.gz` archive.
  3. Upload the archive along with the updated Caddy and Docker configuration files to the VPS via `scp`.
  4. SSH into the VPS to load the image, stop old container conflicts, and run `docker compose up -d`.
  *This is automated using the [deploy_vps/deploy.sh](file:///Users/akashsahu.blue/Documents/Akas/software-selling-platform/deploy_vps/deploy.sh) script. It explicitly targets `linux/amd64` to prevent `exec format error` crashes on the Linux VPS.*

### 3. Local Host Mapping (Mac Developer Environment)
Developers must keep their local `/etc/hosts` clean and only map `api.thecrazyufo.in` to allow backend resolution:
```hosts
64.227.150.88 api.thecrazyufo.in
```

---

## 🌐 Storefront SEO & Markdown Features

1. **Server-Side Markdown Renderer**:
   * Uses `parseMarkdownToHtml()` inside `src/lib/utils.ts` for all brand storefronts (`brandA`–`brandE`).
   * Parsed HTML is injected directly using Astro `set:html` attribute on articles and blog pages.
2. **Search Engine Crawler Control**:
   * Layouts (`BaseLayout.astro`) support `noindex` configuration parameters.
   * Specific storefront routes (search, checkout, trial download) explicitly enforce indexation blocks.
3. **Canonical Link Optimization**:
   * Storefront layout headers dynamically reconstruct the current URL, stripping all incoming tracking, pagination, or query arguments to prevent duplicate search engine index points.
4. **Lead Capture Modal Forms**:
   * Auto-download params redirect to a lead form inside `download/index.astro`. The frontend posts target emails and product details to the backend API (`/api/download/trial`) to record leads and retrieve download paths.

---

## 🪙 Token-Saving Tips & Guidelines

1. **Prefer Programmatic API Testing:**
   * Do not invoke the heavy Browser Subagent for routine auth or API checks.
   * Run the custom integration test script:
     ```bash
     node /Users/akashsahu.blue/.gemini/antigravity-ide/brain/2aee307c-83e0-457f-8a63-f1410acfe25a/scratch/test_isolation.js
     ```
2. **Dynamic DB Profiles:**
   * The default active profile is `test` which uses H2 in-memory. You do **not** need a running PostgreSQL server to debug or execute the backend locally.
3. **File Scanning Boundaries:**
   * Target specific directories/files rather than broad directory lookups. Avoid running wild search patterns (`*`) to preserve context windows.
4. **Hot Reloading Context:**
   * Updates to credentials via the Owner controller dynamically save to the system database tables, avoiding compile, rebuild, or restart delays.

---

## ⚠️ Brand Exclusivity Rule (Strict Constraint)
* **Brand Exclusivity:** All storefront design refinements, styling edits, component changes, and feature updates must be applied **exclusively** to the `brandA` storefront (`storefront-brandA`). Do **NOT** make any changes to `brandB`, `brandC`, `brandD`, or `brandE` storefronts until the `brandA` storefront design is finalized and approved by the user. Once approved, the changes will be propagated to the other brands.
