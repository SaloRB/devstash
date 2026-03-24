# 🗃️ DevStash — Project Overview

> **Store Smarter. Build Faster.**
> A centralized, AI-enhanced knowledge hub for developers — snippets, prompts, docs, commands, and more, all in one place.

---

## 📌 The Problem

Developers scatter their essential knowledge across too many tools:

| Where it lives | What's stuck there |
|---|---|
| VS Code / Notion | Code snippets |
| Chat histories | AI prompts & workflows |
| Project folders | Context files |
| Browser bookmarks | Useful links |
| Random folders | Docs & references |
| `.txt` files | Commands & flags |
| GitHub Gists | Boilerplates & templates |
| Bash history | Terminal commands |

This causes **context switching**, **lost knowledge**, and **inconsistent workflows**.

➡️ **DevStash is ONE searchable, AI-enhanced hub for all of it.**

---

## 👤 Target Users

| Persona | Primary Need |
|---|---|
| 🧑‍💻 Everyday Developer | Fast access to snippets, commands, links |
| 🤖 AI-First Developer | Store prompts, workflows, context files |
| 🎓 Content Creator / Educator | Course notes, reusable code examples |
| 🏗️ Full-Stack Builder | Patterns, boilerplates, API references |

---

## ✨ Core Features

### A) Items & Item Types

Every saved resource is an **Item** with a type. Built-in system types:

| Icon | Type | Description |
|---|---|---|
| `</>` | **Snippet** | Code in any language |
| `✨` | **Prompt** | AI prompts and chains |
| `📝` | **Note** | Markdown notes & docs |
| `$_` | **Command** | Terminal / shell commands |
| `📄` | **File** | Uploaded files & templates |
| `🖼️` | **Image** | Screenshots, diagrams |
| `🔗` | **URL** | Bookmarks & references |

> Pro users can create **custom item types** with custom icons and colors.

### B) Collections

Group items into named collections — any mix of types allowed.

Examples: `React Patterns`, `Context Files`, `Python Snippets`, `Interview Prep`

### C) Search

Full-text search across content, titles, tags, and types. Fast, global, always accessible.

### D) Authentication

- Email + Password
- GitHub OAuth (via NextAuth v5)

### E) Quality-of-Life Features

- ⭐ Favorites & 📌 Pinned items
- 🕐 Recently used
- 📥 Import from files
- ✍️ Markdown editor for text-based items
- 📁 File uploads (images, docs, templates)
- 📤 Export as JSON or ZIP
- 🌙 Dark mode (default)

### F) AI Superpowers *(Pro)*

Powered by **OpenAI `gpt-5-nano`**:

- 🏷️ Auto-tagging
- 🧠 AI summaries
- 💬 Explain Code
- ✨ Prompt optimization

---

## 💰 Monetization

Billing handled via **Stripe** with webhooks for subscription sync.

| Plan | Price | Item Limit | Collections | AI | File Uploads | Custom Types | Export |
|---|---|---|---|---|---|---|---|
| **Free** | $0/mo | 50 | 3 | ❌ | ❌ | ❌ | ❌ |
| **Pro** | $8/mo or $72/yr | Unlimited | Unlimited | ✅ | ✅ | ✅ | ✅ |

---

## 🧱 Tech Stack

| Category | Choice | Notes |
|---|---|---|
| Framework | **Next.js (React 19)** | App Router |
| Language | **TypeScript** | Strict mode |
| Database | **Neon PostgreSQL** | Serverless Postgres |
| ORM | **Prisma** | Type-safe DB access |
| Caching | **Redis** | Optional, rate limiting / sessions |
| File Storage | **Cloudflare R2** | S3-compatible, cheap egress |
| Styling | **Tailwind CSS v4 + shadcn/ui** | Dark mode first |
| Auth | **NextAuth v5** | Email + GitHub OAuth |
| AI | **OpenAI `gpt-5-nano`** | Tagging, summaries, explain code |
| Payments | **Stripe** | Subscriptions + webhooks |
| Deployment | **Vercel** | Edge-optimized |
| Monitoring | **Sentry** | Error tracking (Phase 2) |

---

## 🗄️ Data Model

> This schema is a starting point and will evolve as the product grows.

```prisma
model User {
  id                   String       @id @default(cuid())
  email                String       @unique
  password             String?
  isPro                Boolean      @default(false)
  stripeCustomerId     String?
  stripeSubscriptionId String?
  items                Item[]
  itemTypes            ItemType[]
  collections          Collection[]
  tags                 Tag[]
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt
}

model Item {
  id           String      @id @default(cuid())
  title        String
  contentType  String      // "text" | "file"
  content      String?     // used for text-based types
  fileUrl      String?
  fileName     String?
  fileSize     Int?
  url          String?
  description  String?
  isFavorite   Boolean     @default(false)
  isPinned     Boolean     @default(false)
  language     String?     // for syntax highlighting

  userId       String
  user         User        @relation(fields: [userId], references: [id])

  typeId       String
  type         ItemType    @relation(fields: [typeId], references: [id])

  collectionId String?
  collection   Collection? @relation(fields: [collectionId], references: [id])

  tags         ItemTag[]

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model ItemType {
  id       String  @id @default(cuid())
  name     String
  icon     String?
  color    String?
  isSystem Boolean @default(false)  // true = built-in, false = user-created (Pro)

  userId   String?
  user     User?   @relation(fields: [userId], references: [id])

  items    Item[]
}

model Collection {
  id          String   @id @default(cuid())
  name        String
  description String?
  isFavorite  Boolean  @default(false)

  userId      String
  user        User     @relation(fields: [userId], references: [id])

  items       Item[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Tag {
  id     String    @id @default(cuid())
  name   String
  userId String
  user   User      @relation(fields: [userId], references: [id])

  items  ItemTag[]
}

model ItemTag {
  itemId String
  tagId  String

  item   Item @relation(fields: [itemId], references: [id])
  tag    Tag  @relation(fields: [tagId], references: [id])

  @@id([itemId, tagId])
}
```

---

## 🔌 API Architecture

```
┌─────────────────────────────────────────────────┐
│                    Client (Browser)              │
└───────────────────────┬─────────────────────────┘
                        │ HTTP / Server Actions
                        ▼
┌─────────────────────────────────────────────────┐
│               Next.js API Routes                 │
│  /api/items   /api/collections   /api/ai  ...   │
└───┬───────────┬──────────┬───────────┬──────────┘
    │           │          │           │
    ▼           ▼          ▼           ▼
 Neon DB    Cloudflare   OpenAI      Redis
(Prisma)      R2 Files    AI API     Cache
```

---

## 🔐 Auth Flow

```
User
 │
 ├──▶ Email + Password ──▶ NextAuth ──▶ Credentials Provider
 │                              │
 └──▶ GitHub OAuth ─────────────┤
                                │
                                ▼
                           JWT Session
                                │
                                ▼
                          App Access ✅
```

---

## 🧠 AI Feature Flow

```
Item Content (text/code)
        │
        ▼
  POST /api/ai/[action]
  (action: tag | summarize | explain | optimize)
        │
        ▼
   OpenAI API
  (gpt-5-nano)
        │
        ▼
  ┌─────────────────────────┐
  │  Tags / Summary /        │
  │  Code Explanation /      │
  │  Optimized Prompt        │
  └─────────────────────────┘
        │
        ▼
   UI Update (optimistic)
```

---

## 🎨 UI / UX

- **Dark mode first** — developer-native aesthetic
- Inspired by **Notion**, **Linear**, and **Raycast**
- Syntax highlighting for all code items
- Minimal chrome — content is the focus

### Design References

- [Notion](https://www.notion.so/) — clean, flexible content layout
- [Linear](https://linear.app/) — sleek UI, sidebar navigation
- [Raycast](https://www.raycast.com/) — command palette, quick actions

### Screenshots

Refer to the screenshots below as a base for the dashboard UI. It does not have to be exact. Use it as a reference:
- [Dashboard UI Main](./screenshots/dashboard-ui-main.png)
- [Dashboard UI Drawer](./screenshots/dashboard-ui-drawer.png)

### Layout

```
┌──────────────┬──────────────────────────────────────┐
│              │  Search bar                  [+ New]  │
│   Sidebar    ├──────────────────────────────────────┤
│              │                                       │
│  Collections │   Item Grid / List                    │
│  Item Types  │                                       │
│  Tags        │   [ Card ]  [ Card ]  [ Card ]        │
│  Filters     │   [ Card ]  [ Card ]  [ Card ]        │
│              │                                       │
│  ─────────   ├──────────────────────────────────────┤
│  ⭐ Favorites│   Full-Screen Item Editor             │
│  📌 Pinned   │   (opens on item click)               │
│  🕐 Recent   │                                       │
└──────────────┴──────────────────────────────────────┘
```

**Mobile:** Sidebar collapses to a bottom drawer; touch-optimized tap targets throughout.

---

## 🗺️ Roadmap

### Phase 1 — MVP
- [ ] Project setup & auth (email + GitHub)
- [ ] Items CRUD (all system types)
- [ ] Collections management
- [ ] Full-text search
- [ ] Tags
- [ ] Free tier limits enforcement
- [ ] Dark mode UI

### Phase 2 — Pro
- [ ] Stripe billing & upgrade flow
- [ ] AI features (tagging, summary, explain, optimize)
- [ ] Custom item types
- [ ] File uploads (Cloudflare R2)
- [ ] Export (JSON / ZIP)
- [ ] Sentry error monitoring

### Phase 3 — Growth
- [ ] Shared / public collections
- [ ] Team & Org plans
- [ ] VS Code extension
- [ ] Browser extension
- [ ] Public API + CLI tool

---

## 🧑‍🏫 Course Development Notes

- **One Git branch per lesson** — students can follow along and diff at any point
- Use **Cursor / Claude Code / ChatGPT** for AI-assisted development demos
- GitHub Actions for optional CI/CD

```bash
# Branch naming convention
git switch -c lesson-01-setup
git switch -c lesson-02-database-schema
git switch -c lesson-03-auth
# etc.
```

---

## 📌 Status

**🟡 In Planning** — environment setup and UI scaffolding ready to begin.

---

*DevStash — Store Smarter. Build Faster.*
