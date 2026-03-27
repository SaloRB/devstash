# Auth Security Review

**Last audit:** 2026-03-26
**Audited by:** auth-auditor agent
**Scope:** NextAuth v5 + custom auth API routes

---

## Findings

### [HIGH] No rate limiting on forgot-password endpoint — email bombing

**File:** `src/app/api/auth/forgot-password/route.ts` (entire route)
**Issue:** Any unauthenticated caller can POST to `/api/auth/forgot-password` unlimited times with a victim's email address. There is no IP-based throttle, no per-email cooldown, and no account lockout. NextAuth v5 does not provide rate limiting for custom API routes.
**Risk:** An attacker can flood a target user's inbox with password reset emails. At scale this doubles as a denial-of-service against the email sending quota (Resend free tier). No valid account takeover path, but high annoyance/harassment potential and potential service disruption.
**Fix:** Apply an edge-compatible rate limiter (e.g., `@upstash/ratelimit` + Upstash Redis) keyed on `X-Forwarded-For` IP. Recommended limit: 3–5 requests per IP per 15-minute window. Example guard at the top of the handler:
```ts
const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
const { success } = await ratelimit.limit(ip)
if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
```

---

### [HIGH] No rate limiting on credentials sign-in — brute force

**File:** `src/auth.ts` (lines 39–55, `authorize` function)
**Issue:** The `authorize` callback performs an unbounded bcrypt compare on every POST to NextAuth's `/api/auth/callback/credentials`. NextAuth v5 has no built-in rate limiting or account lockout for the credentials provider (confirmed by upstream maintainers and GitHub issue #12288). The route is unauthenticated by definition.
**Risk:** An attacker who knows a valid email can make unlimited password attempts. bcrypt cost 10 adds CPU cost per attempt but does not prevent parallelized offline-style attacks against this live endpoint. An 8-character password (minimum enforced in `change-password` but not in `register`) is guessable given sufficient time.
**Fix:** Rate-limit the NextAuth route handler at the middleware or edge level. The cleanest approach wraps the NextAuth handler via Arcjet or an Upstash ratelimit in `src/app/api/auth/[...nextauth]/route.ts`, keyed on IP, max ~10 attempts per minute. Consider also adding account lockout logic inside `authorize` (e.g., a `failedAttempts` + `lockedUntil` field on the user record).

---

### [MEDIUM] No server-side password length enforcement in register or reset-password

**File:** `src/app/api/auth/register/route.ts` (line 24), `src/app/api/auth/reset-password/route.ts` (line 22)
**Issue:** `register/route.ts` hashes and stores whatever password is submitted — there is no minimum length check server-side. `reset-password/route.ts` has the same gap. `change-password/route.ts` correctly enforces `newPassword.length < 8` (line 18), but this protection is absent from the other two password-writing paths. Client-side validation in the React forms is bypassed trivially with a direct HTTP request.
**Risk:** Users can register or reset to a 1-character password, which an attacker can brute-force near-instantly via the sign-in endpoint, especially compounded by the missing rate limit above.
**Fix:** Add an identical server-side guard to both routes before hashing:
```ts
if (password.length < 8) {
  return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
}
```
Consider raising the minimum to 12 characters across all three routes for consistency.

---

### [MEDIUM] No rate limiting on change-password — brute-force current password while authenticated

**File:** `src/app/api/auth/change-password/route.ts` (entire route)
**Issue:** The endpoint correctly requires a valid session, so the attack surface is limited to authenticated callers. However there is no limit on how many times a session holder can call this endpoint with different `currentPassword` values. An attacker who has stolen a session token (e.g., via XSS or network interception) can brute-force the current password to confirm it before reuse on other services.
**Risk:** Credential confirmation without lockout. Requires a prior session compromise, so severity is MEDIUM rather than HIGH.
**Fix:** Rate-limit per `session.user.id`: e.g., 5 failed attempts per 10 minutes before returning 429. Track failed attempts in Redis or a DB field.

---

### [MEDIUM] No rate limiting on register — account/resource abuse

**File:** `src/app/api/auth/register/route.ts` (entire route)
**Issue:** No IP or email-domain throttle on account creation. An attacker can create thousands of accounts in seconds, each triggering a Resend email send and a DB write.
**Risk:** Exhausts the Resend free-tier send quota, pollutes the user table, and creates accounts that could be used for spam or abuse within the app.
**Fix:** Apply IP-keyed rate limiting (e.g., 5 registrations per IP per hour). Optionally add email domain allowlisting or a CAPTCHA challenge.

---

### [LOW] Cross-type token confusion — verify-email accepts reset tokens

**File:** `src/app/api/auth/verify-email/route.ts` (lines 11–25)
**Issue:** The endpoint looks up any `verificationToken` by raw `token` value and then calls `prisma.user.update({ where: { email: record.identifier } })`. It does not check that `record.identifier` does NOT start with `reset:`. If an attacker submits a valid reset token to this endpoint, the `prisma.user.update` will fail with a Prisma "record not found" error (no user has email `reset:foo@example.com`), which is an unhandled exception — and the reset token will NOT be deleted because the delete only runs after a successful update. However, the unhandled Prisma exception would propagate as a 500 and the token survives, so no actual "token burning" of the victim's reset link occurs.
**Risk:** If Prisma throws, Next.js returns a 500 response and the token is left intact. No account takeover vector. The risk is a confusing error UX and slightly wider attack surface if the error handling ever changes.
**Fix:** Add an explicit namespace check before the user update:
```ts
if (record.identifier.startsWith('reset:')) {
  await prisma.verificationToken.delete({ where: { token } })
  return NextResponse.redirect(new URL('/sign-in?error=invalid_token', req.url))
}
```

---

### [LOW] No input validation library — type coercion risk on all API routes

**File:** All routes under `src/app/api/auth/` and `src/app/api/user/`
**Issue:** All routes call `await req.json()` and destructure fields directly with no schema validation (no Zod, no manual type checks beyond presence). Passing a non-string value for `email` (e.g., an array or object) will reach Prisma as-is, which may throw opaque errors, produce unexpected behavior, or (in edge cases with future Prisma versions) behave differently than expected. There is no Zod or equivalent schema guard on any route.
**Risk:** Unexpected types will cause Prisma to throw rather than silently misbehave with current Prisma versions, so the immediate practical risk is low. However the absence of schema validation makes the codebase fragile against API contract changes and reduces defense-in-depth.
**Fix:** Add Zod schemas at the top of each route and use `safeParse`. Example for `register/route.ts`:
```ts
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
})
const parsed = schema.safeParse(await req.json())
if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
```

---

*(ordered CRITICAL → HIGH → MEDIUM → LOW)*

---

## Passed Checks

Security practices already correctly implemented:

- **bcrypt used in all password-writing paths** — `register/route.ts` line 24, `reset-password/route.ts` line 22, `change-password/route.ts` line 36 all use `bcrypt.hash(password, 10)`. Cost factor is 10, meeting the minimum acceptable threshold.
- **bcrypt.compare for verification** — `src/auth.ts` line 48 and `change-password/route.ts` line 31 both use `bcrypt.compare`; no plain equality comparison.
- **CSPRNG for all tokens** — `randomBytes(32)` from Node's `crypto` module is used in both `register/route.ts` (line 35) and `forgot-password/route.ts` (line 25). No `Math.random` usage anywhere in the auth flow.
- **Email verification token expiry** — 24-hour window set in `register/route.ts` line 36. Reasonable.
- **Email verification token single-use** — `verify-email/route.ts` line 25 deletes the token immediately after a successful user update.
- **Reset token expiry** — 1-hour window in `forgot-password/route.ts` line 26. Appropriate for password reset.
- **Reset token single-use** — `reset-password/route.ts` line 29 deletes the token on successful use.
- **Reset token deleted before re-issue** — `forgot-password/route.ts` lines 21–23 call `deleteMany` on the old `reset:{email}` token before creating a new one. No token accumulation.
- **Anti-enumeration on forgot-password** — `forgot-password/route.ts` lines 16–18 return `{ ok: true }` for non-existent emails, identical to the success response.
- **Reset tokens namespaced from verification tokens** — `reset:` prefix on `identifier` in `forgot-password/route.ts` line 29; `reset-password/route.ts` line 14 verifies the prefix before proceeding.
- **`verify-email` rejects expired tokens and cleans up** — lines 13–17 check `record.expires < new Date()` and delete the expired record before redirecting.
- **Session enforced before all DB writes on authenticated routes** — `change-password/route.ts` line 7 and `delete-account/route.ts` line 6 both call `auth()` as the first operation; all subsequent DB queries use `session.user.id` as the key, never a user-supplied value.
- **Profile page double-protected** — `proxy.ts` blocks unauthenticated access to `/profile` at the middleware layer (line 11), and `profile/page.tsx` line 18–19 independently calls `auth()` and redirects if no session. All DB calls on the page pass `session.user.id` (lines 22–23).
- **All profile DB queries scoped to session user** — `getProfileUser` and `getProfileStats` in `src/lib/db/profile.ts` both accept `userId` from the server component, which sources it exclusively from `session.user.id`.
- **Redirect callback is safe from open redirect** — `src/auth.ts` lines 18–21: the callback falls through to `${baseUrl}/dashboard` for any URL that does not strictly start with `baseUrl`. Protocol-relative URLs (e.g., `//evil.com`) do not start with `https://yourdomain.com` and are caught. No bypass identified.
- **NextAuth v5 CSRF, cookie security, OAuth state/PKCE, JWT signing** — handled automatically by the framework; not re-audited per scope.
