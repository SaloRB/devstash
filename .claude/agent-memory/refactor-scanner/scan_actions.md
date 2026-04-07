---
name: scan_actions
description: Refactor scan results for src/actions/ — key duplication patterns found
type: project
---

Scanned 2026-04-07. Five action files: ai.ts, auth.ts, collections.ts, editor-preferences.ts, items.ts.

Key findings:
- Auth guard `const session = await auth(); if (!session?.user?.id) return { success: false, error: 'Unauthorized' }` appears verbatim in every action except auth.ts → candidate for `requireAuth()` in lib/
- OpenAI error catch block (RateLimitError / AuthenticationError / BadRequestError → return error codes) is identical across all 4 AI actions in ai.ts → candidate for `handleOpenAIError()` in lib/openai.ts or lib/utils.ts
- AI Pro + rate-limit guard block is identical across all 4 AI actions → candidate for `requireAIPro(userId)` in lib/gates.ts
- Try/catch wrapping a DB call returning `{ success: true, data }` or `{ success: false, error: string }` is repeated ~8 times across collections.ts and items.ts → candidate for `withAction()` wrapper in lib/
- Nullable string field transform `.nullable().optional().transform((v) => v || null)` repeated 4+ times in createItemSchema and updateItemSchema → candidate for a shared Zod helper `nullableString()` in lib/ or types/
- `revalidatePath` is NOT used in any action file — all cache invalidation is absent or handled elsewhere
- No ownership check (`assertOwner`) pattern — ownership is passed through to DB helpers in lib/db/

Already well-organized: lib/db/ (items, collections, profile, search) cleanly separates Prisma queries from actions.
