# AI Integration Plan

Model: `gpt-5-nano` — fastest, most cost-efficient GPT-5 variant; ideal for summarization/classification
Stack: Next.js App Router, Server Actions, OpenAI Node SDK v5+

---

## 1. SDK Setup & Configuration

### Install

```bash
npm install openai
```

### Singleton client (`src/lib/openai.ts`)

```ts
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2, // retries on 429, 500+, timeouts (exponential backoff)
})

export const AI_MODEL = 'gpt-5-nano'
```

`OPENAI_API_KEY` is a server-only env var. Never reference it in client components or expose it in API responses.

---

## 2. Server Action Patterns

Follow the existing pattern in [src/actions/items.ts](../src/actions/items.ts):

1. `'use server'` directive
2. `auth()` session guard → return `{ success: false, error: 'Unauthorized' }`
3. Zod input validation → return field errors
4. Pro gate check → return `'PRO_REQUIRED'` if not Pro
5. Call OpenAI → return `{ success: true, data }` or `{ success: false, error }`

### Template

```ts
'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { getUserProStatus } from '@/lib/gates'
import { openai, AI_MODEL } from '@/lib/openai'
import OpenAI from 'openai'

const schema = z.object({ content: z.string().trim().min(1).max(10000) })

export async function aiAction(data: z.infer<typeof schema>) {
  const session = await auth()
  if (!session?.user?.id) return { success: false as const, error: 'Unauthorized' }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten().fieldErrors }

  const isPro = await getUserProStatus(session.user.id)
  if (!isPro) return { success: false as const, error: 'PRO_REQUIRED' }

  try {
    // ... OpenAI call
    return { success: true as const, data: result }
  } catch (err) {
    if (err instanceof OpenAI.RateLimitError) {
      return { success: false as const, error: 'RATE_LIMITED' }
    }
    return { success: false as const, error: 'AI_ERROR' }
  }
}
```

---

## 3. Feature Implementations

### 3.1 Auto-Tagging

Use structured outputs with Zod for a guaranteed array of tags. Non-streaming — fast and simpler to accept/reject.

```ts
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

const TagsResponse = z.object({
  tags: z.array(z.string()).max(8),
})

export async function generateTags(content: string, existingTags: string[]) {
  const completion = await openai.chat.completions.parse({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `Generate up to 8 short, lowercase tags for developer content.
Return only relevant technical terms. No generic words like "code" or "example".
Existing tags to avoid duplicating: ${existingTags.join(', ')}`,
      },
      { role: 'user', content: content.slice(0, 4000) },
    ],
    response_format: zodResponseFormat(TagsResponse, 'tags_response'),
    max_tokens: 150,
  })

  return completion.choices[0]?.message.parsed?.tags ?? []
}
```

### 3.2 AI-Generated Summaries

Non-streaming. Short, focused prompt. Cap input to control cost.

```ts
export async function generateSummary(title: string, content: string) {
  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'Summarize developer content in 1–2 sentences. Be concise and technical.',
      },
      { role: 'user', content: `Title: ${title}\n\n${content.slice(0, 3000)}` },
    ],
    max_tokens: 120,
  })

  return completion.choices[0]?.message.content ?? ''
}
```

### 3.3 Code Explanation

Streaming — code explanations can be long; streaming improves perceived responsiveness. Use a Route Handler since Server Actions can't return `ReadableStream` to the client.

**Route Handler** (`src/app/api/ai/explain/route.ts`):

```ts
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { getUserProStatus } from '@/lib/gates'
import { openai, AI_MODEL } from '@/lib/openai'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const isPro = await getUserProStatus(session.user.id)
  if (!isPro) return new Response('PRO_REQUIRED', { status: 403 })

  const { code, language } = await req.json()
  if (!code || typeof code !== 'string') return new Response('Bad Request', { status: 400 })

  const stream = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a code explainer. Explain the following ${language ?? 'code'} clearly and concisely for a developer audience. Use markdown.`,
      },
      { role: 'user', content: code.slice(0, 8000) },
    ],
    stream: true,
    max_tokens: 600,
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) controller.enqueue(new TextEncoder().encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

**Client-side consumption**:

```ts
async function streamExplanation(code: string, language: string, onChunk: (text: string) => void) {
  const res = await fetch('/api/ai/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  })

  if (!res.ok) throw new Error(await res.text())

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value))
  }
}
```

### 3.4 Prompt Optimization

Non-streaming. Returns an improved version of the user's prompt with a summary of changes.

```ts
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

const PromptResponse = z.object({
  optimized: z.string(),
  changes: z.array(z.string()).max(4),
})

export async function optimizePrompt(prompt: string) {
  const completion = await openai.chat.completions.parse({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `Improve the given AI prompt. Make it clearer, more specific, and more effective.
Return the optimized prompt and a short list of changes made.`,
      },
      { role: 'user', content: prompt.slice(0, 2000) },
    ],
    response_format: zodResponseFormat(PromptResponse, 'prompt_response'),
    max_tokens: 400,
  })

  return completion.choices[0]?.message.parsed
}
```

---

## 4. Streaming vs Non-Streaming Decision

| Feature              | Approach        | Reason                                       |
|----------------------|-----------------|----------------------------------------------|
| Auto-tagging         | Non-streaming   | Short output; structured JSON required       |
| Summarization        | Non-streaming   | Short output; simpler to accept/reject       |
| Code explanation     | Streaming       | Long output; UX benefits from progressive reveal |
| Prompt optimization  | Non-streaming   | Structured output (diff + result)            |

**Rule**: Use streaming when output is long (>200 tokens) and partial display adds value. Use non-streaming for structured/JSON outputs — `stream: true` is incompatible with `response_format`.

---

## 5. Error Handling & Rate Limiting

The SDK auto-retries with exponential backoff on `408`, `409`, `429`, `5xx`. Default `maxRetries: 2`.

### Error types to handle explicitly

```ts
import OpenAI from 'openai'

try {
  // ...
} catch (err) {
  if (err instanceof OpenAI.RateLimitError) {
    // Surface as 'RATE_LIMITED' — prompt user to try again shortly
    return { success: false as const, error: 'RATE_LIMITED' }
  }
  if (err instanceof OpenAI.AuthenticationError) {
    // Config issue — log server-side, surface generic error
    console.error('OpenAI auth error — check OPENAI_API_KEY')
    return { success: false as const, error: 'AI_ERROR' }
  }
  if (err instanceof OpenAI.BadRequestError) {
    // Input issue — content policy or token length
    return { success: false as const, error: 'INVALID_INPUT' }
  }
  return { success: false as const, error: 'AI_ERROR' }
}
```

### Per-user rate limiting (application layer)

Prevent abuse beyond OpenAI's API limits with a lightweight DB counter:

```ts
async function checkAiRateLimit(userId: string, limitPerHour = 20): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000)
  const count = await prisma.aiUsage.count({
    where: { userId, createdAt: { gte: since } },
  })
  return count < limitPerHour
}
```

Requires a lightweight `AiUsage` model in Prisma: `{ id, userId, feature, createdAt }`.

---

## 6. Pro User Gating

All AI features are Pro-only. Use `getUserProStatus()` from [src/lib/gates.ts](../src/lib/gates.ts):

```ts
const isPro = await getUserProStatus(session.user.id)
if (!isPro) return { success: false as const, error: 'PRO_REQUIRED' }
```

Callers handle `'PRO_REQUIRED'` by redirecting to `/upgrade` — same pattern as the item type gate in [src/actions/items.ts:86-93](../src/actions/items.ts#L86-L93).

---

## 7. Cost Optimization

`gpt-5-nano` pricing: $0.05/1M input tokens, $0.40/1M output tokens — extremely cheap.

- **Cap input**: Slice content before sending. Use 3–4K chars for summaries/tags, 8K for code explanation.
- **Cap output**: Set `max_tokens` tightly per feature (see examples above).
- **Cache results**: Store generated summaries/tags in the DB alongside the item. Don't re-call on every view.
- **No streaming for short outputs**: Streaming has overhead; use non-streaming for outputs under ~200 tokens.
- **Per-user rate limits**: Prevent a single user from consuming disproportionate quota (see §5).
- **Cached input**: At $0.005/1M, consider prompt caching for repeated system prompts if volume grows.

---

## 8. UI Patterns

### Loading state

Show a spinner while pending; disable trigger button to prevent double-submit.

```tsx
const [loading, setLoading] = useState(false)
const [suggestion, setSuggestion] = useState<string | null>(null)

async function handleGenerate() {
  setLoading(true)
  const res = await generateSummary(title, content)
  setLoading(false)
  if (res.success) setSuggestion(res.data)
}
```

### Accept / Reject / Regenerate

Don't auto-apply AI suggestions. Surface with explicit controls.

```tsx
{suggestion && !applied && (
  <div className="rounded-md border p-3 text-sm">
    <p className="mb-2 text-muted-foreground">{suggestion}</p>
    <div className="flex gap-2">
      <Button size="sm" onClick={() => { onApply(suggestion); setApplied(true) }}>Accept</Button>
      <Button size="sm" variant="ghost" onClick={() => setSuggestion(null)}>Reject</Button>
      <Button size="sm" variant="ghost" onClick={handleGenerate}>Regenerate</Button>
    </div>
  </div>
)}
```

### Streaming UI

Append chunks to state as they arrive; show blinking cursor while streaming.

```tsx
const [explanation, setExplanation] = useState('')
const [streaming, setStreaming] = useState(false)

async function handleExplain() {
  setExplanation('')
  setStreaming(true)
  await streamExplanation(code, language, (chunk) => {
    setExplanation((prev) => prev + chunk)
  })
  setStreaming(false)
}

// In JSX: render `explanation` with a markdown renderer
// Add cursor: streaming && <span className="animate-pulse">▍</span>
```

### Error states

Map error codes to user-facing messages:

```ts
const AI_ERROR_MESSAGES: Record<string, string> = {
  PRO_REQUIRED:  'This feature requires a Pro plan.',
  RATE_LIMITED:  'Too many requests. Try again in a moment.',
  INVALID_INPUT: 'Content could not be processed.',
  AI_ERROR:      'AI request failed. Try again.',
}
```

---

## 9. Security Considerations

- **API key**: Set `OPENAI_API_KEY` in `.env.local` / Vercel env vars. Never import it in any `'use client'` file. The singleton in `src/lib/openai.ts` is server-only.
- **Input length limits**: Enforce `max` in Zod schemas and `.slice()` before sending — prevents token bloat and potential abuse.
- **No user-controlled system prompts**: Never interpolate raw user content into the `system` role. User input goes in the `user` role only.
- **Content policy**: Catch `OpenAI.BadRequestError` (400) — returned when content triggers moderation filters.
- **Auth on every call**: Never skip `auth()`. Unauthed calls incur real costs.
- **Server-side only**: All AI calls go through `'use server'` actions or Route Handlers. Never call OpenAI from the browser.

---

## 10. Suggested File Structure

```
src/
  lib/
    openai.ts              # singleton client + AI_MODEL constant
    ai-rate-limit.ts       # per-user hourly rate limit helper
  actions/
    ai.ts                  # generateTags, generateSummary, optimizePrompt
  app/
    api/
      ai/
        explain/
          route.ts         # streaming code explanation Route Handler
```
