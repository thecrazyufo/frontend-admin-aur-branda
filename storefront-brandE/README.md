# Software Selling Frontend

This directory contains the frontend portion of the Software Selling Platform, supporting both the Next.js app and the new Astro.js codebase migration.

---

## 🚀 Astro.js Migration (Active)

The primary codebase is now migrating to Astro.

### Project Structure
```text
/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   │   └── index.astro
│   └── styles/
└── package.json
```

### Commands
- `npm run dev` - Starts local Astro dev server at `localhost:4321`
- `npm run build` - Build your Astro production site to `./dist/`
- `npm run preview` - Preview your Astro build locally

---

## ⚛️ Next.js Portal (Legacy/Reference)

The legacy frontend is built with Next.js and is located in the `/app` directory.

### Commands
- `npm run dev:next` - Starts Next.js dev server
- `npm run build:next` - Build Next.js app
- `npm run start:next` - Start Next.js production build
