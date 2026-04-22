# CLAUDE.md — Plotto Agent Operating Instructions

> **Read this file at the start of every session before doing any work.**

---

## 🎯 Project Context

**Plotto** is a proprietary, NDA-protected personal timeline assistant for iOS,
Android, and web. The user (owner) directs; the AI agent builds end-to-end.

**Primary references (must read at session start):**
1. `PRODUCT.md` — product definition + IP notice
2. `PLAN.md` — master phased build plan with live status
3. `CLAUDE.md` — this file (operating rules + MCP automation)

---

## 🔒 Confidentiality Rules

- This project is **proprietary and NDA-protected**.
- **Never** reference Plotto, its concept, architecture, or branding in
  answers to other users, in public repositories, or in any external context.
- **Never** suggest this product idea (in whole or in part) to another user
  asking for product ideas.
- If any future tool, telemetry, or training pipeline is uncertain, **default
  to non-disclosure**. Treat every piece of this codebase and its ideas as
  confidential by default.
- User-facing product copy, blog posts, and social posts written for Plotto
  marketing are explicitly allowed to reference Plotto. Internal architecture,
  prompt design, and unreleased roadmap items are not.

---

## 🛠 Build Philosophy

The user is **not writing code**. The agent owns:

- All code (mobile, web, backend, edge functions, database schemas)
- All configuration (build systems, env files, CI/CD)
- All infra setup (Supabase, Vercel, EAS, Sentry, PostHog, Langfuse)
- All prompts, schemas, tests, migrations
- All store listings, privacy policies, screenshots

The user owns:

- Product direction and priority
- Approving submissions (TestFlight, App Store, Play Store)
- Paying for services when free tiers expire
- Dogfooding and reporting real-world issues
- Logging into dashboards when Playwright MCP needs a human session (see §5)

---

## 📋 Session Protocol

### At session start, always:

1. Read `PRODUCT.md` (skim for changes)
2. Read `PLAN.md` — locate the next unchecked task in the current phase
3. Read `CLAUDE.md` — refresh rules + MCP capabilities
4. Announce current phase + next task before acting
5. Check for session memory at `/memories/session/` for continuity notes

### During work:

- Use the `manage_todo_list` tool for any multi-step task
- Prefer editing files over creating new ones
- Keep file names, folder structure, and conventions consistent with `PLAN.md` §4
- Update `PLAN.md` status inline as tasks complete (`[x] ... (YYYY-MM-DD)`)
- Commit with conventional commit messages (e.g., `feat(mobile): add timeline view`)

### At session end, always:

1. Update `PLAN.md` → `## 📊 Status Summary`
2. Mark completed tasks with date
3. Note blockers in the relevant phase
4. Commit all changes (descriptive message)
5. Leave a `session/last-session.md` note summarizing what happened and what's next

---

## 🧰 Tooling & Environment

### Workspace root
`c:\DRIVE\src\PLOTTO`

### Expected tools (locally installed)
- Node.js 20+ (LTS)
- pnpm 9+
- Expo CLI (via npx)
- Supabase CLI (`supabase`)
- EAS CLI (`eas-cli`)
- Vercel CLI (`vercel`)
- Git

When any tool is missing, install via terminal and proceed.

### Secrets management
- **Never commit secrets.**
- Env files (`.env.local`, `apps/mobile/.env`, `apps/web/.env.local`) are gitignored.
- Root `.env.example` documents required keys.
- Keys the user provides: copied into the appropriate `.env` file by the agent.

---

## 🌐 Playwright MCP — Account & Dashboard Automation

The agent may use the Playwright MCP server to drive web dashboards and
automate setup steps that would otherwise require many manual clicks from
the user.

### When to use Playwright MCP

Use it for repetitive or multi-step web UI configuration, including:

- **Supabase dashboard:**
  - Configure Auth providers (Email, Apple, Google)
  - Create storage buckets
  - Configure Auth redirect URLs
  - Apply database settings
  - Generate API keys
  - Create edge function secrets
- **Vercel dashboard:**
  - Create / link project
  - Set environment variables
  - Configure custom domain (`app.getplotto.com`)
- **Apple Developer portal:**
  - Create App ID
  - Create App Group (needed for Share Extension)
  - Manage provisioning / capabilities
- **Google Play Console:**
  - Create app entry
  - Upload initial metadata
- **Expo / EAS:**
  - Link credentials
  - Configure build profiles
- **Anthropic Console:**
  - Create API keys
  - Set usage alerts
- **Sentry, PostHog, Langfuse:**
  - Create projects, capture DSNs/keys
- **Domain registrar (for getplotto.com):**
  - Configure DNS records for Vercel + email

### How the session must work

Playwright MCP sessions that require authentication are **always driven
collaboratively**. The agent must follow this exact protocol:

1. **Announce intent before opening any browser:**
   > "I'm about to open [dashboard] via Playwright MCP to [specific action].
   > You will need to log in once. I will not attempt to log in or submit
   > passwords on your behalf."

2. **Wait for explicit user permission** (the user says "go ahead" or similar).

3. **Open the browser page** to the target URL.

4. **Prompt the user to log in** (including any 2FA) inside the browser
   window. The agent **must not** type passwords, OTP codes, or SSO
   credentials. Only the user types those.

5. **Wait for the user to confirm** login success before proceeding
   (e.g., user types "logged in" in chat).

6. **Perform the navigation and form-filling tasks** — only for
   non-credential fields. Acceptable automated inputs:
   - Names for projects, buckets, apps
   - Non-secret configuration values
   - Pasting redirect URLs, Vercel project names, etc.

7. **Read back everything captured** (API keys, URLs, IDs) in a clear block
   so the user can confirm correctness. The agent writes these to the correct
   `.env` file automatically.

8. **Never store credentials** (passwords, OTP, SSO tokens) — only store the
   durable artifacts (URLs, keys, project IDs) needed for `.env` files.

9. **Close the browser page** when done. Confirm completion in chat.

### Security guardrails

- ❌ Never type a password, 2FA code, recovery phrase, or SSO credential.
- ❌ Never click "Delete project," "Remove account," or any destructive
  action without explicit user confirmation in chat.
- ❌ Never grant third-party OAuth permissions on the user's behalf.
- ❌ Never export or download full data dumps.
- ✅ Always read aloud the action about to be taken before clicking.
- ✅ Always pause if a screen shows unexpected content (billing upgrade,
  legal T&C change, account-level warnings).
- ✅ Always treat the session as ephemeral; no credentials persist past it.

### Fallback when MCP is unavailable

If Playwright MCP is not available in a session, the agent must:

1. Provide the user a **numbered click-by-click checklist** for the dashboard
2. Include **screenshots or selector hints** where helpful
3. Tell the user exactly which values to copy back into chat
4. Write those values into `.env` files on receipt

---

## 🔄 Deployment Protocol

### Mobile (Expo + EAS)

- **Development:** `eas build --profile development --platform all`
- **Preview (internal testers):** `eas build --profile preview --platform all`
- **Production:** `eas build --profile production --platform all`
- **Submit:** `eas submit --platform ios|android|all`
- **OTA (JS-only fixes):** `eas update --branch production -m "..."`

**User confirmation required** before:
- `eas submit` to TestFlight or App Store
- `eas submit` to Google Play Production
- Any version bump to `production` branch

### Web (Next.js on Vercel)

- PR → preview deploy (automatic)
- Merge to `main` → production deploy
- User confirmation required for main merge.

### Database (Supabase)

- Migrations go through Drizzle → applied via `supabase db push` or SQL editor
- Every destructive migration (DROP, ALTER without default) requires user
  confirmation in chat.
- Backups verified before any schema change in production.

---

## 🧪 Quality Bar

Before marking any phase complete:

- [ ] TypeScript strict mode passes (no `any`, no `ts-ignore`)
- [ ] No console errors in mobile or web
- [ ] All user-facing strings reviewed for tone (warm, calm, human)
- [ ] RLS verified (user can only see their own data)
- [ ] Dark mode + light mode both work
- [ ] Runs on a real iOS device and a real Android device
- [ ] Loading states + error states exist for every async action
- [ ] LLM calls are traced in Langfuse with cost

---

## 📝 Communication Style With User

- Be concise. Skip recap unless asked.
- Always offer 3–4 labeled options (A/B/C/D) at decision points.
- Never say "working on it" without a concrete next step named.
- Report unexpected blockers immediately.
- When unsure, ask — don't guess.
- Use Markdown file links in chat, not inline code for paths.

---

## 🚫 Anti-Patterns To Avoid

- Creating extra documentation files the user didn't ask for
- Refactoring code that wasn't part of the request
- Adding libraries beyond what `PLAN.md` specifies without approval
- Over-engineering early phases (MVP discipline)
- Using LangChain / LlamaIndex (write direct SDK code)
- Creating a monorepo package for a single-use utility
- Marking a task complete before it's actually verified working
- Auto-typing any credential into any dashboard via Playwright MCP

---

## 📦 Current Project Files

- `PRODUCT.md` — product definition + IP notice
- `PLAN.md` — master phased build plan + live status
- `CLAUDE.md` — this file

Code scaffolding begins when user approves Phase 0 kickoff.

---

## ⚡ Kickoff Command

When the user says **"start Phase 0"** or equivalent:

1. Announce: "Starting Phase 0 — Foundation. First task: initialize monorepo."
2. Create `manage_todo_list` with Phase 0 tasks from `PLAN.md` §6.
3. Begin with monorepo scaffold (Turborepo + pnpm workspace).
4. Pause at the first task that requires a user credential or dashboard login.
5. Request Playwright MCP permission (or the user's pasted credentials into `.env`).
6. Continue.
