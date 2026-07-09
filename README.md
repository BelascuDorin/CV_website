# CV_website
Structures my experience and ongoing work — a single scrolling page built spec-first with AI agents.

**Live:** deployed on Vercel (connect repo to see URL) · **Stack:** Next.js 16 (App Router) + Tailwind CSS + TypeScript

---

## Current state

The full page is implemented and deployed. All content is placeholder — replace the data files before going live.

### What's built

| Section | Status | Source file |
|---|---|---|
| Sticky Navigation + scroll-spy | ✅ | `components/Navigation.tsx` |
| Hero (photo, name, role, bio) | ✅ | `components/sections/Hero.tsx` |
| Now Section (employment, side projects, self-development) | ✅ | `components/sections/NowSection.tsx` |
| Experience timeline | ✅ | `components/sections/ExperienceSection.tsx` |
| Skills accordion + Proof Cards | ✅ | `components/sections/SkillsSection.tsx` |
| Contact (email, LinkedIn, GitHub, PDF download) | ✅ | `components/sections/ContactSection.tsx` |
| Typed data layer | ✅ | `data/` |
| SEO metadata + OpenGraph | ✅ | `app/layout.tsx` |

### Before going live — fill in the placeholders

1. **`data/experience.ts`** — replace the three placeholder roles with your actual work history
2. **`data/skills.ts`** — replace placeholder Skill Proofs with real outcomes and real URLs
3. **`data/now.ts`** — add your Grubhub description and self-development items
4. **`data/hero.ts`** — finalise the About bio (currently placeholder copy)
5. **`public/cv-dorin-belascu.pdf`** — drop your PDF CV here
6. **`data/contact.ts`** — verify LinkedIn URL slug is correct

### Known issues from `/code-review` (to fix before launch)

| Finding | Axis | Priority |
|---|---|---|
| `SectionHeader` duplicated across 4 section files | Standards | Medium — extract to `components/SectionHeader.tsx` |
| US-17: Proof Card collapse is at Skill level, not per-card | Spec | Medium — add per-card expand/collapse |
| US-22: Mobile nav overflows on small screens | Spec | High — add collapsed/hamburger treatment |
| Hero renders contact links not asked for in spec | Spec (scope creep) | Low — remove or keep as UX improvement |
| US-4: About bio is one sentence, spec asks for 2–3 | Spec | Low — fix when writing final copy |

---

## How this was developed

Built with AI agents as the primary driver for architecture and decision-making. Every decision was spec-first — no code was written before the domain model and PRD were complete.

### Step 1 — Domain modelling (`/grill-with-docs`)

A structured interview skill stress-tests plans against a domain model before writing a line of code. All key decisions were resolved through a grilling session and captured in `CONTEXT.md`.

Decisions locked in: Next.js + Tailwind, single scrolling page, Hero → Now → Experience → Skills → Contact, sticky scroll-spy nav, accordion Proof Cards, vertical timeline Experience, light mode only, typed static data layer.

### Step 2 — PRD (`/to-prd`)

The grilling output was synthesised into a full PRD — 25 user stories, 8 modules, explicit out-of-scope list. Published as [Issue #1](https://github.com/BelascuDorin/CV_website/issues/1) with the `ready-for-agent` label.

### Step 3 — Vertical slices (`/to-issues`)

The PRD was broken into 8 independently-grabbable issues ([#2](https://github.com/BelascuDorin/CV_website/issues/2)–[#9](https://github.com/BelascuDorin/CV_website/issues/9)) using tracer-bullet vertical slices.

### Step 4 — Implementation (`/implement`)

All 8 issues implemented sequentially then all sections in parallel. Each commit closes its issue.

### Step 5 — Code review (`/code-review`)

Two-axis review (Standards + Spec) run against the full diff. Findings logged in the table above.

### Agent skills installed

Full build chain in `.agents/skills/`:

| Skill | Purpose |
|---|---|
| `grill-with-docs` | Stress-test a plan and build the domain model |
| `grilling` | Relentless one-question-at-a-time interview |
| `domain-modeling` | Maintain `CONTEXT.md` and ADRs inline |
| `setup-matt-pocock-skills` | Configure issue tracker, triage labels, domain docs |
| `to-prd` | Synthesise context into a PRD and publish to GitHub Issues |
| `to-issues` | Break a PRD into vertical-slice GitHub issues |
| `implement` | Implement issues with TDD at agreed seams |
| `code-review` | Two-axis review: Standards + Spec, run as parallel sub-agents |
