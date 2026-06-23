# Data Migrate Pro — Software Selling & Licensing Platform

Welcome to **Data Migrate Pro**, a state-of-the-art enterprise software selling and licensing platform. 

This repository houses a modern, dynamic, SEO-optimized e-commerce storefront combined with a robust, highly secure Spring Boot REST API backend and a fully isolated hardware-bound licensing portal.

---

## 🗺️ System Architecture

The platform uses a fully decoupled client-server architecture:

```
                  ┌────────────────────────────────────────────────┐
                  │                 Next.js UI                     │
                  │   (Storefront & Content / Licensing Consoles)  │
                  └───────────────────────┬────────────────────────┘
                                          │
                                   REST APIs (JSON)
                                          │
                                          ▼
                  ┌────────────────────────────────────────────────┐
                  │               Spring Boot API                  │
                  │        (Auth, Security & Operations)           │
                  └───────────────────────┬────────────────────────┘
                                          │
                                      JPA / SQL
                                          │
                                          ▼
                  ┌────────────────────────────────────────────────┐
                  │             PostgreSQL Database                │
                  │       (Products, Blogs, FAQs & Keys)           │
                  └────────────────────────────────────────────────┘
```

### Key Technical Core Stack
*   **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS (harmonious themes and custom properties).
*   **Backend**: Spring Boot 3.4.x, Spring Security (JWT Stateless Filter), JPA/Hibernate.
*   **Database**: PostgreSQL 16 (Docker-orchestrated container).

---

## 🎓 Knowledge Transfer (KT): Desktop Application Licensing System

One of the platform's core systems is the **Desktop Software Licensing & Hardware Binding Engine**. This ensures that desktop migration tools can validate their execution authenticity on every startup, while preventing key piracy and unauthorized access.

### 1. The Public Validation Workflow (`POST /api/licenses/validate`)
The desktop client makes a secure REST call to our validation server on every execution:

```
    ┌──────────────┐                  POST /api/licenses/validate                 ┌──────────────┐
    │              ├─────────────────────────────────────────────────────────────>│              │
    │ Desktop App  │    { key, orderId, hardwareFingerprint, deviceName }         │ Spring Boot  │
    │              │<─────────────────────────────────────────────────────────────┤    Server    │
    │              │       Response: { status: "SUCCESS/FAILED", licenseInfo }    │              │
    └──────────────┘                                                              └──────────────┘
```

1.  **First-Time Activation (Auto-Binding)**:
    *   When the user enters their `activationKey` and `orderId` in the desktop application, the tool sends their unique `hardwareFingerprint` (e.g. CPU/Motherboard hash) and a human-readable `deviceName`.
    *   The server locates the key, confirms it is `ACTIVE` and not expired, and checks active bindings.
    *   If active bindings are fewer than `maxDevices` (e.g. 1 machine allowed on Standard, 5 on Business), the server automatically registers the device, binds the machine hash, and returns a successful response containing tier data, expiration date, and remaining days.
2.  **Subsequent Startup Checks**:
    *   On every next start, the desktop app sends the same key and machine fingerprint.
    *   The server recognizes that this fingerprint is already bound, updates the `lastCheckIn` timestamp in the database, and returns a valid activation status payload.
3.  **Real-Time Enforcement**:
    *   If the key is revoked in the Licensing Console or expires, the next startup check instantly detects this state and returns a `FAILED` status, blocking the desktop software execution.

---

### 2. Administrative Role Isolation Strategy
To prevent general website managers and SEO content authors (who manage blogs, FAQs, and product details) from viewing, generating, or leaking product license keys, we implemented a completely segregated dashboard structure:

```
                            ┌─────────────────────────┐
                            │      JWT Auth Token     │
                            └────────────┬────────────┘
                                         │
                        ┌────────────────┴────────────────┐
                        │    Extract Username & Roles     │
                        └────────────────┬────────────────┘
                                         │
                ┌────────────────────────┴────────────────────────┐
                │                                                 │
          Username: admin                                  Username: writer
      Roles: ROLE_ADMIN,                                   Roles: ROLE_ADMIN
       ROLE_LICENSE_ADMIN                                         │
                │                                                 ▼
                ├────────────────────────┐             Access Granted:
                ▼                        ▼             ✔ /api/admin/**
         Access Granted:          Access Granted:      (Products, Blogs, FAQs)
      ✔ /api/licensing-admin    ✔ /api/admin/**           │
      (Licensing Console)    (Products, Blogs, FAQs)      ▼
                                                 Access STRICTLY DENIED:
                                                 ❌ /api/licensing-admin/**
                                                 (403 Forbidden Block)
```

1.  **Frontend Route Segregation**:
    *   **General Administration Panel** (`/admin/dashboard`): Used to manage products, categories, FAQs, and blog contents.
    *   **Licensing Console** (`/licensing/dashboard`): A completely isolated portal with a customized sidebar showing *only* license tables, key generators, and activation details.
    *   *Security Guard*: If a regular writer attempts to log into the Licensing Console, a client-side layout blocker intercepts the session, logs them out, and redirects them to the login screen with an access-denied error.
2.  **Backend Namespace Decoupling**:
    *   All administrative licensing REST APIs are mapped strictly under the dedicated path `/api/licensing-admin/**` (completely separate from `/api/admin/**`).
3.  **Spring Security Filters**:
    *   In `SecurityConfig.java`, `/api/licensing-admin/**` is protected using `.hasRole("LICENSE_ADMIN")`.
    *   This filter rule is placed chronologically above the general public `GET` permits and the general `/api/admin/**` rule inside Spring's security chain. As a result, standard administrators (who lack `ROLE_LICENSE_ADMIN`) receive a flat `403 Forbidden` response if they attempt to list, reset, or generate licenses.

---

## 🗄️ Database Schemas

```
                ┌───────────────────────────────────┐
                │           LICENSE_KEYS            │
                ├───────────────────────────────────┤
                │ id (UUID, PK)                     │
                │ activation_key (VARCHAR)          │
                │ order_id (VARCHAR)                │
                │ product_id (VARCHAR)              │
                │ pricing_tier_name (VARCHAR)       │
                │ customer_email (VARCHAR)          │
                │ status (ACTIVE, EXPIRED, REVOKED) │
                │ max_devices (INTEGER)             │
                │ created_at (TIMESTAMP)            │
                │ expires_at (TIMESTAMP, NULLABLE)  │
                └─────────────────┬─────────────────┘
                                  │
                             One To Many
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │        LICENSE_ACTIVATIONS        │
                ├───────────────────────────────────┤
                │ id (UUID, PK)                     │
                │ license_key_id (UUID, FK)         │
                │ hardware_fingerprint (VARCHAR)    │
                │ device_name (VARCHAR)             │
                │ activated_at (TIMESTAMP)          │
                │ last_check_in (TIMESTAMP)         │
                └───────────────────────────────────┘
```

---

## 🔑 Access Details & Credentials

| Portal Console | Frontend Route | Role Assigned | Default Credentials |
| :--- | :--- | :--- | :--- |
| **Licensing Console** | `/licensing/dashboard` | `ROLE_LICENSE_ADMIN` + `ROLE_ADMIN` | `admin` / `admin123` |
| **Content Admin Panel** | `/admin/dashboard` | `ROLE_ADMIN` | `writer` / `writer123` *(Also accessible by admin)* |

---

## 📡 REST API Endpoint Catalog

### 1. Public Authentication & Catalog Metadata
*   `POST /api/auth/login`: Authenticates administrator/writer and yields a 24h stateless JWT bearer token.
*   `GET /api/auth/verify`: Verifies validity of client session token.
*   `GET /api/products`: Public catalog of software migration and backup tools.
*   `GET /api/blog`: Dynamic feed of SEO migration guides and blog articles.
*   `GET /api/faqs`: Dynamic category-based platform FAQs.
*   `GET /api/categories`: Product organization categories.

### 2. Desktop Application Client API
*   `POST /api/licenses/validate`: Validates, binds, and registers hardware activations (Accessible without authentication).

### 3. General Content Admin APIs (`ROLE_ADMIN` required)
*   `POST/PUT/DELETE /api/products`: Manage products catalog.
*   `POST/PUT/DELETE /api/blog`: Create and edit blog posts.
*   `POST/PUT/DELETE /api/faqs`: Manage support questions.
*   `POST/PUT/DELETE /api/categories`: Configure menu groupings.

### 4. Isolated Licensing Console APIs (`ROLE_LICENSE_ADMIN` required)
*   `GET /api/licensing-admin`: Fetches the comprehensive list of licenses, including bound hardware fingerprints.
*   `POST /api/licensing-admin/generate`: Generates a brand-new cryptographically formatted license key.
*   `POST /api/licensing-admin/revoke/{id}`: Revokes an active key, immediately blocking connected applications.
*   `POST /api/licensing-admin/reactivate/{id}`: Reactivates an expired or revoked key.
*   `POST /api/licensing-admin/reset/{id}`: Resets bound devices, clearing hardware slots for new installations.

---

## 🛠️ Operations & Startup Scripts

Two automated Bash scripts are provided at the root level to run development processes:

### 1. Safe Startup Script (`./start.sh`)
Launches the entire system stack seamlessly:
1.  **Port Cleaning**: Automatically checks and terminates any existing processes running on ports `3000` and `8080`.
2.  **Database Containerization**: Launches the PostgreSQL 16 server in a background Docker container (`docker compose up -d`) and waits until it successfully responds to health check pings on port `5433`.
3.  **Spring Boot API**: Compiles and starts the backend API in the background (`mvn spring-boot:run`).
4.  **Next.js Storefront**: Boots up the Next.js frontend server (`npm run dev`) on `http://localhost:3000`.

To start:
```bash
chmod +x ./start.sh
./start.sh
```

### 2. Shutdown & Port Freeing Script (`./stop.sh`)
Cleans up the environment and frees system resources:
1.  Terminates Next.js dev server on port `3000`.
2.  Terminates Spring Boot API on port `8080`.
3.  Halts and removes the PostgreSQL Docker container (`docker compose down`).

To stop:
```bash
chmod +x ./stop.sh
./stop.sh
```
