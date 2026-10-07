# ResumeAI — Next.js 16 SaaS Frontend

> **Status:** 🚧 **Work in Progress (WIP)** — *Connected to Express / Ollama / LanguageTool backend.*

This is the production SaaS frontend for ResumeAI, built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **TypeScript**.

---

## 📸 Previews

- **Landing Page**: See [`../docs/images/landing-page-preview.jpg`](../docs/images/landing-page-preview.jpg)
- **Dashboard & Results**: See [`../docs/images/dashboard-preview.jpg`](../docs/images/dashboard-preview.jpg)

---

## 🏃 Running Locally

```bash
npm install
npm run dev
```

Runs on [http://localhost:3000](http://localhost:3000).

Make sure `.env.local` contains:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

For full documentation and system architecture, see the root [README.md](../README.md).
