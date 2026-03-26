# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links, and custom types.

## Context Files

Read the following to get the full context of the project:

- [Project Overview](./context/project-overview.md)
- [Coding Standards](./context/coding-standards.md)
- [AI Interaction](./context/ai-interaction.md)
- [Current Feature](./context/current-feature.md)

## Neon Defaults

Always use these IDs for every Neon MCP call — no lookups, no exceptions:

- **Org:** `org-long-glade-36051720`
- **Project:** `restless-feather-54583491`
- **Branch:** `br-sweet-queen-amfuulhg`

Never call `list_projects`, `list_organizations`, or any discovery tool before a Neon MCP call.

## Communication Style

Be extremely concise. Sacrifice grammar for brevity. Drop articles, use symbols (→, /), collapse noun phrases, cut implied info. Shorter always wins.

## Node / npm

Always use Node v24 via fnm before running npm commands:

```bash
eval "$(fnm env --shell zsh)" && fnm use 24 && npm <command>
```

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm start` — serve production build