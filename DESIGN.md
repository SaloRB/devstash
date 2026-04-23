---
version: alpha
name: DevStash
description: Visual design system — colors, typography, spacing, components, and motion.
colors:
  background: "#1a1a1a"
  surface: "#2e2e2e"
  foreground: "#fafafa"
  muted-foreground: "#aaaaaa"
  primary: "#e5e5e5"
  destructive: "#b91c1c"
  sidebar: "#2e2e2e"
  sidebar-primary: "#4f46e5"
typography:
  heading-lg:
    fontFamily: Geist Sans
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2
  heading-md:
    fontFamily: Geist Sans
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.25
  body-md:
    fontFamily: Geist Sans
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: Geist Sans
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: 0.375rem
  md: 0.625rem
  lg: 0.75rem
  xl: 1rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
  card-collection:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: 12px
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  badge-type:
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.sm}"
  input:
    rounded: "{rounded.md}"
    typography: "{typography.body-md}"
  sidebar:
    backgroundColor: "{colors.sidebar}"
  sidebar-item-active:
    backgroundColor: "{colors.sidebar-primary}"
    textColor: "{colors.foreground}"
---

# DevStash — Design Reference

## Overview

- **Modern & minimal** — developer-focused aesthetic inspired by Linear, Notion, Raycast
- **Dark-first** — dark mode is the default; light mode is optional
- **Type-colored** — each item type has a distinct accent color used consistently across icons, badges, and card borders
- **Subtle depth** — borders, low-opacity fills, and `ring` effects rather than heavy shadows

---

## Colors

All semantic tokens use **OKLCH** values via CSS custom properties in `globals.css`. The hex values in the YAML frontmatter are sRGB approximations for spec consumers; the OKLCH values in `globals.css` are authoritative.

### Semantic Palette

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | Page background |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Card surfaces |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary text |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Secondary/hint text |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Dividers, card edges |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | CTA buttons, active states |
| `--destructive` | red | red | Destructive actions |
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Sidebar background |
| `--sidebar-primary` | dark | `oklch(0.488 0.243 264.376)` | Active sidebar item (indigo in dark) |

### Item Type Colors

Fixed hex values — used for icons, badges, card accents, and stat cards.

| Type | Color | Hex |
|---|---|---|
| Snippet | Blue | `#3b82f6` |
| Prompt | Purple | `#8b5cf6` |
| Command | Orange | `#f97316` |
| Note | Yellow | `#fde047` |
| File | Gray | `#6b7280` |
| Image | Pink | `#ec4899` |
| Link | Emerald | `#10b981` |

Color usage pattern: fill backgrounds at **`color + 15` opacity** (e.g. `${color}15`), icons/text at full color.

---

## Typography

| Role | Tailwind Class |
|---|---|
| Font family | `--font-geist-sans` (heading & body) |
| Page heading | `text-2xl font-bold` |
| Section heading | `text-3xl md:text-4xl font-bold` |
| Card title | `text-sm font-semibold` |
| Body | `text-sm` |
| Caption / meta | `text-xs text-muted-foreground` |

---

## Layout

- **Border radius** base: `0.625rem` (`--radius`). Scale: `sm` 0.375rem → `4xl` 1.625rem
- **Max content width**: `max-w-6xl` with `lg:px-8 xl:px-12` padding
- **Section spacing**: `space-y-8` between dashboard sections
- **Card gap**: `gap-4` (grids), `gap-5` (feature cards), `gap-6` (pricing)

---

## Elevation & Depth

Depth is achieved through **tonal layers** rather than heavy shadows. Visual hierarchy uses:

- **Border contrast** — `border` token at 10% white opacity on dark surfaces separates layers without hard edges
- **Surface lift** — cards sit on `--card` (`oklch(0.205 0 0)`) above `--background` (`oklch(0.145 0 0)`)
- **Ring effects** — `ring-1 ring-border` on interactive elements communicates focus/hover state
- **Low-opacity fills** — type-colored backgrounds at `15` hex opacity (`${color}15`) add accent without visual noise

No box shadows are used. Elevation is purely tonal.

---

## Shapes

All interactive elements, containers, and inputs use the `--radius` variable scale for consistent rounding. Base is `0.625rem`; never use sharp `0px` corners on interactive surfaces.

- **Cards / Inputs / Buttons**: `rounded-md` (`0.625rem`)
- **Badges / Tags**: `rounded-sm` (`0.375rem`)
- **Icon boxes (type icons)**: `rounded-md` (`0.625rem`)
- **Avatar / Pills**: `rounded-full`
- **Collection left-border accent**: `border-l-4` — flat edge, no radius override

---

## Components

### Cards

- Base: `<Card size="sm">` with `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
- Collection cards: `border-l-4` with left border colored by dominant item type; `bg-teal-950/20` base + `hover:bg-teal-950/30`
- Stat cards: colored icon box (`size-10`, `rounded-md`, `color + 15` bg) + large value + label
- Feature cards (homepage): `border-t-2` with type color; `hover:bg-muted/30`

### Item Type Icon

Consistent icon + color wrapper: `size-10 rounded-md flex items-center justify-center` with `backgroundColor: ${color}15` and icon at `size-5` with `color: color`.

### Badges

- Type badge: `variant="secondary"` with inline `backgroundColor: ${color}15` and `color: color`
- Language / tag badge: `variant="secondary"` default styling
- Pro "Most Popular": absolute positioned, `rounded-full bg-primary text-primary-foreground`

### Drawer (ItemDrawer)

Right `Sheet` — `max-w-576px`, full height, no padding on root. Two modes:
- **View** — action bar (Favorite, Pin, Copy/Download, Edit, Delete), then scrollable content sections
- **Edit** — Save/Cancel bar, then form fields (title, description, content, language, tags, collections)

### Command Palette

`⌘K` / `Ctrl+K` — `CommandDialog` with grouped results: items (by type icon) and collections (FolderOpen icon).

### Skeletons

Used via `<Suspense fallback={<XSkeleton />}>` for all async dashboard sections. Skeletons mirror the visual shape of the real component using `<Skeleton className="...">`.

---

## Do's and Don'ts

- Do use type colors consistently — icon, badge, and card accent must always use the same color for a given type
- Do apply type-colored backgrounds at `15` hex opacity only — never full opacity fills on surfaces
- Don't use box shadows — use tonal layering and borders for depth
- Don't mix `rounded-full` and `rounded-md` on the same card surface
- Do maintain WCAG AA contrast (4.5:1 for normal text) — test both light and dark modes
- Don't add more than one "primary" action per view
- Do use `sonner` toasts for all CRUD feedback — never inline success/error banners
- Don't import from `@radix-ui/*` — all primitives go through shadcn/ui (Base UI)

---

## Page Layouts

### Marketing Pages (`/`)

```
HomepageNav (sticky)
  HeroSection      — split: chaos animation ↔ dashboard mockup
  FeaturesSection  — 3-col grid with top-border accented cards
  AISection        — highlighted Pro features
  PricingSection   — 2-col Free / Pro cards
  CTASection
HomepageFooter
```

### App Shell (`/(main)/*`)

```
SidebarProvider
  AppSidebar (collapsible, icon-only when collapsed)
    TYPES section (collapsible)
    COLLECTIONS section (collapsible, hidden when icon-only)
    SidebarFooter → user avatar + dropdown
  SidebarInset
    TopBar (fixed, h-57px)
      SidebarTrigger | Logo | SearchTrigger | Upgrade? | Favorites | + Create
    <main> (mt-topbar, p-6)
      {page content}
ItemDrawer (Sheet, right side, max-w-576px)
CommandPalette (⌘K modal)
```

### Auth Pages (`/(auth)/*`)

Centered single-column form. `max-w-sm`, `min-h-screen` with `items-center justify-center`.

---

## Micro-interactions

- Transitions: `transition-colors` (150ms, Tailwind default)
- Hover states: `hover:bg-accent`, `hover:bg-muted/30` on cards
- Active sidebar: `group-data-open/collapsible:rotate-90` chevron animation
- Copy button: swaps to `<Check>` icon for 2 s then resets
- Toast notifications: `sonner` for all CRUD feedback
- Sidebar collapse: `collapsible="icon"` — collapses to icon-only, hides text & collections section

---

## Responsive Behavior

| Breakpoint | Sidebar | Layout |
|---|---|---|
| Desktop ≥ 1024px | Visible, collapsible | Sidebar + inset content |
| Tablet 768–1023px | Drawer (hidden default) | Full-width content |
| Mobile < 768px | Drawer (hidden default) | Stacked, `sm:inline` text hidden in TopBar |

---

## Markdown & Code Display

- Code: **Monaco editor** (read-only or editable) via `CodeEditor.tsx`
- Markdown: custom `MarkdownEditor.tsx` with preview toggle; scrollable via `.markdown-editor-scroll` (6px thin scrollbar)
- Markdown preview: `.markdown-preview` — VS Code-inspired dark theme, `#d4d4d4` body, `#ce9178` inline code
- Both editors share the same thin scrollbar style as Monaco's native scrollbar

---

## Forms

- Inputs: shadcn `Input`, `Textarea`, `Label`
- Tag input: comma-separated plain `Input`; AI suggest button appends tags
- Collection assign: `CollectionMultiSelect` checkbox list
- Language picker: `LanguageSelect` dropdown
- Validation: Zod schemas via `lib/schemas.ts`; errors shown inline

---

## Icons

All icons from **lucide-react**. Item type mapping in `lib/item-types.ts`:

| Type | Icon |
|---|---|
| snippet | `Code` |
| prompt | `Sparkles` |
| command | `Terminal` |
| note | `StickyNote` |
| file | `File` |
| image | `Image` |
| link | `Link` |
