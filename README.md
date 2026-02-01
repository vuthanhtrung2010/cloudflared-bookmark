<div align="center">

# 🚀 SvelteKit + Cloudflare D1 Template

### A modern, production-ready full-stack template for building blazing-fast web applications

[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## ✨ Features

| Feature                   | Description                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| ⚡ **SvelteKit 5**        | Latest Svelte with runes, server-side rendering, and file-based routing  |
| ☁️ **Cloudflare Workers** | Edge-first deployment with global distribution and near-zero cold starts |
| 🗄️ **Cloudflare D1**      | Serverless SQLite database with automatic replication                    |
| 🎨 **Tailwind CSS**       | Utility-first CSS framework for rapid UI development                     |
| 🔧 **Drizzle ORM**        | Type-safe, lightweight ORM with migrations support                       |
| 🌍 **Paraglide i18n**     | Fully type-safe internationalization (EN/VI)                             |
| 📦 **Bun**                | Ultra-fast JavaScript runtime and package manager                        |
| ✅ **ESLint + Prettier**  | Consistent code style and automatic formatting                           |

---

## 🛠️ Tech Stack

```
├── 🎯 Framework      → SvelteKit 5 (Svelte 5 with Runes)
├── 🌐 Runtime        → Cloudflare Workers (Edge)
├── 💾 Database       → Cloudflare D1 (SQLite)
├── 🔗 ORM            → Drizzle ORM
├── 🎨 Styling        → Tailwind CSS
├── 🌍 i18n           → Paraglide
├── 📦 Package Mgr    → Bun
├── 🔍 Linting        → ESLint
└── ✨ Formatting     → Prettier
```

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (for Cloudflare deployment)

### Installation

```bash
# Clone this template
git clone <your-repo-url>
cd <project-name>

# Install dependencies
bun install

# Start development server
bun run dev
```

### Database Setup

```bash
# Generate migrations
bun run db:generate

# Push migrations to local D1
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio
```

---

## 📁 Project Structure

```
├── src/
│   ├── lib/           # Reusable library code
│   │   ├── server/    # Server-only utilities (DB, auth, etc.)
│   │   └── components/# Svelte components
│   ├── routes/        # SvelteKit file-based routing
│   └── app.css        # Global styles
├── drizzle/           # Database migrations
├── messages/          # i18n translation files
├── wrangler.jsonc     # Cloudflare Workers config
└── drizzle.config.ts  # Drizzle ORM config
```

---

## 📜 Available Scripts

| Command               | Description                      |
| --------------------- | -------------------------------- |
| `bun run dev`         | Start development server         |
| `bun run build`       | Build for production             |
| `bun run preview`     | Preview production build locally |
| `bun run check`       | Type-check the project           |
| `bun run lint`        | Lint & format code               |
| `bun run db:generate` | Generate Drizzle migrations      |
| `bun run db:migrate`  | Apply migrations                 |
| `bun run db:studio`   | Open Drizzle Studio              |

---

## ☁️ Deployment

Deploy to Cloudflare Workers with a single command:

```bash
# Deploy to production
bun run deploy
```

> **Note:** Make sure you've configured your `wrangler.jsonc` and `drizzle.config.ts` and authenticated with Cloudflare CLI.

---

## 📄 License

MIT © Vũ Thành Trung

---

<div align="center">

**Built with ❤️ using SvelteKit and Cloudflare**

[Documentation](https://kit.svelte.dev/docs) · [Report Bug](https://github.com/vuthanhtrung2010/cloudflare-d1-svelte-template/issues) · [Request Feature](https://github.com/vuthanhtrung2010/cloudflare-d1-svelte-template/issues)

</div>
