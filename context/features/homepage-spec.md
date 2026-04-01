# Homepage Spec

## Overview

Build the marketing homepage at `/` (currently a placeholder) based on the prototype in `prototypes/homepage/`. Convert to Next.js with server/client components, Tailwind, and shadcn/ui. Replace the existing `src/app/page.tsx`.

## Route

- `src/app/page.tsx` — public, no auth required

## Component Breakdown

### Server Components (default)

- `page.tsx` — root page, composes all sections
- `<HeroSection>` — eyebrow, headline, subheadline, CTAs, chaos visual
- `<FeaturesSection>` — 6-card feature grid
- `<AISection>` — pro feature callout with code editor mockup
- `<PricingSection>` — section header + pricing grid (wraps client toggle)
- `<CTASection>` — bottom CTA banner
- `<HomepageFooter>` — brand, links, copyright

### Client Components (`"use client"`)

- `<HomepageNav>` — sticky navbar with scroll shadow (needs `useState`/scroll listener)
- `<ChaosAnimation>` — bouncing icon canvas (canvas animation loop via `useEffect`)
- `<PricingToggle>` — monthly/yearly toggle; owns price state and passes down to `<PricingCards>`
- `<PricingCards>` — renders the two pricing cards; receives `isYearly` prop

## File Structure

```
src/
  app/
    page.tsx
  components/
    homepage/
      homepage-nav.tsx        (client)
      hero-section.tsx        (server)
      chaos-animation.tsx     (client)
      features-section.tsx    (server)
      ai-section.tsx          (server)
      pricing-section.tsx     (server)
      pricing-toggle.tsx      (client)
      pricing-cards.tsx       (client)
      cta-section.tsx         (server)
      homepage-footer.tsx     (server)
```

## Sections & Content

### Navbar
- Logo: `⚡ DevStash` → links to `/`
- Nav links: Features (`#features`), Pricing (`#pricing`)
- Actions: Sign In → `/sign-in`, Get Started → `/register`
- Adds box shadow / background blur on scroll (use `scroll` event in `useEffect`)
- Use shadcn `Button` for actions

### Hero
- Eyebrow: "Your developer knowledge, finally organized"
- Headline: "Stop Losing Your Developer Knowledge" — "Developer Knowledge" in gradient text (purple→blue)
- Subheadline from prototype
- CTAs: "Get Started Free" → `/register`, "See Features" → `#features`
- Visual: `<ChaosAnimation>` (chaos icons) → arrow → dashboard mockup (static JSX, not image)

### Chaos Animation
- Port the particle/bounce animation from `prototypes/homepage/script.js` to a React `useEffect` with `requestAnimationFrame`
- Icons: Notion, GitHub, Slack, VS Code, Browser, Terminal, File, Bookmark SVGs (copy from prototype)
- Mouse repel effect
- Contained in a fixed-size div

### Dashboard Mockup (inside Hero, server)
- Static JSX recreating the sidebar + card grid from the prototype
- Use item type colors from project constants (`#3b82f6` snippet, `#f59e0b` prompt, `#06b6d4` command, `#22c55e` note, `#6366f1` url, `#ec4899` image)

### Features Grid
- 2×3 grid (3 cols on md+)
- 6 cards: Code Snippets, AI Prompts, Commands, Notes, Files & Docs, Instant Search
- Top border color per card matches item type color
- Use Lucide icons: `Code`, `Sparkles`, `Terminal`, `StickyNote`, `FolderOpen`, `Search`

### AI Section (Pro)
- Two-column layout
- Left: "✦ Pro Feature" badge, title, 5 checklist items, "Upgrade to Pro" → `#pricing`
- Right: code editor mockup (static JSX with syntax-highlighted `useDebounce` code, AI tags row)
- Badge styled with indigo/purple accent

### Pricing Section
- Section header: "Simple pricing", "Start Free, Scale When Ready"
- `<PricingToggle>` monthly/yearly switch — yearly shows $72/yr, saves 25%
- Free card: $0/forever, 5 features, "Get Started" → `/register`
- Pro card: $8/mo or $72/yr, 6 features, "Upgrade to Pro" → `/register`, "Most Popular" badge
- Use shadcn `Switch` for the toggle, `Badge` for labels

### CTA Section
- "Ready to Organize Your Knowledge?" + subtitle
- "Get Started for Free" → `/register`

### Footer
- Brand column: logo + tagline
- Product links: Features (`#features`), Pricing (`#pricing`), Changelog (`#`), Roadmap (`#`)
- Resources links: Documentation (`#`), API (`#`), Blog (`#`), Support (`#`)
- Company links: About (`#`), Privacy (`#`), Terms (`#`), Contact (`#`)
- Bottom bar: copyright (use `new Date().getFullYear()`) + "Built for developers, by developers."

## Styling Notes

- Dark background matching dashboard theme (`bg-background`)
- Gradient text: `bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent`
- Section padding: `py-20` or `py-24`
- Container: `max-w-6xl mx-auto px-4`
- Scroll fade-in: use `IntersectionObserver` in a shared `useFadeIn` hook or CSS `animate-in` from tailwind-animate
- Card hover: `hover:bg-muted/50 transition-colors`
- Pro pricing card: ring highlight (`ring-1 ring-primary`)

## Behavior

- Navbar: transparent → adds `backdrop-blur bg-background/80 shadow-sm` after 20px scroll
- Pricing toggle: client state, no server round-trip
- All `href="#"` footer/placeholder links are fine for now
- Page is fully static — no data fetching needed

## References

- [Prototype HTML](../../prototypes/homepage/index.html)
- [Prototype JS](../../prototypes/homepage/script.js)
- [Project Overview](../project-overview.md)
